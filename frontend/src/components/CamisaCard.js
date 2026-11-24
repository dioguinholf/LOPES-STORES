import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';
import { useFavoritos } from '../context/FavoritosContext';
import { useToast } from '../context/ToastContext';
import { TAMANHOS, IMG_FALLBACK } from '../constants';

export default function CamisaCard({ camisa }) {
  const { adicionarCarrinho } = useCarrinho();
  const { isFavorito, alternarFavorito } = useFavoritos();
  const { mostrarToast } = useToast();
  const [tamanho, setTamanho] = useState('M');
  const [adicionado, setAdicionado] = useState(false);

  const handleAdicionar = () => {
    adicionarCarrinho(camisa, tamanho, 1);
    mostrarToast(`${camisa.nome} adicionada ao carrinho`, 'sucesso');
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  };

  return (
    <div className="card">
      <button
        type="button"
        className={isFavorito(camisa.id) ? 'favorito-btn ativo' : 'favorito-btn'}
        aria-label="Favoritar"
        onClick={() => alternarFavorito(camisa.id)}
      >
        {isFavorito(camisa.id) ? '♥' : '♡'}
      </button>
      <Link to={`/produto/${camisa.id}`}>
        <img
          className="card-img"
          src={camisa.imagem_url || IMG_FALLBACK}
          alt={camisa.nome}
          onError={e => { e.target.src = IMG_FALLBACK; }}
        />
      </Link>
      <div className="card-badge">{camisa.tipo}</div>
      <div className="card-body">
        <p className="time">{camisa.time}</p>
        <Link to={`/produto/${camisa.id}`} className="card-titulo-link">
          <h3>{camisa.nome}</h3>
        </Link>
        <p className="temporada">Temporada {camisa.temporada}</p>
        <div className="card-footer">
          <div>
            <p className="preco">R$ {parseFloat(camisa.preco).toFixed(2)}</p>
            <p className="estoque">Estoque: {camisa.estoque} un.</p>
          </div>
        </div>
        <div className="tamanhos-card">
          {TAMANHOS.map(t => (
            <button
              key={t}
              type="button"
              className={tamanho === t ? 'tamanho-btn ativo' : 'tamanho-btn'}
              onClick={() => setTamanho(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <button onClick={handleAdicionar} disabled={camisa.estoque === 0}>
          {adicionado ? '✓ Adicionado!' : camisa.estoque === 0 ? 'Sem estoque' : '+ Adicionar ao carrinho'}
        </button>
      </div>
    </div>
  );
}
