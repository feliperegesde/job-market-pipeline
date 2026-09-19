import os
import pandas as pd
import re

def classificar_senioridade(titulo):
    titulo_lower = str(titulo).lower()
    if any(k in titulo_lower for k in ['estágio', 'estagio', 'intern', 'trainee']):
        return 'Estágio'
    elif any(k in titulo_lower for k in ['júnior', 'junior', 'jr']):
        return 'Junior'
    elif any(k in titulo_lower for k in ['pleno', 'mid', 'ii', 'med']):
        return 'Pleno'
    elif any(k in titulo_lower for k in ['sênior', 'senior', 'sr', 'lead', 'principal', 'head', 'architect']):
        return 'Senior'
    return 'Não Especificado'

def process_jobs_data():
    """Lê os dados brutos de múltiplas fontes, padroniza textos, remove nulos e consolida."""
    gupy_path = "data/raw/gupy_brutas.csv"
    linkedin_path = "data/raw/linkedin_brutas.csv"
    output_path = "data/processed/vagas_tratadas.csv"
    
    print("🧹 Iniciando o processamento, limpeza e padronização avançada...")
    
    dfs = []
    
    # 1. Leitura segura dos arquivos brutos
    if os.path.exists(gupy_path):
        try:
            df_gupy = pd.read_csv(gupy_path)
            dfs.append(df_gupy)
        except Exception as e:
            print(f"⚠️ Erro ao ler CSV da Gupy: {e}")
            
    if os.path.exists(linkedin_path):
        try:
            df_linkedin = pd.read_csv(linkedin_path)
            dfs.append(df_linkedin)
        except Exception as e:
            print(f"⚠️ Erro ao ler CSV do LinkedIn: {e}")
        
    if not dfs:
        print("❌ Nenhum arquivo de dados brutos válido foi encontrado.")
        return

    # 2. Consolidação das fontes
    df_combined = pd.concat(dfs, ignore_index=True)
    
    # 3. Tratamento de Valores Nulos (Missing Values)
    if "titulo_vaga" in df_combined.columns:
        df_combined = df_combined.dropna(subset=["titulo_vaga"])
        df_combined["empresa"] = df_combined["empresa"].fillna("Não informada")
        df_combined["link"] = df_combined["link"].fillna("N/A")
    
    # 4. Padronização Avançada de Texto
    df_combined["titulo_vaga"] = df_combined["titulo_vaga"].astype(str).str.strip()
    df_combined["empresa"] = df_combined["empresa"].astype(str).str.strip()
    
    # Padronização de colunas 
    df_combined.columns = [col.strip().lower() for col in df_combined.columns]
    
    # 5. Remoção Inteligente de Duplicadas
    df_combined = df_combined.drop_duplicates(subset=["titulo_vaga", "empresa"], keep="first")

    # 6. Classificação Automática de Senioridade
    df_combined["nivel"] = df_combined["titulo_vaga"].apply(classificar_senioridade)

    # 7. Salvamento na pasta processada
    os.makedirs("data/processed", exist_ok=True)
    df_combined.to_csv(output_path, index=False)
    
    print(f"✨ Dados limpos e padronizados salvos com sucesso em {output_path}!")
    print(f"📊 Total final de registros únicos tratados: {len(df_combined)}")