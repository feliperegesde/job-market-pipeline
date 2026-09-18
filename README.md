# 🚀 Job Market Pipeline & Insights Engine (Full-Stack TypeScript & FastAPI)

An advanced end-to-end data pipeline and modern decoupled web application developed to collect, consolidate, clean, and extract insights from tech job vacancies in real-time across multiple platforms (Gupy and LinkedIn).

The project simulates a real-world Data Engineering, Science, and Software Architecture environment, automating everything from raw data ingestion via Playwright to backend API services and a strongly-typed web interface.

---

## 🛠️ Technologies Used

### Back-end & Data Pipeline
* **Python 3.10+ / FastAPI:** High-performance asynchronous REST API.
* **Playwright:** Web automation and asynchronous scraping avoiding bot detection.
* **Pandas:** Data manipulation, cleaning, deduplication, and source consolidation.
* **Regex / NLP:** Extraction of technical skills and requirements from job descriptions.

### Front-end
* **TypeScript & React:** Strongly-typed component-driven user interface.
* **Vite:** Next-generation frontend build tool and development server.
* **Axios & Lucide React:** HTTP client integration and modern UI iconography.

---

## 📁 Project Architecture

The project is structured following strict software engineering and separation of concerns principles:

pipeline-vagas/
│
├── api.py                   # FastAPI backend server exposing REST endpoints
├── main.py                  # CLI central pipeline orchestrator
├── requirements.txt         # Python dependencies
│
├── data/                    # Local data lake storage
│   ├── raw/                 # Raw data collected by scrapers (CSV)
│   └── processed/           # Cleaned and consolidated data ready for consumption
│
├── src/                     # Core pipeline modules
│   ├── gupy_scraper.py      # Automated collector for Gupy portal
│   ├── linkedin_scraper.py  # Public job collector for LinkedIn
│   ├── parser.py            # Cleaning, processing, and source merging module
│   └── analyzer.py          # NLP module for skill ranking and insights
│
└── client/                  # Decoupled Front-end (React + Vite + TypeScript)
    ├── src/
    │   ├── types/job.ts     # Strict TypeScript interfaces for job records
    │   ├── App.tsx          # Main interactive dashboard component
    │   └── main.tsx         # React root entry point
    ├── package.json         # Node.js dependencies and scripts
    └── tsconfig.json        # TypeScript compiler configurations

---

## ⚙️ How to Run Locally

To run this decoupled architecture, you will use two terminal windows (one for the API and one for the Front-end).

### 1. Clone the repository & setup Python environment
```bash
git clone [https://github.com/SEU-USUARIO/job-market-pipeline.git](https://github.com/SEU-USUARIO/job-market-pipeline.git)
cd job-market-pipeline

# Create and activate virtual environment
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate
# On Linux/Mac:
source venv/bin/activate

# Install Python dependencies and Playwright browsers
pip install -r requirements.txt
python -m playwright install

4. Run via Terminal (CLI):
uvicorn api:app --reload

5. Run the FrontEnd:
cd client
cd client
npm install --legacy-peer-deps
npm run dev

6. The web interface will open locally (usually at http://localhost:5173).

(Optional) If you prefer running via CLI without the web UI:

python main.py
---

## 📊 What does the Pipeline do?
1. Dynamic Ingestion: Custom search triggers via web interface or CLI to access job platforms via Playwright simulating real browsing behavior.
2. Transformation (ETL): Consolidates data from multiple sources into a single DataFrame, removes duplicates, and standardizes columns safely.
3. Market Analysis: Scans the data using regular expressions to count and categorize the most demanded technologies by companies (e.g., Python, SQL, AWS, Machine Learning).
4. Strongly-Typed Web Dashboard: Modern React interface built with TypeScript where users can execute live scraping searches, filter records instantly, and explore career market metrics.

---
*Developed as part of advanced studies in Data Science and Engineering.*