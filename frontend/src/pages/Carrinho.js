import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCarrinho } from '../context/CarrinhoContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Carrinho() {
  const { carrinho, removerCarrinho, atualizarQuantidade, limparCarrinho, totalPreco } = useCarrinho();
  const { mostrarToast } = useToast();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [pedidoFeito, setPedidoFeito] = useState(null);

  const validar = () => {
    const novosErros = {};
    if (!nome.trim()) novosErros.nome = 'Informe seu nome.';
    if (!email.trim()) novosErros.email = 'Informe seu email.';
    else if (!EMAIL_REGEX.test(email.trim())) novosErros.email = 'Email inválido.';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const finalizar = async () => {
    if (!validar()) return;
    const itens = carrinho.map(c => ({
      camisa_id: c.id,
      quantidade: c.quantidade,
      tamanho: c.tamanho || 'M'
    }));
    setEnviando(true);
    try {
      const r = await api.post('/api/pedidos', { cliente_nome: nome, cliente_email: email, itens });
      setPedidoFeito(r.data);
      limparCarrinho();
    } catch (e) {
      mostrarToast('Erro ao finalizar pedido. Tente novamente.', 'erro');
    } finally {
      setEnviando(false);
    }
  };

  if (pedidoFeito) return (
    <div className="container">
      <div className="sucesso">
        <h2>✅ Pedido #{pedidoFeito.pedido_id} realizado!</h2>
        <p>Total: R$ {parseFloat(pedidoFeito.total).toFixed(2)}</p>
        <p className="sucesso-dica">Guarde o número <strong>#{pedidoFeito.pedido_id}</strong> para acompanhar seu pedido depois.</p>
        <div className="sucesso-acoes">
          <Link to="/" className="sucesso-link">Voltar ao catálogo</Link>
          <Link to={`/rastrear-pedido`} className="sucesso-link">Rastrear este pedido</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1>🛒 Carrinho</h1>
      {carrinho.length === 0 ? (
        <EmptyState
          icone="🛒"
          titulo="Seu carrinho está vazio"
          mensagem="Explore o catálogo e adicione suas camisas favoritas."
          acao={<Link to="/" className="sucesso-link">Ir para o catálogo</Link>}
        />
      ) : (
        <>
          {carrinho.map((c, i) => (
            <div key={i} className="item-carrinho">
              <div>
                <strong>{c.nome}</strong>
                <p>{c.time} — R$ {parseFloat(c.preco).toFixed(2)} cada</p>
              </div>
              <div className="item-acoes">
                <span className="tamanho-badge">{c.tamanho || 'M'}</span>
                <div className="quantidade-stepper">
                  <button type="button" onClick={() => atualizarQuantidade(i, c.quantidade - 1)} aria-label="Diminuir quantidade">−</button>
                  <span>{c.quantidade}</span>
                  <button type="button" onClick={() => atualizarQuantidade(i, c.quantidade + 1)} aria-label="Aumentar quantidade">+</button>
                </div>
                <button onClick={() => removerCarrinho(i)}>✕</button>
              </div>
            </div>
          ))}
          <div className="checkout">
            <h3>Total: R$ {totalPreco.toFixed(2)}</h3>
            <input
              placeholder="Seu nome"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className={erros.nome ? 'campo-erro' : ''}
            />
            {erros.nome && <p className="erro-campo">{erros.nome}</p>}
            <input
              placeholder="Seu email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={erros.email ? 'campo-erro' : ''}
            />
            {erros.email && <p className="erro-campo">{erros.email}</p>}
            <button onClick={finalizar} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Finalizar Pedido'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Carrinho;
