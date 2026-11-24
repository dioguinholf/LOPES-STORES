import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CamisaCard from '../components/CamisaCard';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

function Home() {
  const [camisas, setCamisas] = useState([]);
  const [times, setTimes] = useState([]);
  const [timeSelecionado, setTimeSelecionado] = useState('');
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get('/api/times').then(r => setTimes(r.data)).catch(() => {});
    api.get('/api/camisas')
      .then(r => setCamisas(r.data))
      .catch(() => setCamisas([]))
      .finally(() => setCarregando(false));
  }, []);

  const filtrar = (time_id) => {
    setTimeSelecionado(time_id);
    setCarregando(true);
    const url = time_id ? `/api/camisas?time_id=${time_id}` : '/api/camisas';
    api.get(url)
      .then(r => setCamisas(r.data))
      .catch(() => setCamisas([]))
      .finally(() => setCarregando(false));
  };

  const camisasFiltradas = camisas.filter(c => {
    if (!busca.trim()) return true;
    const alvo = busca.trim().toLowerCase();
    return c.nome.toLowerCase().includes(alvo) || c.time.toLowerCase().includes(alvo);
  });

  return (
    <div className="container">
      <div className="hero">
        <h1>LOPES STORES</h1>
        <p>Camisas Oficiais dos Maiores Times do Mundo</p>
      </div>

      <div className="busca-wrapper">
        <input
          type="search"
          className="busca-input"
          placeholder="🔍 Buscar por camisa ou time..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      <div className="filtros">
        <button onClick={() => filtrar('')} className={!timeSelecionado ? 'ativo' : ''}>
          🌍 Todos
        </button>
        {times.map(t => (
          <button
            key={t.id}
            onClick={() => filtrar(t.id)}
            className={timeSelecionado === t.id ? 'ativo' : ''}
          >
            {t.nome}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : camisasFiltradas.length === 0 ? (
        <EmptyState
          icone="🔍"
          titulo="Nenhuma camisa encontrada"
          mensagem={busca ? `Não encontramos resultados para "${busca}".` : 'Não há camisas cadastradas para esse filtro.'}
        />
      ) : (
        <div className="grid">
          {camisasFiltradas.map(c => <CamisaCard key={c.id} camisa={c} />)}
        </div>
      )}
    </div>
  );
}

export default Home;
