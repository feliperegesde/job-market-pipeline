import asyncio
from playwright.async_api import async_playwright
import pandas as pd
import os
from datetime import datetime

async def scrape_linkedin(termo: str = "Ciência de Dados", localizacao: str = "Brasil"):
    query_encoded = termo.replace(" ", "%20")
    
    # Define a URL de acordo com a localização escolhida
    if localizacao.lower() == "brasil":
        url = f"https://www.linkedin.com/jobs/search?keywords={query_encoded}&location=Brasil&geoId=106057199&trk=public_jobs_jobs-search-bar_search-submit"
        print(f"🔍 [LinkedIn] Buscando vagas no **Brasil** para: '{termo}'...")
    elif localizacao.lower() == "estados unidos":
        url = f"https://www.linkedin.com/jobs/search?keywords={query_encoded}&location=Estados%20Unidos&geoId=103644278&trk=public_jobs_jobs-search-bar_search-submit"
        print(f"🔍 [LinkedIn] Buscando vagas nos **EUA** para: '{termo}'...")
    else:
        # Global / Sem filtro estrito de país
        url = f"https://www.linkedin.com/jobs/search?keywords={query_encoded}&trk=public_jobs_jobs-search-bar_search-submit"
        print(f"🔍 [LinkedIn] Buscando vagas **Globais** para: '{termo}'...")

    vagas = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            await page.goto(url, timeout=60000)
            await page.wait_for_timeout(4000)
            
            for _ in range(2):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
                await page.wait_for_timeout(2000)
                
            cards = await page.locator(".base-search-card").all()
            if not cards:
                cards = await page.locator(".job-search-card").all()

            for card in cards[:20]:
                try:
                    titulo = await card.locator(".base-search-card__title").inner_text()
                    empresa = await card.locator(".base-search-card__subtitle").inner_text()
                    
                    link_elem = card.locator("a.base-card__full-link")
                    link = await link_elem.get_attribute("href") if await link_elem.count() > 0 else "N/A"
                    
                    vagas.append({
                        "titulo_vaga": titulo.strip(),
                        "empresa": empresa.strip(),
                        "fonte": f"LinkedIn ({localizacao})",
                        "link": link.split("?")[0] if link else "N/A",
                        "data_coleta": datetime.now().strftime("%Y-%m-%d")
                    })
                except Exception:
                    continue
                    
        except Exception as e:
            print(f"⚠️ Erro no scraping do LinkedIn: {e}")
        finally:
            await browser.close()
            
    os.makedirs("data/raw", exist_ok=True)
    df = pd.DataFrame(vagas)
    df.to_csv("data/raw/linkedin_brutas.csv", index=False)
    print(f"✅ [LinkedIn] {len(vagas)} vagas salvas.")