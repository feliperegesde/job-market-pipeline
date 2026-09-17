import asyncio
from src.gupy_scraper import scrape_gupy
from src.linkedin_scraper import scrape_linkedin
from src.parser import process_jobs_data
from src.analyzer import analyze_jobs

async def main():
    print("="*50)
    print("  🚀 PIPELINE MULTI-FONTE DE VAGAS (TERMINAL)")
    print("="*50 + "\n")
    
    termo = "Ciência de Dados"  # Termo padrão para execução via terminal
    print(f"🎯 Executando pipeline para o termo padrão: '{termo}'\n")

    print("--- PASSO 1: INGESTÃO E COLETA ---")
    await scrape_gupy(termo)
    await scrape_linkedin(termo)
    
    print("\n--- PASSO 2: PROCESSAMENTO E ETL ---")
    process_jobs_data()
    
    print("\n--- PASSO 3: ANÁLISE DE MERCADO ---")
    analyze_jobs()
    
    print("\n" + "="*50)
    print("✨ PIPELINE CONCLUÍDO COM SUCESSO!")
    print("="*50)

if __name__ == "__main__":
    asyncio.run(main())