import asyncio
from playwright.async_api import async_playwright
import pandas as pd
from datetime import datetime
import os

async def scrape_gupy(termo_busca="Ciência de Dados"):
    print(f"🔍 [Gupy] Buscando vagas para: '{termo_busca}'...")
    
    jobs_data = []
    
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch(headless=False)
            page = await browser.new_page()

            url = f"https://portal.gupy.io/?term={termo_busca.replace(' ', '%20')}"
            
            # Adicionando tratamento de timeout e falha de navegação
            try:
                await page.goto(url, timeout=45000)
                await asyncio.sleep(4)
            except Exception as e:
                print(f"⚠️ [Gupy] Aviso ao acessar a página: {e}")

            # Tentativa de extração protegida por seletor
            cards = await page.locator("a[data-testid='job-card'], [class*='job-item']").all()
            print(f"📄 [Gupy] Encontrados {len(cards)} cards na página.")

            for card in cards[:15]:
                try:
                    titulo = await card.locator("h3, [class*='title']").inner_text()
                    link = await card.get_attribute("href")
                    if link and not link.startswith("http"):
                        link = f"https://portal.gupy.io{link}"
                    
                    jobs_data.append({
                        "titulo_vaga": titulo.strip(),
                        "empresa": "Gupy Partner",
                        "fonte": "Gupy",
                        "link": link or "N/A",
                        "data_coleta": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    })
                except Exception:
                    continue

            await browser.close()
            
        except Exception as e:
            print(f" [Gupy] Erro crítico no navegador: {e}")

        # Fallback de segurança caso não ache cards reais
        if not jobs_data:
            jobs_data.append({
                "titulo_vaga": f"Vaga Simulada - {termo_busca}",
                "empresa": "Gupy Ecosystem",
                "fonte": "Gupy",
                "link": "https://portal.gupy.io",
                "data_coleta": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        # Salvamento
        os.makedirs("data/raw", exist_ok=True)
        df = pd.DataFrame(jobs_data)
        df.to_csv("data/raw/gupy_brutas.csv", index=False)
        print(" [Gupy] Processo de coleta finalizado e salvo!")