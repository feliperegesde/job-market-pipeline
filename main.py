import asyncio
from src.gupy_scraper import scrape_gupy
from src.linkedin_scraper import scrape_linkedin
from src.parser import process_jobs_data
from src.analyzer import analyze_jobs # <-- Importando o novo módulo

async def main():
    print("========================================")
    print("  INICIANDO PIPELINE MULTI-FONTE")
    print("========================================")
    
    print("\n Coletando vagas na Gupy...")
    await scrape_gupy("Ciência de Dados")
    
    print("\n Coletando vagas no LinkedIn...")
    await scrape_linkedin("Python")
    
    print("\n[Passo 3/4] Consolidando e limpando os dados...")
    process_jobs_data()
    
    print("\n[Passo 4/4] Analisando dados e gerando insights...")
    analyze_jobs() # <-- Executando a análise
    
    print("\n========================================")
    print(" PIPELINE CONCLUÍDO COM SUCESSO!")
    print("========================================")

asyncio.run(main())