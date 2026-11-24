import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useFavoritos } from '../context/FavoritosContext';
import CamisaCard from '../components/CamisaCard';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

function Favoritos() {
  const { favoritos } = useFavoritos();
  const [camisas, setCamisas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (favoritos.length === 0) {
      setCamisas([]);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    api.get('/api/camisas')
      .then(r => setCamisas(r.data.filter(c => favoritos.includes(c.id))))
      .catch(() => setCamisas([]))
      .finally(() => setCarregando(false));
  }, [favoritos]);

  return (
    <div className="container">
      <h1>♥ Favoritos</h1>

      {carregando ? (
        <div className="grid">
          {Array.from({ length: favoritos.length || 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : camisas.length === 0 ? (
        <EmptyState
          icone="♡"
          titulo="Nenhum favorito ainda"
          mensagem="Toque no coração de uma camisa no catálogo para salvá-la aqui."
          acao={<Link to="/" className="sucesso-link">Ir para o catálogo</Link>}
        />
      ) : (
        <div className="grid">
          {camisas.map(c => <CamisaCard key={c.id} camisa={c} />)}
        </div>
      )}
    </div>
  );
}

export default Favoritos;
