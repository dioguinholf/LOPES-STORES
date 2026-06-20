import React, { useState } from 'react';
import api from '../services/api';

function Carrinho({ carrinho, removerCarrinho, limparCarrinho }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [tamanhos, setTamanhos] = useState({});
  const [pedidoFeito, setPedidoFeito] = useState(null);

  const total = carrinho.reduce((acc, c) => acc + parseFloat(c.preco), 0);

  const setTamanho = (id, tamanho) => setTamanhos({ ...tamanhos, [id]: tamanho });

  const finalizar = async () => {
    if (!nome || !email) { alert('Preencha nome e email!'); return; }
    const itens = carrinho.map(c => ({
      camisa_id: c.id,
      quantidade: 1,
      tamanho: tamanhos[c.id] || 'M'
    }));
    try {
      const r = await api.post('/api/pedidos', { cliente_nome: nome, cliente_email: email, itens });
      setPedidoFeito(r.data);
      limparCarrinho();
    } catch (e) {
      alert('Erro ao finalizar pedido!');
    }
  };

  if (pedidoFeito) return (
    <div className="container">
      <div className="sucesso">
        <h2>✅ Pedido #{pedidoFeito.pedido_id} realizado!</h2>
        <p>Total: R$ {parseFloat(pedidoFeito.total).toFixed(2)}</p>
        <button onClick={() => setPedidoFeito(null)}>Voltar</button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1>🛒 Carrinho</h1>
      {carrinho.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          {carrinho.map((c, i) => (
            <div key={i} className="item-carrinho">
              <div>
                <strong>{c.nome}</strong>
                <p>{c.time} — R$ {parseFloat(c.preco).toFixed(2)}</p>
              </div>
              <div className="item-acoes">
                <select onChange={e => setTamanho(c.id, e.target.value)} defaultValue="M">
                  {['PP','P','M','G','GG','XGG'].map(t => <option key={t}>{t}</option>)}
                </select>
                <button onClick={() => removerCarrinho(i)}>✕</button>
              </div>
            </div>
          ))}
          <div className="checkout">
            <h3>Total: R$ {total.toFixed(2)}</h3>
            <input placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} />
            <input placeholder="Seu email" value={email} onChange={e => setEmail(e.target.value)} />
            <button onClick={finalizar}>Finalizar Pedido</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Carrinho;
