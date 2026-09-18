import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Job } from './types/job';
import { Search, Play, RefreshCw, Briefcase, Building, Globe } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('Ciência de Dados');
  const [loading, setLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>('');

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
        params: { termo: searchTerm }
      });
      await fetchJobs();
    } catch (error) {
      console.error('Erro ao executar scraping:', error);
      alert('Erro ao executar a coleta.');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.titulo_vaga.toLowerCase().includes(filterText.toLowerCase()) ||
    job.empresa.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🚀 Tech Job Market Analytics (TypeScript)</h1>
      <p>Painel de controle frontend tipado integrado ao pipeline de dados em Python.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Painel de Controle / Scraping */}
        <div style={{ background: '#f4f4f5', padding: '1.5rem', borderRadius: '8px' }}>
          <h3><Search size={18} /> Disparar Coleta</h3>
          <form onSubmit={handleScrape} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <label>Cargo ou Tecnologia:</label>
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ background: '#2563eb', color: '#fff', padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
              {loading ? 'Coletando...' : 'Executar Scraping'}
            </button>
          </form>

          <hr style={{ margin: '1.5rem 0' }} />

          <h3>Filtro Local</h3>
          <input 
            type="text" 
            placeholder="Filtrar tabela..." 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%', marginTop: '0.5rem' }}
          />
        </div>

        {/* Tabela de Vagas */}
        <div>
          <h3>📋 Vagas Encontradas ({filteredJobs.length})</h3>
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}><Briefcase size={14}/> Cargo</th>
                  <th style={{ padding: '0.75rem' }}><Building size={14}/> Empresa</th>
                  <th style={{ padding: '0.75rem' }}><Globe size={14}/> Fonte</th>
                  <th style={{ padding: '0.75rem' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem' }}>{job.titulo_vaga}</td>
                      <td style={{ padding: '0.75rem' }}>{job.empresa}</td>
                      <td style={{ padding: '0.75rem' }}>{job.fonte}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {job.link && job.link !== 'N/A' ? (
                          <a href={job.link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>Ver Vaga</a>
                        ) : 'Indisponível'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Nenhuma vaga encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;