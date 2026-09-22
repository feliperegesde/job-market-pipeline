import sys
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import json
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
        if "skills_faltantes" not in df.columns:
            df["skills_faltantes"] = [[] for _ in range(len(df))]
        
        records = df.to_dict(orient="records")
        for record in records:
            val = record.get("skills_faltantes")
            if isinstance(val, str):
                try:
                    record["skills_faltantes"] = json.loads(val.replace("'", '"'))
                except:
                    record["skills_faltantes"] = []
            elif not isinstance(val, list):
                record["skills_faltantes"] = []
        return records
    return []

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
            records = df.to_dict(orient="records")
            for r in records:
                r["skills_faltantes"] = []
            return records
        return []
    
    df = pd.read_csv(path)
    if df.empty:
        return []
    
    df["texto_vaga"] = df["titulo_vaga"].fillna("") + " " + df["empresa"].fillna("") + " " + df.get("nivel", pd.Series([""]*len(df))).fillna("")
    vagas_textos = df["texto_vaga"].tolist()
    
    documents = [texto_final] + vagas_textos
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    
    skills_portfolio = ['python', 'sql', 'react', 'aws', 'machine learning', 'java', 'docker', 'typescript', 'node.js', 'pandas', 'fastapi', 'git']
    curriculo_lower = texto_final.lower()
    
    try:
        tfidf_matrix = vectorizer.fit_transform(documents)
        cosine_annies = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        
        max_score = cosine_annies.max()
        min_score = cosine_annies.min()
        
        if max_score > min_score:
            normalized = (cosine_annies - min_score) / (max_score - min_score)
            match_scores = (35 + (normalized * 63)).round(1)
        else:
            match_scores = [50.0] * len(df)
            
        df["match_score"] = match_scores
        
        gaps_list = []
        for texto in vagas_textos:
            texto_l = texto.lower()
            faltantes = [skill.capitalize() for skill in skills_portfolio if skill in texto_l and skill not in curriculo_lower]
            gaps_list.append(faltantes[:3])
            
        df["skills_faltantes"] = gaps_list
        df = df.sort_values(by="match_score", ascending=False)
        
        records = df.to_dict(orient="records")
        for record in records:
            val = record.get("skills_faltantes")
            if isinstance(val, str):
                try:
                    record["skills_faltantes"] = json.loads(val.replace("'", '"'))
                except:
                    record["skills_faltantes"] = []
            elif not isinstance(val, list):
                record["skills_faltantes"] = []
                
        return records
    except Exception as e:
        print(f"Erro no cálculo de match: {e}")
        df["match_score"] = 50.0
        records = df.to_dict(orient="records")
        for r in records:
            r["skills_faltantes"] = []
        return records