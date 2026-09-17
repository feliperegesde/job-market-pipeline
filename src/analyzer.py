import pandas as pd
import os
import re

def analyze_jobs():
    """Analisa as vagas tratadas e extrai um ranking avançado de tecnologias (Skills) via NLP/Regex."""
    input_path = "data/processed/vagas_tratadas.csv"
    
    print("📈 Iniciando a análise avançada de dados e extração de skills...")
    
    if not os.path.exists(input_path):
        print("❌ Arquivo de vagas tratadas não encontrado. Execute o pipeline completo.")
        return

    df = pd.read_csv(input_path)
    
    if df.empty or "titulo_vaga" not in df.columns:
        print("⚠️ O DataFrame está vazio ou sem a coluna de títulos.")
        return

    total_vagas = len(df)
    
    
    skills_alvo = {
        "Linguagens": ["Python", "SQL", "Java", "C++", "JavaScript", "TypeScript", "R"],
        "Data Science & ML": ["Machine Learning", "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-Learn"],
        "Cloud & DevOps": ["AWS", "Docker", "Kubernetes", "Azure", "GCP"],
        "Banco de Dados & BI": ["PostgreSQL", "MySQL", "Power BI", "Tableau", "MongoDB"]
    }
    
    # Junta todo o texto de todas as vagas disponíveis na base tratada
    texto_geral = " ".join(df["titulo_vaga"].dropna().astype(str).tolist()).lower()
    
    print("\n" + "="*50)
    print("  📊 RELATÓRIO DE INTELIGÊNCIA DE MERCADO (SKILLS)")
    print(f"  Total de vagas analisadas na base: {total_vagas}")
    print("="*50)
    
    for categoria, skills in skills_alvo.items():
        print(f"\n📂 [{categoria}]")
        encontrados_cat = []
        
        for skill in skills:
            
            matches = len(re.findall(r'\b' + re.escape(skill.lower()) + r'\b', texto_geral))
            if matches > 0:
                # Calcula a porcentagem de aparição em relação ao total de vagas
                porcentagem = (matches / total_vagas) * 100 if total_vagas > 0 else 0
                encontrados_cat.append((skill, matches, porcentagem))
                
        # Ordena do mais frequente para o menos frequente dentro da categoria
        encontrados_cat.sort(key=lambda x: x[1], reverse=True)
        
        if encontrados_cat:
            for skill, freq, pct in encontrados_cat:
                print(f"  • {skill:<18} ➔ Mencionado em {freq} vaga(s) ({pct:.1f}%)")
        else:
            print("  (Nenhuma skill desta categoria encontrada nas vagas atuais)")
            
    print("\n" + "="*50)
    print("✨ Análise avançada concluída com sucesso!")