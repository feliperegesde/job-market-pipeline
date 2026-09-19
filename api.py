import sys
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os

from src.gupy_scraper import scrape_gupy
from src.linkedin_scraper import scrape_linkedin
from src.parser import process_jobs_data

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