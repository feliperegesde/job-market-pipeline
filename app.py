import streamlit as st
import pandas as pd
import os
import asyncio
from src.gupy_scraper import scrape_gupy
from src.linkedin_scraper import scrape_linkedin
from src.parser import process_jobs_data
from src.analyzer import analyze_jobs

# Configuração da página do Streamlit
st.set_page_config(
    page_title="Tech Job Market Dashboard",
    page_icon="🚀",
    layout="wide"
)

st.title("🚀 Tech Job Market Analytics & Pipeline")
st.markdown("Painel interativo para coleta, processamento e inteligência de mercado de vagas de tecnologia em tempo real.")

# --- BARRA LATERAL: CONFIGURAÇÃO DE BUSCA E SCRAPING ---
st.sidebar.header("🔍 Painel de Controle")

termo_busca = st.sidebar.text_input("Cargo ou Tecnologia para Buscar", value="Ciência de Dados")

if st.sidebar.button("🚀 Executar Nova Coleta (Scraping)", type="primary"):
    with st.spinner(f"Coletando e processando vagas para '{termo_busca}'... Isso pode levar alguns segundos."):
        # Executa o pipeline assíncrono direto pela interface web
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(scrape_gupy(termo_busca))
            loop.run_until_complete(scrape_linkedin(termo_busca))
            
            # Processa e limpa os dados
            process_jobs_data()
            st.sidebar.success("✅ Coleta e processamento concluídos com sucesso!")
            st.rerun() # Atualiza a página para carregar os novos dados
        except Exception as e:
            st.sidebar.error(f"❌ Erro durante a execução: {e}")

st.sidebar.markdown("---")

# Caminho dos dados tratados
data_path = "data/processed/vagas_tratadas.csv"

@st.cache_data
def load_data():
    if os.path.exists(data_path):
        return pd.read_csv(data_path)
    return pd.DataFrame()

df = load_data()

if df.empty:
    st.warning("⚠️ Nenhum dado tratado encontrado. Use o painel ao lado para digitar um termo e clicar em **Executar Nova Coleta**!")
else:
    # Métricas principais (KPIs)
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total de Vagas Analisadas", len(df))
    with col2:
        fontes_unicas = df['fonte'].nunique() if 'fonte' in df.columns else 1
        st.metric("Fontes de Coleta Ativas", fontes_unicas)
    with col3:
        empresas_unicas = df['empresa'].nunique() if 'empresa' in df.columns else 0
        st.metric("Empresas Únicas", empresas_unicas)

    st.markdown("---")

    # Filtros visuais na barra lateral
    st.sidebar.subheader("🎛️ Filtros de Visualização")
    if 'fonte' in df.columns:
        fontes_disponiveis = ["Todas"] + list(df['fonte'].unique())
        fonte_selecionada = st.sidebar.selectbox("Filtrar por Plataforma", fontes_disponiveis)
        
        if fonte_selecionada != "Todas":
            df = df[df['fonte'] == fonte_selecionada]

    # Busca secundária por texto na tabela
    filtro_tabela = st.sidebar.text_input("Filtrar tabela por palavra-chave")
    if filtro_tabela:
        df = df[df['titulo_vaga'].str.contains(filtro_tabela, case=False, na=False)]

    # Exibição da tabela interativa
    st.subheader("📋 Lista Detalhada de Vagas")
    st.dataframe(df, use_container_width=True)

    # Gráfico simples de distribuição
    if not df.empty and 'fonte' in df.columns:
        st.subheader("📊 Distribuição de Vagas por Plataforma")
        contagem_fontes = df['fonte'].value_counts()
        st.bar_chart(contagem_fontes)

    # Rodapé
    st.markdown("---")
    st.markdown("*Desenvolvido para portfólio de Ciência e Engenharia de Dados.*")