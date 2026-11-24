import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCarrinho } from '../context/CarrinhoContext';
import { useFavoritos } from '../context/FavoritosContext';
import { useToast } from '../context/ToastContext';
import { SkeletonLinha } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { TAMANHOS, IMG_FALLBACK } from '../constants';

function Produto() {
  const { id } = useParams();
  const { adicionarCarrinho } = useCarrinho();
  const { isFavorito, alternarFavorito } = useFavoritos();
  const { mostrarToast } = useToast();

  const [camisa, setCamisa] = useState(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [tamanho, setTamanho] = useState('M');
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    setCarregando(true);
    setNaoEncontrado(false);
    setCamisa(null);
    setQuantidade(1);
    api.get(`/api/camisas/${id}`)
      .then(r => setCamisa(r.data))
      .catch(e => {
        if (e.response && e.response.status === 404) setNaoEncontrado(true);
        else mostrarToast('Erro ao carregar produto.', 'erro');
      })
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (carregando) {
    return (
      <div className="container">
        <div className="produto-detalhe">
          <div className="skeleton-shimmer produto-detalhe-img-skeleton" />
          <div className="produto-detalhe-info">
            <SkeletonLinha largura="40%" />
            <SkeletonLinha largura="80%" />
            <SkeletonLinha largura="60%" />
          </div>
        </div>
      </div>
    );
  }

  if (naoEncontrado || !camisa) {
    return (
      <div className="container">
        <EmptyState
          icone="👕"
          titulo="Produto não encontrado"
          mensagem="Essa camisa não existe ou foi removida do catálogo."
          acao={<Link to="/" className="sucesso-link">Voltar ao catálogo</Link>}
        />
      </div>
    );
  }

  const handleAdicionar = () => {
    adicionarCarrinho(camisa, tamanho, quantidade);
    mostrarToast(`${camisa.nome} adicionada ao carrinho`, 'sucesso');
  };

  const maxQuantidade = camisa.estoque > 0 ? camisa.estoque : 1;

  return (
    <div className="container">
      <div className="produto-detalhe">
        <div className="produto-detalhe-imagem">
          <img
            src={camisa.imagem_url || IMG_FALLBACK}
            alt={camisa.nome}
            onError={e => { e.target.src = IMG_FALLBACK; }}
          />
        </div>
        <div className="produto-detalhe-info">
          <p className="time">{camisa.time}</p>
          <h1>{camisa.nome}</h1>
          <p className="temporada">Temporada {camisa.temporada} · {camisa.tipo}</p>
          <p className="preco">R$ {parseFloat(camisa.preco).toFixed(2)}</p>
          {camisa.descricao && <p className="produto-descricao">{camisa.descricao}</p>}
          <p className="estoque">Estoque: {camisa.estoque} un.</p>

          <div className="produto-opcao">
            <span className="produto-opcao-label">Tamanho</span>
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
          </div>

          <div className="produto-opcao">
            <span className="produto-opcao-label">Quantidade</span>
            <div className="quantidade-stepper">
              <button type="button" onClick={() => setQuantidade(q => Math.max(1, q - 1))} aria-label="Diminuir quantidade">−</button>
              <span>{quantidade}</span>
              <button type="button" onClick={() => setQuantidade(q => Math.min(maxQuantidade, q + 1))} aria-label="Aumentar quantidade">+</button>
            </div>
          </div>

          <div className="produto-acoes">
            <button onClick={handleAdicionar} disabled={camisa.estoque === 0}>
              {camisa.estoque === 0 ? 'Sem estoque' : '+ Adicionar ao carrinho'}
            </button>
            <button
              type="button"
              className={isFavorito(camisa.id) ? 'favorito-btn-grande ativo' : 'favorito-btn-grande'}
              onClick={() => alternarFavorito(camisa.id)}
            >
              {isFavorito(camisa.id) ? '♥ Favoritado' : '♡ Favoritar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Produto;
