import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Home({ adicionarCarrinho }) {
  const [camisas, setCamisas] = useState([]);
  const [times, setTimes] = useState([]);
  const [timeSelecionado, setTimeSelecionado] = useState('');

  useEffect(() => {
    api.get('/api/times').then(r => setTimes(r.data));
    api.get('/api/camisas').then(r => setCamisas(r.data));
  }, []);

  const filtrar = (time_id) => {
    setTimeSelecionado(time_id);
    const url = time_id ? `/api/camisas?time_id=${time_id}` : '/api/camisas';
    api.get(url).then(r => setCamisas(r.data));
  };

  return (
    <div className="container">
      <h1>🏟️ Camisas de Time</h1>

      <div className="filtros">
        <button onClick={() => filtrar('')} className={!timeSelecionado ? 'ativo' : ''}>Todos</button>
        {times.map(t => (
          <button key={t.id} onClick={() => filtrar(t.id)} className={timeSelecionado === t.id ? 'ativo' : ''}>
            {t.nome}
          </button>
        ))}
      </div>

      <div className="grid">
        {camisas.map(c => (
          <div key={c.id} className="card">
            <div className="card-badge">{c.tipo}</div>
            <div className="card-img">👕</div>
            <h3>{c.nome}</h3>
            <p className="time">{c.time}</p>
            <p className="temporada">{c.temporada}</p>
            <p className="preco">R$ {parseFloat(c.preco).toFixed(2)}</p>
            <p className="estoque">Estoque: {c.estoque}</p>
            <button onClick={() => adicionarCarrinho(c)} disabled={c.estoque === 0}>
              {c.estoque === 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
