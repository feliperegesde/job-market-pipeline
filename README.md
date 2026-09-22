# 🚀 Job Market Pipeline & Insights Engine

**Full-Stack Data Pipeline & Analytics Platform built with Python, FastAPI, Playwright, React, and TypeScript.**

An end-to-end data engineering and analytics project designed to **collect, process, consolidate, and analyze technology job vacancies** from multiple platforms, including **Gupy and LinkedIn**.

The project simulates a real-world data environment, combining **web scraping, ETL, data analysis, NLP-based skill extraction, REST APIs, and a strongly typed React dashboard** into a decoupled architecture.

---

## ✨ Features

* 🔎 Dynamic job vacancy search
* 🌐 Automated data collection from Gupy and LinkedIn
* 🤖 Browser automation with Playwright
* 🧹 Data cleaning, normalization, and deduplication
* 🔄 Consolidation of data from multiple sources
* 🧠 Technical skill extraction using Regex/NLP techniques
* 📊 Analysis of the most demanded technologies
* ⚡ Asynchronous REST API with FastAPI
* 💻 Interactive React dashboard
* 🔷 Strongly typed frontend with TypeScript
* 🗂️ Separation between raw and processed datasets
* 🖥️ CLI support for running the pipeline without the web interface

---

## 🏗️ Architecture

The project follows a **decoupled architecture**, separating the data pipeline, backend API, and frontend application.

```text
┌───────────────────────────────┐
│         React + Vite          │
│       TypeScript Frontend     │
└───────────────┬───────────────┘
                │ HTTP / REST
                ▼
┌───────────────────────────────┐
│          FastAPI API          │
│        Python Backend         │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       Data Processing         │
│     Pandas + Regex / NLP      │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       Data Collection         │
│   Playwright Scrapers         │
│   ├── Gupy                    │
│   └── LinkedIn                │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│          Data Lake            │
│   ├── raw/                    │
│   └── processed/              │
└───────────────────────────────┘
```

---

## 🛠️ Technologies

### Back-end & Data Pipeline

| Technology       | Purpose                                       |
| ---------------- | --------------------------------------------- |
| **Python 3.10+** | Core programming language                     |
| **FastAPI**      | Asynchronous REST API                         |
| **Playwright**   | Browser automation and web scraping           |
| **Pandas**       | Data manipulation and processing              |
| **Regex / NLP**  | Technical skill extraction and classification |

### Front-end

| Technology       | Purpose                                    |
| ---------------- | ------------------------------------------ |
| **TypeScript**   | Strong static typing                       |
| **React**        | Component-based user interface             |
| **Vite**         | Frontend build tool and development server |
| **Axios**        | HTTP client                                |
| **Lucide React** | Interface icons                            |

---

## 📁 Project Structure

```text
job-market-pipeline/
│
├── api.py                    # FastAPI backend and REST endpoints
├── main.py                   # CLI pipeline orchestrator
├── requirements.txt          # Python dependencies
│
├── data/
│   ├── raw/                  # Raw data collected by scrapers
│   └── processed/            # Cleaned and consolidated datasets
│
├── src/
│   ├── gupy_scraper.py       # Gupy data collector
│   ├── linkedin_scraper.py   # LinkedIn job collector
│   ├── parser.py             # Data cleaning and consolidation
│   └── analyzer.py           # NLP and market analysis
│
└── client/
    ├── src/
    │   ├── types/
    │   │   └── job.ts        # TypeScript job interfaces
    │   ├── App.tsx           # Main dashboard
    │   └── main.tsx          # React entry point
    │
    ├── package.json          # Frontend dependencies
    └── tsconfig.json         # TypeScript configuration
```

---

## ⚙️ How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/feliperegesde/job-market-pipeline.git
cd job-market-pipeline
```

### 2. Create the Python virtual environment

```bash
python -m venv venv
```

#### Windows — PowerShell

```powershell
.\venv\Scripts\Activate
```

#### Linux / macOS

```bash
source venv/bin/activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

Install the required Playwright browsers:

```bash
python -m playwright install
```

---

### 4. Start the FastAPI backend

From the project root:

