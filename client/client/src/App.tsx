import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { Job } from './types/job';
import { Search, Play, RefreshCw, Briefcase, Building, ExternalLink, Layers, Linkedin, Github, Sparkles, Download, X, Eye, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('Ciência de Dados');
  const [paisScrape, setPaisScrape] = useState<string>('Brasil');
  const [loading, setLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedNivel, setSelectedNivel] = useState<string>('ALL');

  // Estados de IA, Modal e Analytics
  const [curriculoTexto, setCurriculoTexto] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [modoMatchAtivo, setModoMatchAtivo] = useState<boolean>(false);
  const [vagaSelecionada, setVagaSelecionada] = useState<Job | null>(null);

  const currentDateTime = '19/09/2026 • 15:42';

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/jobs`);
      setJobs(response.data);
      setModoMatchAtivo(false);
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
        params: { termo: searchTerm, pais: paisScrape },
      });
      await fetchJobs();
    } catch (error) {
      console.error('Erro ao executar scraping:', error);
      alert('Erro ao executar a coleta.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateMatch = async () => {
    if (!curriculoTexto.trim() && !selectedFile) {
      alert('Cole o texto do currículo ou selecione um arquivo PDF!');
      return;
    }

    setIsMatching(true);
    const formData = new FormData();
    if (selectedFile) {
      formData.append('file', selectedFile);
    } else {
      formData.append('curriculo_texto', curriculoTexto);
    }

    try {
      const response = await axios.post(`${API_URL}/match`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setJobs(response.data);
      setModoMatchAtivo(true);
    } catch (error) {
      console.error('Erro ao calcular match:', error);
      alert('Erro ao processar o match com IA.');
    } finally {
      setIsMatching(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredJobs.length === 0) {
      alert('Não há vagas para exportar.');
      return;
    }

    const headers = ['titulo_vaga', 'empresa', 'fonte', 'nivel', 'match_score', 'link'];
    const csvRows = [headers.join(',')];

    filteredJobs.forEach(job => {
      const row = [
        `"${job.titulo_vaga?.replace(/"/g, '""') || ''}"`,
        `"${job.empresa?.replace(/"/g, '""') || ''}"`,
        `"${job.fonte || ''}"`,
        `"${job.nivel || 'Não Especificado'}"`,
        job.match_score ?? 'N/A',
        `"${job.link || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'vagas_exportadas_jobseeker.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.titulo_vaga.toLowerCase().includes(filterText.toLowerCase()) ||
      job.empresa.toLowerCase().includes(filterText.toLowerCase());
    
    const matchesSource = selectedSource === 'ALL' || job.fonte.toLowerCase().includes(selectedSource.toLowerCase());
    
    const nivelVaga = job.nivel ? job.nivel.toLowerCase() : '';
    const matchesNivel = selectedNivel === 'ALL' || nivelVaga.includes(selectedNivel.toLowerCase());

    return matchesSearch && matchesSource && matchesNivel;
  });

  // Analytics computados para os gráficos
  const analyticsData = useMemo(() => {
    const techKeywords = ['Python', 'SQL', 'React', 'AWS', 'Machine Learning', 'Java', 'Docker', 'TypeScript', 'Node.js', 'Pandas'];
    const counts: Record<string, number> = {};
    techKeywords.forEach(t => counts[t] = 0);

    jobs.forEach(job => {
      const text = (job.titulo_vaga + " " + job.empresa).toLowerCase();
      techKeywords.forEach(tech => {
        if (text.includes(tech.toLowerCase())) {
          counts[tech] = (counts[tech] || 0) + 1;
        }
      });
    });

    const barData = Object.keys(counts).map(tech => ({
      name: tech,
      vagas: counts[tech]
    })).filter(item => item.vagas > 0).sort((a, b) => b.vagas - a.vagas);

    const nivelCounts: Record<string, number> = { 'Junior': 0, 'Pleno': 0, 'Senior': 0, 'Estágio': 0, 'Não Especificado': 0 };
    jobs.forEach(job => {
      const niv = job.nivel && job.nivel !== 'Não Especificado' ? job.nivel : 'Não Especificado';
      nivelCounts[niv] = (nivelCounts[niv] || 0) + 1;
    });

    const pieData = Object.keys(nivelCounts)
      .filter(k => nivelCounts[k] > 0)
      .map(k => ({ name: k, value: nivelCounts[k] }));

    return { barData, pieData };
  }, [jobs]);

  const totalJobs = jobs.length;
  const uniqueCompanies = new Set(jobs.map((j) => j.empresa)).size;
  const sourcesCount = 3;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 md:p-10 font-sans flex flex-col justify-between">
      <div className="max-w-7xl mx-auto space-y-6 w-full">
        
        {/* Header Superior */}
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
        <div className="px-1 flex justify-between items-center">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Pipeline de Dados & Inteligência de Mercado em Tempo Real (FastAPI + React + TS)
          </p>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Download size={14} /> Exportar CSV ({filteredJobs.length})
          </button>
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

        {/* Bloco de Gráficos de Inteligência de Mercado (Analytics) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Gráfico de Barras: Top Tecnologias */}
          <div className="bg-[#0b1329] border border-blue-950/40 p-6 rounded-2xl shadow-lg flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-blue-500" />
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Demanda por Tecnologias</h2>
            </div>
            <div className="h-64 w-full">
              {analyticsData.barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.barData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-30} textAnchor="end" />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#050811', borderColor: '#1e3a8a', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="vagas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Execute uma coleta para gerar estatísticas de tecnologias.
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Pizza: Distribuição por Senioridade */}
          <div className="bg-[#0b1329] border border-blue-950/40 p-6 rounded-2xl shadow-lg flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <PieIcon size={18} className="text-purple-400" />
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Distribuição por Senioridade</h2>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              {analyticsData.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {analyticsData.pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#050811', borderColor: '#1e3a8a', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Execute uma coleta para gerar estatísticas de senioridade.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bloco de Disparar Scraping com Seletor de País */}
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
            
            <select
              value={paisScrape}
              onChange={(e) => setPaisScrape(e.target.value)}
              className="bg-[#050811] border border-blue-950/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-300 cursor-pointer"
            >
              <option value="Brasil">🇧🇷 Brasil</option>
              <option value="Estados Unidos">🇺🇸 Estados Unidos</option>
              <option value="Global">🌍 Global / Todos</option>
            </select>

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

        {/* Bloco de IA Match Engine (PDF ou Texto) */}
        <div className="bg-[#0b1329] border border-purple-950/50 p-5 rounded-2xl shadow-lg space-y-3">
          <h2 className="text-xs font-bold text-purple-300 flex items-center gap-2 uppercase tracking-wider m-0">
            <Sparkles size={15} className="text-purple-400" /> IA Match Engine (Upload de Currículo PDF ou Texto)
          </h2>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <textarea
                rows={2}
                value={curriculoTexto}
                onChange={(e) => {
                  setCurriculoTexto(e.target.value);
                  if (e.target.value) setSelectedFile(null);
                }}
                placeholder="Ou cole seu currículo aqui (Python, React, Data Science...)"
                className="w-full bg-[#050811] border border-purple-950/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-500 transition resize-none"
              />
              
              <div className="flex flex-col justify-center bg-[#050811] border border-dashed border-purple-950/80 rounded-xl px-4 py-3 text-sm">
                <label className="text-xs text-purple-300 font-semibold mb-1 cursor-pointer flex items-center gap-2">
                  <span>📄 Selecionar Currículo em PDF</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        setCurriculoTexto('');
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-400 truncate">
                  {selectedFile ? `Arquivo: ${selectedFile.name}` : 'Nenhum arquivo selecionado'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              {modoMatchAtivo ? (
                <span className="text-xs text-purple-400 font-semibold animate-pulse flex items-center gap-1">
                  ✨ Vagas ordenadas por compatibilidade de IA (PDF/Texto)!
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Envie seu PDF ou cole o texto para classificar as vagas por similaridade inteligente.
                </span>
              )}
              <button
                type="button"
                onClick={handleCalculateMatch}
                disabled={isMatching}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-bold px-6 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 text-sm cursor-pointer ml-auto"
              >
                {isMatching ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {isMatching ? 'Processando Documento...' : 'Calcular Match com IA'}
              </button>
            </div>
          </div>
        </div>

        {/* Bloco de Filtros Dinâmicos & Pílulas de Senioridade */}
        <div className="bg-[#0b1329] border border-blue-950/40 p-5 rounded-2xl shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider m-0">Filtros Dinâmicos & Senioridade</h2>
            
            <div className="flex flex-wrap gap-2">
              {['ALL', 'Estágio', 'Junior', 'Pleno', 'Senior'].map((nivel) => (
                <button
                  key={nivel}
                  onClick={() => setSelectedNivel(nivel)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    selectedNivel === nivel
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                      : 'bg-[#050811] text-slate-400 border-blue-950/60 hover:border-blue-700 hover:text-slate-200'
                  }`}
                >
                  {nivel === 'ALL' ? 'Todos os Níveis' : nivel}
                </button>
              ))}
            </div>
          </div>

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
                className="w-full bg-[#050811] border border-blue-950/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-300 cursor-pointer"
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
                  {modoMatchAtivo && <th className="py-3 px-4 font-bold text-center">Match IA</th>}
                  <th className="py-3 px-4 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-950/20 text-sm">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, index) => (
                    <tr 
                      key={index} 
                      onClick={() => setVagaSelecionada(job)}
                      className="hover:bg-blue-950/20 transition cursor-pointer"
                      title="Clique para ver os detalhes completos"
                    >
                      <td className="py-4 px-4 font-semibold text-slate-200">
                        {job.titulo_vaga}
                        {job.nivel && job.nivel !== 'Não Especificado' && (
                          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-blue-400 border border-slate-700">
                            {job.nivel}
                          </span>
                        )}
                      </td>
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
                      {modoMatchAtivo && (
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            (job.match_score ?? 0) > 20 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : (job.match_score ?? 0) > 5 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {job.match_score ?? 0}%
                          </span>
                        </td>
                      )}
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setVagaSelecionada(job)}
                            className="text-slate-400 hover:text-slate-200 text-xs font-bold inline-flex items-center gap-1 transition p-1 bg-slate-800/50 rounded-lg border border-slate-700/50"
                            title="Detalhes"
                          >
                            <Eye size={14} />
                          </button>
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
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={modoMatchAtivo ? 5 : 4} className="py-8 px-4 text-center text-slate-500 text-sm">
                      Nenhuma vaga encontrada para este filtro. Tente mudar o país ou executar uma nova coleta.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes da Vaga */}
      {vagaSelecionada && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1329] border border-blue-950/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setVagaSelecionada(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-[#050811] p-2 rounded-xl border border-blue-950/60 transition cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <span className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center ${getCompanyStyles(vagaSelecionada.empresa)}`}>
                {vagaSelecionada.empresa.charAt(0)}
              </span>
              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSourceStyles(vagaSelecionada.fonte)} mb-1`}>
                  @{vagaSelecionada.fonte}
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">{vagaSelecionada.titulo_vaga}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#050811] p-4 rounded-xl border border-blue-950/60 text-xs">
              <div>
                <span className="text-slate-500 block uppercase font-bold tracking-wider">Empresa</span>
                <span className="text-slate-200 font-semibold text-sm">{vagaSelecionada.empresa}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold tracking-wider">Senioridade</span>
                <span className="text-blue-400 font-semibold text-sm">{vagaSelecionada.nivel || 'Não Especificado'}</span>
              </div>
              {vagaSelecionada.match_score !== undefined && (
                <div className="col-span-2 pt-2 border-t border-blue-950/40 mt-1 flex justify-between items-center">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">Compatibilidade (IA Match)</span>
                  <span className="text-emerald-400 font-black text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    {vagaSelecionada.match_score}% de Match
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Link Oficial da Vaga</span>
              <div className="bg-[#050811] p-3 rounded-xl border border-blue-950/60 text-xs font-mono text-blue-400 truncate">
                {vagaSelecionada.link && vagaSelecionada.link !== 'N/A' ? vagaSelecionada.link : 'Link direto indisponível'}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setVagaSelecionada(null)}
                className="bg-[#050811] hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition border border-blue-950/60 cursor-pointer"
              >
                Fechar
              </button>
              {vagaSelecionada.link && vagaSelecionada.link !== 'N/A' && (
                <a
                  href={vagaSelecionada.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Acessar Vaga Original <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rodapé da Página com links para LinkedIn e GitHub */}
      <footer className="max-w-7xl w-full mx-auto border-t border-blue-950/60 pt-6 pb-4 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4 mt-12">
        <div>
          <span className="font-extrabold text-slate-200 tracking-wider">JOB SEEKER</span>
          <span className="mx-2 text-slate-600">|</span>
          <span>
            Desenvolvido por <strong className="text-slate-300 font-semibold">Felipe Reges De Albuquerque</strong>
          </span>
        </div>

        {/* Links Sociais (LinkedIn e GitHub) */}
        <div className="flex items-center gap-4">
          <a 
            href="https://www.linkedin.com/in/felipe-albuquerque-66334b280/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition font-medium bg-[#0b1329] px-3 py-1.5 rounded-lg border border-blue-950/60"
          >
            <Linkedin size={14} className="text-blue-400" /> LinkedIn
          </a>
          <a 
            href="https://github.com/feliperegesde" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition font-medium bg-[#0b1329] px-3 py-1.5 rounded-lg border border-blue-950/60"
          >
            <Github size={14} className="text-slate-200" /> GitHub
          </a>
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