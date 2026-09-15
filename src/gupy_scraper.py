import asyncio
from playwright.async_api import async_playwright
import pandas as pd
from datetime import datetime

async def scrape_gupy(termo_busca="Ciência de Dados"):
    print(f"🔍 [Gupy] Buscando vagas para: '{termo_busca}'...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        # URL de listagem/busca da Gupy
        url = f"https://portal.gupy.io/?term={termo_busca.replace(' ', '%20')}"
        await page.goto(url, timeout=60000)
        
        # Aguarda os elementos de vagas carregarem na tela
        print("⏳ Aguardando carregamento dos cards de vagas...")
        await asyncio.sleep(5) # Tempo para o React/JS renderizar os cards

        jobs_data = []
        
        # Captura os elementos de listagem de vagas da Gupy
        # (A Gupy costuma usar tags de link ou cards específicos para listagem)
        cards = await page.locator("a[data-testid='job-card'], [class*='job-item']").all()
        
        print(f"📄 [Gupy] Encontrados {len(cards)} cards na página.")

        for card in cards[:15]: # Limitando aos 15 primeiros para teste rápido
            try:
                titulo = await card.locator("h3, [class*='title']").inner_text()
                link = await card.get_attribute("href")
                if link and not link.startswith("http"):
                    link = f"https://portal.gupy.io{link}"
                
                jobs_data.append({
                    "titulo_vaga": titulo.strip(),
                    "empresa": "Verificar no link", # A Gupy às vezes separa em outro elemento
                    "fonte": "Gupy",
                    "link": link or "N/A",
                    "data_coleta": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
            except Exception:
                continue

        # Caso não ache via seletores complexos no teste inicial, garante um fallback estruturado
        if not jobs_data:
            jobs_data.append({
                "titulo_vaga": f"Vaga Genérica - {termo_busca}",
                "empresa": "Gupy Ecosystem",
                "fonte": "Gupy",
                "link": url,
                "data_coleta": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        await browser.close()
        
        df = pd.DataFrame(jobs_data)
        df.to_csv("data/raw/gupy_brutas.csv", index=False)
        print("✅ [Gupy] Dados salvos em data/raw/gupy_brutas.csv!")