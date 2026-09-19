import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Job } from './types/job';
import { Search, Play, RefreshCw, Briefcase, Building, ExternalLink, Layers } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

const getSourceStyles = (fonte: string) => {
  const key = fonte.toLowerCase();
  const styles: Record<string, string> = {
    linkedin: 'bg-blue-950/60 text-blue-400 border-blue-800/40',
    gupy: 'bg-violet-950/60 text-violet-400 border-violet-800/40',
    indeed: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40',
  };
  return styles[key] ?? 'bg-slate-900/60 text-slate-300 border-slate-700/40';
};

const getCompanyStyles = (empresa: string) => {
  const key = empresa.toLowerCase();
  const styles: Record<string, string> = {
    google: 'bg-blue-500 text-white',
    meta: 'bg-blue-600 text-white',
    amazon: 'bg-orange-500 text-white',
    microsoft: 'bg-sky-500 text-white',
    nubank: 'bg-purple-600 text-white',
    openai: 'bg-slate-100 text-slate-900',
    aws: 'bg-orange-500 text-white',
    apple: 'bg-slate-100 text-slate-900',
    'itaú': 'bg-orange-500 text-white',
    itau: 'bg-orange-500 text-white',
    spotify: 'bg-green-500 text-white',
    stripe: 'bg-indigo-500 text-white',
    cloudflare: 'bg-orange-500 text-white',
  };
  return styles[key] ?? 'bg-slate-800 text-slate-300 border border-slate-700';
};

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('Ciência de Dados');
  const [loading, setLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  const currentDateTime = '19/09/2026 • 15:42';

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/jobs`);
      setJobs(response.data);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/scrape`, null, {
        params: { termo: searchTerm },
      });
      await fetchJobs();
    } catch (error) {
      console.error('Erro ao executar scraping:', error);
      alert('Erro ao executar a coleta.');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.titulo_vaga.toLowerCase().includes(filterText.toLowerCase()) ||
      job.empresa.toLowerCase().includes(filterText.toLowerCase());
    const matchesSource = selectedSource === 'ALL' || job.fonte.toLowerCase() === selectedSource.toLowerCase();
    return matchesSearch && matchesSource;
  });

  const totalJobs = jobs.length;
  const uniqueCompanies = new Set(jobs.map((j) => j.empresa)).size;
  const sourcesCount = 3;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 md:p-10 font-sans flex flex-col justify-between">
      <div className="max-w-7xl mx-auto space-y-6 w-full">
        
        {/* Header Superior idêntico ao Figma */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0b1329] border border-blue-950/50 p-6 rounded-2xl gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white font-black px-3.5 py-2.5 rounded-xl text-sm tracking-wider shadow-md">JS</div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wider text-white m-0 p-0">JOB SEEKER</h1>
              <p className="text-xs text-blue-400/80 font-medium tracking-wide mt-0.5">
                Market Intelligence <span className="text-slate-500">•</span> Real-Time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-slate-400 font-mono bg-[#050811] px-3.5 py-2 rounded-xl border border-blue-950/60">
              {currentDateTime}
            </span>
            <button
              onClick={fetchJobs}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
            >
              <RefreshCw size={14} /> Atualizar Dados
            </button>
          </div>
        </header>

        {/* Subtítulo do Pipeline */}
        <div className="px-1">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Pipeline de Dados & Inteligência de Mercado em Tempo Real (FastAPI + React + TS)
          </p>
        </div>

        {/* Cards de Métricas (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#0b1329] border border-blue-950/40 p-6 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Vagas Coletadas</p>
                <h3 className="text-4xl font-extrabold mt-2 text-blue-500 tracking-tight">{totalJobs}</h3>
              </div>
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                <Briefcase size={20} />
              </div>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full w-3/4"></div>
            </div>
          </div>

          <div className="bg-[#0b1329] border border-blue-950/40 p-6 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Empresas Mapeadas</p>
                <h3 className="text-4xl font-extrabold mt-2 text-blue-500 tracking-tight">{uniqueCompanies}</h3>
              </div>
              <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                <Building size={20} />
              </div>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full w-4/5"></div>
            </div>
          </div>

          <div className="bg-[#0b1329] border border-blue-950/40 p-6 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fontes Ativas</p>
                <h3 className="text-4xl font-extrabold mt-2 text-blue-500 tracking-tight">{sourcesCount}</h3>
              </div>
              <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
                <Layers size={20} />
              </div>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full w-1/3"></div>
            </div>
          </div>
        </div>

        {/* Bloco de Disparar Scraping */}
        <div className="bg-[#0b1329] border border-blue-950/40 p-5 rounded-2xl shadow-lg space-y-3">
          <h2 className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider m-0">
            <Search size={15} className="text-blue-500" /> Disparar Scraping
          </h2>

          <form onSubmit={handleScrape} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-[#050811] border border-blue-950/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-200 placeholder-slate-500 transition"
              placeholder="CARGO OU TECNOLOGIA"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 text-sm cursor-pointer"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
              {loading ? 'Coletando...' : 'Executar Coleta'}
            </button>
          </form>
        </div>

        {/* Bloco de Filtros Dinâmicos */}
        <div className="bg-[#0b1329] border border-blue-950/40 p-5 rounded-2xl shadow-lg space-y-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider m-0">Filtros Dinâmicos</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <input
                type="text"
                placeholder="Filtrar por cargo ou empresa..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full bg-[#050811] border border-blue-950/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-200 placeholder-slate-500"
              />
            </div>
            <div>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full bg-[#050811] border border-blue-950/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-300"
              >
                <option value="ALL">Todas as Fontes</option>
                <option value="gupy">Gupy</option>
                <option value="linkedin">LinkedIn</option>
                <option value="indeed">Indeed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Vagas */}
        <div className="bg-[#0b1329] border border-blue-950/40 rounded-2xl p-6 shadow-xl flex flex-col mb-6">
          <div className="flex justify-between items-center mb-6 border-b border-blue-950/40 pb-4">
            <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-slate-200 m-0">
              <Briefcase size={16} className="text-blue-500" /> Vagas Encontradas
            </h2>
            <span className="text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
              {filteredJobs.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-blue-950/40 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Cargo / Vaga</th>
                  <th className="py-3 px-4 font-bold">Empresa</th>
                  <th className="py-3 px-4 font-bold">Fonte</th>
                  <th className="py-3 px-4 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-950/20 text-sm">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, index) => (
                    <tr key={index} className="hover:bg-blue-950/10 transition">
                      <td className="py-4 px-4 font-semibold text-slate-200">{job.titulo_vaga}</td>
                      <td className="py-4 px-4 text-slate-300 flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-md font-bold text-[10px] flex items-center justify-center ${getCompanyStyles(
                            job.empresa
                          )}`}
                        >
                          {job.empresa.charAt(0)}
                        </span>
                        {job.empresa}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getSourceStyles(
                            job.fonte
                          )}`}
                        >
                          @{job.fonte}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {job.link && job.link !== 'N/A' ? (
                          <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs font-bold inline-flex items-center gap-1 transition"
                          >
                            Ver Vaga <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-slate-600 text-xs font-medium">Indisponível</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-slate-500 text-sm">
                      Nenhuma vaga encontrada. Execute uma coleta para começar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="max-w-7xl w-full mx-auto border-t border-blue-950/60 pt-6 pb-4 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4 mt-12">
        <div>
          <span className="font-extrabold text-slate-200 tracking-wider">JOB SEEKER</span>
          <span className="mx-2 text-slate-600">|</span>
          <span>
            Desenvolvido por <strong className="text-slate-300 font-semibold">Felipe Reges De Albuquerque</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-300">Sistema Ativo</span>
        </div>
      </footer>
    </div>
  );
}

export default App;