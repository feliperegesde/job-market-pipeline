import sys
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from fastapi import Body
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from src.gupy_scraper import scrape_gupy
from src.linkedin_scraper import scrape_linkedin
from src.parser import process_jobs_data
from fastapi import File, UploadFile, Form
from pypdf import PdfReader
import io

app = FastAPI(title="Job Market API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def run_pipeline(termo: str):
    # Roda as tarefas assíncronas de forma segura isolando o loop do Windows
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, lambda: asyncio.run(scrape_gupy(termo)))
    await loop.run_in_executor(None, lambda: asyncio.run(scrape_linkedin(termo)))
    process_jobs_data()

@app.post("/api/scrape")
async def trigger_scrape(termo: str = "Ciência de Dados", pais: str = "Brasil"):
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, lambda: asyncio.run(scrape_gupy(termo)))
        await loop.run_in_executor(None, lambda: asyncio.run(scrape_linkedin(termo, pais)))
        process_jobs_data()
        return {"message": f"Coleta concluída para '{termo}' em '{pais}'"}
    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/api/jobs")
def get_jobs():
    path = "data/processed/vagas_tratadas.csv"
    if os.path.exists(path):
        df = pd.read_csv(path)
        return df.to_dict(orient="records")
    return []

#teste de uma IA para testar match com as vagas listadas
@app.post("/api/match")
async def calculate_match(
    curriculo_texto: str = Form(None), 
    file: UploadFile = File(None)
):
    texto_final = ""
    
    if file and file.filename.endswith(".pdf"):
        try:
            contents = await file.read()
            pdf_file = io.BytesIO(contents)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    texto_final += extracted + "\n"
        except Exception as e:
            print(f"Erro ao ler PDF: {e}")
            
    elif curriculo_texto:
        texto_final = curriculo_texto
        
    path = "data/processed/vagas_tratadas.csv"
    if not os.path.exists(path) or not texto_final.strip():
        if os.path.exists(path):
            df = pd.read_csv(path)
            return df.to_dict(orient="records")
        return []
    
    df = pd.read_csv(path)
    if df.empty:
        return []
    
    # Prepara o texto da vaga combinando título, empresa e nível se houver
    df["texto_vaga"] = df["titulo_vaga"].fillna("") + " " + df["empresa"].fillna("") + " " + df.get("nivel", pd.Series([""]*len(df))).fillna("")
    vagas_textos = df["texto_vaga"].tolist()
    
    documents = [texto_final] + vagas_textos
    
    # Usando min_df=1 para garantir que capture bem as palavras do currículo e títulos
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    
    try:
        tfidf_matrix = vectorizer.fit_transform(documents)
        cosine_annies = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        
        # Normalização inteligente: se houver valores, escalona para uma faixa útil (ex: 30% a 98%)
        max_score = cosine_annies.max()
        min_score = cosine_annies.min()
        
        if max_score > min_score:
            # Normaliza o score bruto para uma base percentual mais intuitiva na UI
            normalized = (cosine_annies - min_score) / (max_score - min_score)
            # Garante uma base mínima de relevância e escala até 98%
            df["match_score"] = (35 + (normalized * 63)).round(1)
        else:
            df["match_score"] = 50.0
            
        df = df.sort_values(by="match_score", ascending=False)
        
        return df.to_dict(orient="records")
    except Exception as e:
        print(f"Erro no cálculo de match: {e}")
        df["match_score"] = 50.0
        return df.to_dict(orient="records")