```bash
uvicorn api:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

FastAPI also provides interactive API documentation at:

```text
http://localhost:8000/docs
```

---

### 5. Start the React frontend

Open a **second terminal** and navigate to the frontend: (sorry i created 2 folders name client)

```bash
cd client
cd client
```

Install the dependencies:

```bash
npm install --legacy-peer-deps
npm install recharts
```

Start the development server:

```bash
npm run dev
```

The frontend will usually be available at:

```text
http://localhost:5173
```

---

### 6. Run the pipeline using the CLI

If you prefer to run the pipeline without the web interface:

```bash
python main.py
```

---

## 📊 How the Pipeline Works

### 1. 🔎 Dynamic Ingestion

Users can trigger job searches through either the **web interface or CLI**.

Playwright automates browser interactions with supported job platforms, collecting information such as:

* Job title
* Company
* Location
* Job description
* Requirements
* Technologies
* Source platform

---

### 2. 🧹 Data Transformation

The collected data goes through an ETL process that:

* Loads raw datasets
* Standardizes column names and formats
* Removes duplicated vacancies
* Cleans inconsistent values
* Consolidates data from different sources
* Generates processed datasets ready for analysis

The project separates raw and processed data:

```text
data/
├── raw/
└── processed/
```

---

### 3. 🧠 Market Analysis

The analysis module processes job descriptions to identify frequently requested technologies and technical skills.

Using **Regex and NLP-oriented techniques**, the pipeline can identify technologies such as:

```text
Python
SQL
AWS
Machine Learning
Docker
React
Java
Git
```

The resulting data can be used to understand **technology demand across collected job vacancies**.

---

### 4. 📊 Interactive Dashboard

The React frontend provides an interactive interface for:

* Executing vacancy searches
* Viewing collected jobs
* Filtering results
* Exploring vacancy information
* Visualizing technology demand
* Interacting with the backend API in real time

The frontend communicates with the FastAPI backend through REST endpoints.

---

### 5. 🤖 AI Match Engine (Machine Learning & NLP)

The platform features an integrated Artificial Intelligence module designed to evaluate candidate compatibility against scraped vacancies in real time.

Using **Natural Language Processing (NLP)** and **Machine Learning**, the pipeline performs:

* **PDF & Text Ingestion:** Automated parsing of curriculum documents via `pypdf` or direct text input.
* **TF-IDF Vectorization:** Transforming job requirements and candidate skills into weighted numerical feature vectors using `scikit-learn`.
* **Cosine Similarity Scoring:** Calculating mathematical proximity angles between the candidate profile and job listings.
* **Smart Score Normalization:** Dynamically scaling and ranking vacancies to present an intuitive percentage match score (`match_score`) directly on the dashboard.


## 🔄 Data Flow

```text
Job Platforms
      │
      ▼
  Playwright
      │
      ▼
   Raw Data
      │
      ▼
Pandas / Parser
      │
      ▼
Processed Data
      │
      ├───────────────┐
      ▼               ▼
  Analyzer         FastAPI
      │               │
      ▼               ▼
Market Insights   React Dashboard
```

---

## 🎯 Project Goals

This project was developed to explore and demonstrate practical concepts in:

* **Data Engineering**
* **Data Science**
* **Web Scraping**
* **ETL Pipelines**
* **Natural Language Processing**
* **Backend Development**
* **REST API Design**
* **Frontend Development**
* **Software Architecture**
* **Data Visualization**

The goal is to combine these areas into a single end-to-end application that resembles a real-world data product.

---

## 🚀 Future Improvements

Possible future developments include:

* [ ] Persistent database integration
* [ ] Scheduled automatic data collection
* [ ] Additional job platforms
* [ ] Advanced NLP models for skill extraction
* [ ] Salary analysis
* [ ] Job recommendation system
* [ ] Historical market trend analysis
* [ ] Authentication and user accounts
* [ ] Docker containerization
* [ ] Automated testing and CI/CD
* [ ] Cloud deployment

---

## 📚 Learning & Development

This project was developed as part of advanced studies and personal development in **Data Science, Data Engineering, Artificial Intelligence, and Full-Stack Software Development**.

It combines practical experience with technologies commonly used in modern software and data applications.

---

## 👨‍💻 Author

**Felipe Reges de Albuquerque**

Computer Science student focused on **Data Science, Artificial Intelligence, Automation, and Software Development**.

---

⭐ If you found this project interesting, feel free to explore the repository and follow the development!
