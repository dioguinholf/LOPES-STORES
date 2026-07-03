import React, { useState, useEffect } from 'react';
import api from '../services/api';

const IMG_FALLBACK = 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=400&q=80';

const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', 'XGG'];

function Home({ adicionarCarrinho }) {
  const [camisas, setCamisas] = useState([]);
  const [times, setTimes] = useState([]);
  const [timeSelecionado, setTimeSelecionado] = useState('');
  const [adicionados, setAdicionados] = useState({});
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState({});

  useEffect(() => {
    api.get('/api/times').then(r => setTimes(r.data));
    api.get('/api/camisas').then(r => setCamisas(r.data));
  }, []);

  const filtrar = (time_id) => {
    setTimeSelecionado(time_id);
    const url = time_id ? `/api/camisas?time_id=${time_id}` : '/api/camisas';
    api.get(url).then(r => setCamisas(r.data));
  };

  const selecionarTamanho = (camisaId, tamanho) => {
    setTamanhoSelecionado(prev => ({ ...prev, [camisaId]: tamanho }));
  };

  const handleAdicionar = (camisa) => {
    const tamanho = tamanhoSelecionado[camisa.id] || 'M';
    adicionarCarrinho({ ...camisa, tamanho });
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
              src={c.imagem_url || IMG_FALLBACK}
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
              <div className="tamanhos-card">
                {TAMANHOS.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={(tamanhoSelecionado[c.id] || 'M') === t ? 'tamanho-btn ativo' : 'tamanho-btn'}
                    onClick={() => selecionarTamanho(c.id, t)}
                  >
                    {t}
                  </button>
                ))}
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