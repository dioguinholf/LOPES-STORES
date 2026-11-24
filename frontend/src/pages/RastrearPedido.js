import React, { useState } from 'react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import { SkeletonLinha } from '../components/Skeleton';

function RastrearPedido() {
  const [numeroPedido, setNumeroPedido] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [pedido, setPedido] = useState(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  const buscar = async (e) => {
    e.preventDefault();
    const id = numeroPedido.trim();
    if (!/^\d+$/.test(id)) {
      setErro('Informe um número de pedido válido (apenas números).');
      return;
    }
    setErro('');
    setNaoEncontrado(false);
    setPedido(null);
    setCarregando(true);
    try {
      const r = await api.get(`/api/pedidos/${id}`);
      setPedido(r.data);
    } catch (e2) {
      if (e2.response && e2.response.status === 404) setNaoEncontrado(true);
      else setErro('Erro ao buscar pedido. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container">
      <h1>📦 Rastrear Pedido</h1>
      <p className="rastrear-explicacao">
        A busca é feita pelo <strong>número do pedido</strong> que você recebeu na tela de confirmação
        da compra. Ainda não é possível buscar por email.
      </p>

      <form className="rastrear-form" onSubmit={buscar}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Número do pedido (ex: 12)"
          value={numeroPedido}
          onChange={e => setNumeroPedido(e.target.value)}
          className={erro ? 'campo-erro' : ''}
        />
        <button type="submit" disabled={carregando}>
          {carregando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      {erro && <p className="erro-campo">{erro}</p>}

      {carregando && (
        <div className="checkout">
          <SkeletonLinha largura="50%" />
          <SkeletonLinha largura="30%" />
          <SkeletonLinha largura="70%" />
        </div>
      )}

      {naoEncontrado && (
        <EmptyState
          icone="🔎"
          titulo="Pedido não encontrado"
          mensagem="Verifique o número do pedido recebido na confirmação da compra e tente novamente."
        />
      )}

      {pedido && (
        <div className="checkout pedido-encontrado">
          <h3>Pedido #{pedido.id} — {pedido.status}</h3>
          <p>Cliente: {pedido.cliente_nome}</p>
          <p>Total: R$ {parseFloat(pedido.total).toFixed(2)}</p>
          {Array.isArray(pedido.itens) && pedido.itens.length > 0 && (
            <ul className="pedido-itens-lista">
              {pedido.itens.map((item, i) => (
                <li key={i}>
                  {item.quantidade}x {item.camisa} ({item.tamanho}) — R$ {parseFloat(item.preco_unit).toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default RastrearPedido;
