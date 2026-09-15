import pandas as pd
import os
from collections import Counter
import re

def analyze_jobs():
    """Analisa as vagas tratadas e extrai insights de mercado (como tecnologias mais pedidas)."""
    input_path = "data/processed/vagas_tratadas.csv"
    
    print("📈 Iniciando a análise de dados e extração de skills...")
    
    if not os.path.exists(input_path):
        print("❌ Arquivo de vagas tratadas não encontrado.")
        return

    df = pd.read_csv(input_path)
    
    if df.empty or "titulo_vaga" not in df.columns:
        print("⚠️ O DataFrame está vazio ou sem a coluna de títulos.")
        return

    # Lista de tecnologias/termos comuns para procurar nos títulos e descrições
    skills_alvo = [
        "Python", "SQL", "AWS", "Machine Learning", "Docker", 
        "React", "FastAPI", "Pandas", "Java", "C++", "Power BI"
    ]
    
    # Juntando todo o texto dos títulos para contagem
    texto_geral = " ".join(df["titulo_vaga"].dropna().astype(str).tolist()).lower()
    
    print("\n----------------------------------------")
    print("  📊 INSIGHTS DE MERCADO (TOP TERMOS)")
    print("----------------------------------------")
    
    encontrados = []
    for skill in skills_alvo:
        # Conta quantas vezes a skill aparece de forma isolada/case-insensitive
        matches = len(re.findall(r'\b' + re.escape(skill.lower()) + r'\b', texto_geral))
        if matches > 0:
            encontrados.append((skill, matches))
            
    # Ordena do mais frequente para o menos frequente
    encontrados.sort(key=lambda x: x[1], reverse=True)
    
    for skill, freq in encontrados:
        print(f"  • {skill}: mencionado em {freq} ocorrência(s)")
        
    print("----------------------------------------")
    print("✨ Análise concluída com sucesso!")