import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { Job } from './types/job';
import { Search, Play, RefreshCw, Briefcase, Building, ExternalLink, Layers, Linkedin, Github, Sparkles, Download, X, Eye, BarChart3, PieChart as PieIcon, Sun, Moon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = 'http://localhost:8000/api';

const getSourceStyles = (fonte: string, isDark: boolean) => {
  const key = (fonte || '').toLowerCase();
  const styles: Record<string, string> = {
    linkedin: isDark ? 'bg-blue-950/60 text-blue-400 border-blue-800/40' : 'bg-blue-100 text-blue-700 border-blue-300',
    gupy: isDark ? 'bg-violet-950/60 text-violet-400 border-violet-800/40' : 'bg-violet-100 text-violet-700 border-violet-300',
    indeed: isDark ? 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40' : 'bg-cyan-100 text-cyan-700 border-cyan-300',
  };
  return styles[key] ?? (isDark ? 'bg-slate-900/60 text-slate-300 border-slate-700/40' : 'bg-slate-200 text-slate-700 border-slate-300');
};

const getCompanyStyles = (empresa: string, isDark: boolean) => {
  const key = (empresa || '').toLowerCase();
  const styles: Record<string, string> = {
    google: 'bg-blue-500 text-white',
    meta: 'bg-blue-600 text-white',
    amazon: 'bg-orange-500 text-white',
    microsoft: 'bg-sky-500 text-white',
    nubank: 'bg-purple-600 text-white',
    openai: isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-900 text-white',
    aws: 'bg-orange-500 text-white',
    apple: isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-900 text-white',
    'itaú': 'bg-orange-500 text-white',
    itau: 'bg-orange-500 text-white',
    spotify: 'bg-green-500 text-white',
    stripe: 'bg-indigo-500 text-white',
    cloudflare: 'bg-orange-500 text-white',
  };
  return styles[key] ?? (isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-200 text-slate-800 border border-slate-300');
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

  // Estado de Tema (Dark / Light)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

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

  const analyticsData = useMemo(() => {
    const techKeywords = ['Python', 'SQL', 'React', 'AWS', 'Machine Learning', 'Java', 'Docker', 'TypeScript', 'Node.js', 'Pandas'];
    const counts: Record<string, number> = {};
    techKeywords.forEach(t => counts[t] = 0);

    jobs.forEach(job => {
      const text = ((job.titulo_vaga || '') + " " + (job.empresa || '')).toLowerCase();
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

  // Classes dinâmicas baseadas no estado isDarkMode
  const bgMain = isDarkMode ? 'bg-[#070b14] text-slate-100' : 'bg-slate-100 text-slate-800';
  const bgCard = isDarkMode ? 'bg-[#0b1329] border-blue-950/50' : 'bg-white border-slate-200 shadow-sm';
  const bgInner = isDarkMode ? 'bg-[#050811] border-blue-950/60 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800';
  const textSub = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen ${bgMain} p-6 md:p-10 font-sans flex flex-col justify-between transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto space-y-6 w-full">
        
        {/* Header Superior */}
        <header className={`flex flex-col md:flex-row justify-between items-start md:items-center ${bgCard} border p-6 rounded-2xl gap-4 shadow-xl`}>
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white font-black px-3.5 py-2.5 rounded-xl text-sm tracking-wider shadow-md">JS</div>
            <div>
              <h1 className={`text-xl font-extrabold tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'} m-0 p-0`}>JOB SEEKER</h1>
              <p className={`text-xs ${isDarkMode ? 'text-blue-400/80' : 'text-blue-600'} font-medium tracking-wide mt-0.5`}>
                Market Intelligence <span className={textSub}>•</span> Real-Time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className={`text-xs ${textSub} font-mono ${bgInner} px-3.5 py-2 rounded-xl border`}>
              {currentDateTime}
            </span>
            
            {/* Botão Dark / Light Theme */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center justify-center p-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm border ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'
              }`}
              title="Alternar Tema"
            >
              {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-blue-600" />}
            </button>

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
          <p className={`text-xs ${textSub} font-medium tracking-wide`}>
            Pipeline de Dados & Inteligência de Mercado em Tempo Real (FastAPI + React + TS)
          </p>
          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              isDarkMode 
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30' 
                : 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200'
            }`}
          >
            <Download size={14} /> Exportar CSV ({filteredJobs.length})
          </button>
        </div>

        {/* Cards de Métricas (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className={`${bgCard} border p-6 rounded-2xl relative overflow-hidden shadow-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-[11px] font-bold ${textSub} uppercase tracking-wider`}>Total de Vagas Coletadas</p>
                <h3 className={`text-4xl font-extrabold mt-2 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'} tracking-tight`}>{totalJobs}</h3>
              </div>
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                <Briefcase size={20} />
              </div>
            </div>
            <div className={`w-full ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-200'} h-1.5 rounded-full mt-5 overflow-hidden`}>
              <div className="bg-blue-600 h-full rounded-full w-3/4"></div>
            </div>
          </div>

          <div className={`${bgCard} border p-6 rounded-2xl relative overflow-hidden shadow-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-[11px] font-bold ${textSub} uppercase tracking-wider`}>Empresas Mapeadas</p>
                <h3 className={`text-4xl font-extrabold mt-2 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'} tracking-tight`}>{uniqueCompanies}</h3>
              </div>
              <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl border border-sky-500/20">
                <Building size={20} />
              </div>
            </div>
            <div className={`w-full ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-200'} h-1.5 rounded-full mt-5 overflow-hidden`}>
              <div className="bg-blue-600 h-full rounded-full w-4/5"></div>
            </div>
          </div>

          <div className={`${bgCard} border p-6 rounded-2xl relative overflow-hidden shadow-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-[11px] font-bold ${textSub} uppercase tracking-wider`}>Fontes Ativas</p>
                <h3 className={`text-4xl font-extrabold mt-2 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'} tracking-tight`}>{sourcesCount}</h3>
              </div>
              <div className="p-2.5 bg-violet-500/10 text-violet-500 rounded-xl border border-violet-500/20">
                <Layers size={20} />
              </div>
            </div>
            <div className={`w-full ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-200'} h-1.5 rounded-full mt-5 overflow-hidden`}>
              <div className="bg-blue-600 h-full rounded-full w-1/3"></div>
            </div>
          </div>
        </div>

        {/* Bloco de Gráficos de Inteligência de Mercado (Analytics) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Gráfico de Barras: Top Tecnologias */}
          <div className={`${bgCard} border p-6 rounded-2xl shadow-lg flex flex-col`}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className={isDarkMode ? "text-blue-500" : "text-blue-600"} />
              <h2 className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} uppercase tracking-wider`}>Demanda por Tecnologias</h2>
            </div>
            <div className="h-64 w-full">
              {analyticsData.barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.barData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <XAxis dataKey="name" stroke={isDarkMode ? "#64748b" : "#64748b"} fontSize={11} angle={-30} textAnchor="end" />
                    <YAxis stroke={isDarkMode ? "#64748b" : "#64748b"} fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#050811' : '#ffffff', borderColor: isDarkMode ? '#1e3a8a' : '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: isDarkMode ? '#f8fafc' : '#1e293b' }} />
                    <Bar dataKey="vagas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={`h-full flex items-center justify-center text-xs ${textSub}`}>
                  Execute uma coleta para gerar estatísticas de tecnologias.
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Pizza: Distribuição por Senioridade */}
          <div className={`${bgCard} border p-6 rounded-2xl shadow-lg flex flex-col`}>
            <div className="flex items-center gap-2 mb-4">
              <PieIcon size={18} className={isDarkMode ? "text-purple-400" : "text-purple-600"} />
              <h2 className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} uppercase tracking-wider`}>Distribuição por Senioridade</h2>
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
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#050811' : '#ffffff', borderColor: isDarkMode ? '#1e3a8a' : '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: isDarkMode ? '#f8fafc' : '#1e293b' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className={`h-full flex items-center justify-center text-xs ${textSub}`}>
                  Execute uma coleta para gerar estatísticas de senioridade.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bloco de Disparar Scraping com Seletor de País */}
        <div className={`${bgCard} border p-5 rounded-2xl shadow-lg space-y-3`}>
          <h2 className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2 uppercase tracking-wider m-0`}>
            <Search size={15} className={isDarkMode ? "text-blue-500" : "text-blue-600"} /> Disparar Scraping
          </h2>

          <form onSubmit={handleScrape} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 ${bgInner} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition placeholder-slate-400`}
              placeholder="CARGO OU TECNOLOGIA"
            />
            
            <select
              value={paisScrape}
              onChange={(e) => setPaisScrape(e.target.value)}
              className={` ${bgInner} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 cursor-pointer`}
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
        <div className={`${bgCard} border p-5 rounded-2xl shadow-lg space-y-3`}>
          <h2 className={`text-xs font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} flex items-center gap-2 uppercase tracking-wider m-0`}>
            <Sparkles size={15} className={isDarkMode ? "text-purple-400" : "text-purple-600"} /> IA Match Engine (Upload de Currículo PDF ou Texto)
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
                className={`w-full ${bgInner} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition resize-none placeholder-slate-400`}
              />
              
              <div className={`flex flex-col justify-center ${bgInner} border-dashed border rounded-xl px-4 py-3 text-sm`}>
                <label className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} font-semibold mb-1 cursor-pointer flex items-center gap-2`}>
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
                <span className={`text-xs ${textSub} truncate`}>
                  {selectedFile ? `Arquivo: ${selectedFile.name}` : 'Nenhum arquivo selecionado'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              {modoMatchAtivo ? (
                <span className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} font-semibold animate-pulse flex items-center gap-1`}>
                  ✨ Vagas ordenadas por compatibilidade de IA (PDF/Texto)!
                </span>
              ) : (
                <span className={`text-xs ${textSub}`}>
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
        <div className={`${bgCard} border p-5 rounded-2xl shadow-lg space-y-4`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <h2 className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider m-0`}>Filtros Dinâmicos & Senioridade</h2>
            
            <div className="flex flex-wrap gap-2">
              {['ALL', 'Estágio', 'Junior', 'Pleno', 'Senior'].map((nivel) => (
                <button
                  key={nivel}
                  onClick={() => setSelectedNivel(nivel)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    selectedNivel === nivel
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                      : `${bgInner}${textSub} hover:border-blue-500`
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
                className={`w-full ${bgInner} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-400`}
              />
            </div>
            <div>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className={`w-full ${bgInner} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 cursor-pointer`}
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
        <div className={`${bgCard} border rounded-2xl p-6 shadow-xl flex flex-col mb-6`}>
          <div className={`flex justify-between items-center mb-6 border-b ${isDarkMode ? 'border-blue-950/40' : 'border-slate-200'} pb-4`}>
            <h2 className={`text-sm font-bold flex items-center gap-2 uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} m-0`}>
              <Briefcase size={16} className={isDarkMode ? "text-blue-500" : "text-blue-600"} /> Vagas Encontradas
            </h2>
            <span className="text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
              {filteredJobs.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-blue-950/40 text-slate-400' : 'border-slate-200 text-slate-500'} text-[11px] uppercase tracking-wider`}>
                  <th className="py-3 px-4 font-bold">Cargo / Vaga</th>
                  <th className="py-3 px-4 font-bold">Empresa</th>
                  <th className="py-3 px-4 font-bold">Fonte</th>
                  {modoMatchAtivo && <th className="py-3 px-4 font-bold text-center">Match IA</th>}
                  <th className="py-3 px-4 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-blue-950/20' : 'divide-slate-100'} text-sm`}>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, index) => (
                    <tr 
                      key={index} 
                      onClick={() => setVagaSelecionada(job)}
                      className={`hover:${isDarkMode ? 'bg-blue-950/25' : 'bg-slate-50'} transition cursor-pointer`}
                      title="Clique para ver os detalhes completos"
                    >
                      <td className={`py-4 px-4 font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {job.titulo_vaga}
                        {job.nivel && job.nivel !== 'Não Especificado' && (
                          <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${isDarkMode ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'bg-slate-100 text-blue-600 border border-slate-300'}`}>
                            {job.nivel}
                          </span>
                        )}
                      </td>
                      <td className={`py-4 px-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2`}>
                        <span
                          className={`w-5 h-5 rounded-md font-bold text-[10px] flex items-center justify-center ${getCompanyStyles(
                            job.empresa,
                            isDarkMode
                          )}`}
                        >
                          {job.empresa ? job.empresa.charAt(0) : '?'}
                        </span>
                        {job.empresa}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getSourceStyles(
                            job.fonte,
                            isDarkMode
                          )}`}
                        >
                          @{job.fonte}
                        </span>
                      </td>
                      {modoMatchAtivo && (
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            (job.match_score ?? 0) > 20 
                              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' 
                              : (job.match_score ?? 0) > 5 
                              ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' 
                              : `${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`
                          }`}>
                            {job.match_score ?? 0}%
                          </span>
                        </td>
                      )}
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setVagaSelecionada(job)}
                            className={`${textSub} hover:${isDarkMode ? 'text-white' : 'text-slate-900'} text-xs font-bold inline-flex items-center gap-1 transition p-1 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-100 border-slate-200'} rounded-lg border`}
                            title="Detalhes"
                          >
                            <Eye size={14} />
                          </button>
                          {job.link && job.link !== 'N/A' ? (
                            <a
                              href={job.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-400 text-xs font-bold inline-flex items-center gap-1 transition"
                            >
                              Ver Vaga <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span className="text-slate-500 text-xs font-medium">Indisponível</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={modoMatchAtivo ? 5 : 4} className={`py-8 px-4 text-center ${textSub} text-sm`}>
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
          <div className={`${bgCard} border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative`}>
            <button
              onClick={() => setVagaSelecionada(null)}
              className={`absolute top-4 right-4 ${textSub} hover:${isDarkMode ? 'text-white' : 'text-slate-900'} ${bgInner} p-2 rounded-xl border transition cursor-pointer`}
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <span className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center ${getCompanyStyles(vagaSelecionada.empresa, isDarkMode)}`}>
                {vagaSelecionada.empresa ? vagaSelecionada.empresa.charAt(0) : '?'}
              </span>
              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSourceStyles(vagaSelecionada.fonte, isDarkMode)} mb-1`}>
                  @{vagaSelecionada.fonte}
                </span>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-tight`}>{vagaSelecionada.titulo_vaga}</h3>
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-3 ${bgInner} p-4 rounded-xl border text-xs`}>
              <div>
                <span className={`${textSub} block uppercase font-bold tracking-wider`}>Empresa</span>
                <span className={`${isDarkMode ? 'text-slate-200' : 'text-slate-800'} font-semibold text-sm`}>{vagaSelecionada.empresa}</span>
              </div>
              <div>
                <span className={`${textSub} block uppercase font-bold tracking-wider`}>Senioridade</span>
                <span className="text-blue-500 font-semibold text-sm">{vagaSelecionada.nivel || 'Não Especificado'}</span>
              </div>
              {vagaSelecionada.match_score !== undefined && (
                <div className={`col-span-2 pt-2 border-t ${isDarkMode ? 'border-blue-950/40' : 'border-slate-200'} mt-1 flex justify-between items-center`}>
                  <span className={`${textSub} uppercase font-bold tracking-wider`}>Compatibilidade (IA Match)</span>
                  <span className="text-emerald-400 font-black text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    {vagaSelecionada.match_score}% de Match
                  </span>
                </div>
              )}
            </div>

            {/* Bloco de Skill Gap */}
            {Array.isArray(vagaSelecionada.skills_faltantes) && vagaSelecionada.skills_faltantes.length > 0 && (
              <div className={`${bgInner} p-4 rounded-xl border border-amber-500/30 text-xs space-y-2`}>
                <span className="text-amber-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                  ⚠️ Skill Gap (Tecnologias sugeridas para esta vaga):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {vagaSelecionada.skills_faltantes.map((skill, idx) => (
                    <span key={idx} className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-semibold text-[11px]">
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className={`text-xs font-bold ${textSub} uppercase tracking-wider block`}>Link Oficial da Vaga</span>
              <div className={`${bgInner} p-3 rounded-xl border text-xs font-mono text-blue-500 truncate`}>
                {vagaSelecionada.link && vagaSelecionada.link !== 'N/A' ? vagaSelecionada.link : 'Link direto indisponível'}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setVagaSelecionada(null)}
                className={`${bgInner} hover:${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} px-4 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer`}
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
      <footer className={`max-w-7xl w-full mx-auto border-t ${isDarkMode ? 'border-blue-950/60' : 'border-slate-200'} pt-6 pb-4 flex flex-col md:flex-row justify-between items-center text-xs ${textSub} gap-4 mt-12`}>
        <div>
          <span className={`font-extrabold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} tracking-wider`}>JOB SEEKER</span>
          <span className="mx-2 text-slate-500">|</span>
          <span>
            Desenvolvido por <strong className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} font-semibold`}>Felipe Reges De Albuquerque</strong>
          </span>
        </div>

        {/* Links Sociais (LinkedIn e GitHub) */}
        <div className="flex items-center gap-4">
          <a 
            href="https://www.linkedin.com/in/felipe-albuquerque-66334b280/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300 hover:text-blue-400 bg-[#0b1329] border-blue-950/60' : 'text-slate-700 hover:text-blue-600 bg-white border-slate-200 shadow-sm'} transition font-medium px-3 py-1.5 rounded-lg border`}
          >
            <Linkedin size={14} className="text-blue-500" /> LinkedIn
          </a>
          <a 
            href="https://github.com/feliperegesde" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300 hover:text-white bg-[#0b1329] border-blue-950/60' : 'text-slate-700 hover:text-slate-900 bg-white border-slate-200 shadow-sm'} transition font-medium px-3 py-1.5 rounded-lg border`}
          >
            <Github size={14} className={isDarkMode ? "text-slate-200" : "text-slate-800"} /> GitHub
          </a>
        </div>

        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Sistema Ativo</span>
        </div>
      </footer>
    </div>
  );
}

export default App;