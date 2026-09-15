import pandas as pd
import os

def process_jobs_data():
    """Lê os dados brutos de múltiplas fontes (Gupy e LinkedIn), consolida, limpa e padroniza."""
    gupy_path = "data/raw/gupy_brutas.csv"
    linkedin_path = "data/raw/linkedin_brutas.csv"
    output_path = "data/processed/vagas_tratadas.csv"
    
    print("🧹 Iniciando a consolidação e limpeza dos dados...")
    
    dfs = []
    
    # 1. Lê os dados da Gupy se existirem
    if os.path.exists(gupy_path):
        df_gupy = pd.read_csv(gupy_path)
        dfs.append(df_gupy)
    
    # 2. Lê os dados do LinkedIn se existirem
    if os.path.exists(linkedin_path):
        df_linkedin = pd.read_csv(linkedin_path)
        dfs.append(df_linkedin)
        
    if not dfs:
        print("❌ Nenhum arquivo de dados brutos encontrado.")
        return

    # 3. Une todas as fontes em um único DataFrame
    df_combined = pd.concat(dfs, ignore_index=True)
    
    # 4. Limpeza e tratamento básico
    df_combined = df_combined.drop_duplicates(subset=["titulo_vaga", "empresa"])
    df_combined.columns = [col.strip().lower() for col in df_combined.columns]
    
    if "titulo_vaga" in df_combined.columns:
        df_combined["titulo_vaga"] = df_combined["titulo_vaga"].str.strip()

    # 5. Salva o resultado consolidado
    os.makedirs("data/processed", exist_ok=True)
    df_combined.to_csv(output_path, index=False)
    
    print(f"✨ Dados consolidados salvos com sucesso em {output_path}!")
    print(f"📊 Total de registros únicos processados: {len(df_combined)}")