# 🚀 Job Market Pipeline & Insights Engine

An end-to-end data pipeline developed to collect, consolidate, clean, and extract insights from tech job vacancies in real-time across multiple platforms (Gupy and LinkedIn).

The project simulates a real-world Data Engineering and Science environment, automating everything from raw data ingestion to market intelligence analysis (NLP/Skills).

---

## 🛠️ Technologies Used

* Python 3.10+
* Playwright (Web automation and asynchronous scraping)
* Pandas (Data manipulation, cleaning, and consolidation)
* Regex / NLP (Extraction of skills and technologies from titles and descriptions)

---

## 📁 Project Architecture

The project is modularized to separate responsibilities (software engineering best practices):

pipeline-vagas/
│
├── data/
│   ├── raw/                 # Raw data collected by scrapers (CSV)
│   └── processed/           # Cleaned and consolidated data ready for analysis
│
├── src/
│   ├── gupy_scraper.py      # Automated collector for the Gupy portal
│   ├── linkedin_scraper.py  # Public job collector for LinkedIn
│   ├── parser.py            # Cleaning, processing, and source merging module
│   └── analyzer.py          # NLP module for skill ranking and insights
│
├── main.py                  # Central pipeline orchestrator
└── requirements.txt         # Project dependencies

---

## ⚙️ How to Run Locally

1. Clone the repository:
git clone https://github.com/SEU-USUARIO/job-market-pipeline.git
cd job-market-pipeline

2. Create and activate a virtual environment:
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate
# On Linux/Mac:
source venv/bin/activate

3. Install dependencies:
pip install -r requirements.txt
playwright install

4. Run the complete pipeline:
python main.py

---

## 📊 What does the Pipeline do?
1. Ingestion (Collection): Accesses job platforms via Playwright simulating real browsing behavior to extract tech job data.
2. Transformation (ETL): Consolidates data into a single DataFrame, removes duplicates, and standardizes columns.
3. Market Analysis: Scans the data using regular expressions to count the most demanded technologies by companies (e.g., Python, SQL, AWS, etc.).

---
*Developed as part of advanced studies in Data Science and Engineering.*