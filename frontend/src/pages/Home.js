import React, { useState, useEffect } from 'react';
import api from '../services/api';

const IMAGENS = {
  'Flamengo':        'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&q=80',
  'Corinthians':     'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=80',
  'Real Madrid':     'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80',
  'Manchester City': 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&q=80',
};

const IMG_FALLBACK = 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=400&q=80';

function Home({ adicionarCarrinho }) {
  const [camisas, setCamisas] = useState([]);
  const [times, setTimes] = useState([]);
  const [timeSelecionado, setTimeSelecionado] = useState('');
  const [adicionados, setAdicionados] = useState({});

  useEffect(() => {
    api.get('/api/times').then(r => setTimes(r.data));
    api.get('/api/camisas').then(r => setCamisas(r.data));
  }, []);

  const filtrar = (time_id) => {
    setTimeSelecionado(time_id);
    const url = time_id ? `/api/camisas?time_id=${time_id}` : '/api/camisas';
    api.get(url).then(r => setCamisas(r.data));
  };

  const handleAdicionar = (camisa) => {
    adicionarCarrinho(camisa);
    setAdicionados(prev => ({ ...prev, [camisa.id]: true }));
    setTimeout(() => setAdicionados(prev => ({ ...prev, [camisa.id]: false })), 1500);
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>LOPES STORES</h1>
        <p>Camisas Oficiais dos Maiores Times do Mundo</p>
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

      <div className="grid">
        {camisas.map(c => (
          <div key={c.id} className="card">
            <img
              className="card-img"
              src={IMAGENS[c.time] || IMG_FALLBACK}
              alt={c.nome}
              onError={e => { e.target.src = IMG_FALLBACK; }}
            />
            <div className="card-badge">{c.tipo}</div>
            <div className="card-body">
              <p className="time">{c.time}</p>
              <h3>{c.nome}</h3>
              <p className="temporada">Temporada {c.temporada}</p>
              <div className="card-footer">
                <div>
                  <p className="preco">R$ {parseFloat(c.preco).toFixed(2)}</p>
                  <p className="estoque">Estoque: {c.estoque} un.</p>
                </div>
              </div>
              <button
                onClick={() => handleAdicionar(c)}
                disabled={c.estoque === 0}
              >
                {adicionados[c.id] ? '✓ Adicionado!' : c.estoque === 0 ? 'Sem estoque' : '+ Adicionar ao carrinho'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
