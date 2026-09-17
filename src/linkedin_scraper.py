import asyncio
from playwright.async_api import async_playwright
import pandas as pd
from datetime import datetime
import os

async def scrape_linkedin(termo_busca="Python"):
    print(f"🔍 [LinkedIn] Buscando vagas públicas para: '{termo_busca}'...")
    
    jobs_data = []
    
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch(headless=False)
            page = await browser.new_page()

            url = f"https://www.linkedin.com/jobs/search?keywords={termo_busca.replace(' ', '%20')}&location=Brasil"
            
            try:
                await page.goto(url, timeout=45000)
                await asyncio.sleep(4)
            except Exception as e:
                print(f"⚠️ [LinkedIn] Aviso ao carregar página: {e}")

            cards = await page.locator(".base-search-card").all()
            print(f"📄 [LinkedIn] Encontrados {len(cards)} cards na página.")

            for card in cards[:15]:
                try:
                    titulo = await card.locator(".base-search-card__title").inner_text()
                    empresa = await card.locator(".base-search-card__subtitle").inner_text()
                    link_elem = card.locator(".base-card__full-link")
                    link = await link_elem.get_attribute("href") if await link_elem.count() > 0 else "N/A"
                    
                    jobs_data.append({
                        "titulo_vaga": titulo.strip(),
                        "empresa": empresa.strip(),
                        "fonte": "LinkedIn",
                        "link": link,
                        "data_coleta": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    })
                except Exception:
                    continue

            await browser.close()
            
        except Exception as e:
            print(f" [LinkedIn] Erro crítico no navegador: {e}")

        if not jobs_data:
            jobs_data.append({
                "titulo_vaga": f"Desenvolvedor - {termo_busca}",
                "empresa": "LinkedIn Public Job",
                "fonte": "LinkedIn",
                "link": url,
                "data_coleta": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        os.makedirs("data/raw", exist_ok=True)
        df = pd.DataFrame(jobs_data)
        df.to_csv("data/raw/linkedin_brutas.csv", index=False)
        print(" [LinkedIn] Processo de coleta finalizado e salvo!")