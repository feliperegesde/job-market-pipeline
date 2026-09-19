import asyncio
from playwright.async_api import async_playwright
import pandas as pd
import os

async def scrape_gupy(termo: str = "Ciência de Dados"):
    print(f"🔍 [Gupy] Buscando vagas no Brasil para: '{termo}'...")
    url = f"https://portal.gupy.io/jobSearch?term={termo}"
    
    vagas = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            await page.goto(url, timeout=60000)
            await page.wait_for_timeout(4000)
            
            cards = await page.locator("[data-testid='job-card']").all()
            if not cards:
                cards = await page.locator("a[href*='/job/']").all()

            for card in cards[:25]:
                try:
                    titulo = await card.locator("h3, h4, [data-testid='job-title']").inner_text()
                    empresa = await card.locator("p, [data-testid='company-name']").inner_text()
                    link = await card.get_attribute("href")
                    
                    if link and not link.startswith("http"):
                        link = f"https://portal.gupy.io{link}"
                        
                    vagas.append({
                        "titulo_vaga": titulo.strip(),
                        "empresa": empresa.strip() if empresa else "Gupy Partner",
                        "fonte": "Gupy",
                        "link": link or "N/A",
                        "data_coleta": "2026-09-19"
                    })
                except Exception:
                    continue
                    
        except Exception as e:
            print(f"⚠️ Erro no scraping da Gupy: {e}")
        finally:
            await browser.close()
            
    os.makedirs("data/raw", exist_ok=True)
    df = pd.DataFrame(vagas)
    df.to_csv("data/raw/gupy_brutas.csv", index=False)
    print(f"✅ [Gupy] {len(vagas)} vagas salvas.")