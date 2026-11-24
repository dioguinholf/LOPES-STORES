import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CarrinhoContext = createContext(null);

const CHAVE_STORAGE = 'lopes_carrinho';

function carregarCarrinho() {
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

export function CarrinhoProvider({ children }) {
  const [carrinho, setCarrinho] = useState(carregarCarrinho);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(carrinho));
    } catch {
      // localStorage indisponível — segue só em memória
    }
  }, [carrinho]);

  const adicionarCarrinho = (camisa, tamanho = 'M', quantidade = 1) => {
    setCarrinho(prev => {
      const index = prev.findIndex(item => item.id === camisa.id && item.tamanho === tamanho);
      if (index >= 0) {
        const copia = [...prev];
        copia[index] = { ...copia[index], quantidade: copia[index].quantidade + quantidade };
        return copia;
      }
      return [...prev, { ...camisa, tamanho, quantidade }];
    });
  };

  const removerCarrinho = (index) => setCarrinho(prev => prev.filter((_, i) => i !== index));

  const atualizarQuantidade = (index, novaQuantidade) => {
    setCarrinho(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const max = item.estoque || 99;
      const qtd = Math.min(Math.max(1, novaQuantidade), max);
      return { ...item, quantidade: qtd };
    }));
  };

  const limparCarrinho = () => setCarrinho([]);

  const totalItens = useMemo(
    () => carrinho.reduce((acc, item) => acc + item.quantidade, 0),
    [carrinho]
  );

  const totalPreco = useMemo(
    () => carrinho.reduce((acc, item) => acc + parseFloat(item.preco) * item.quantidade, 0),
    [carrinho]
  );

  const value = {
    carrinho,
    adicionarCarrinho,
    removerCarrinho,
    atualizarQuantidade,
    limparCarrinho,
    totalItens,
    totalPreco,
  };

  return <CarrinhoContext.Provider value={value}>{children}</CarrinhoContext.Provider>;
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error('useCarrinho precisa ser usado dentro de um CarrinhoProvider');
  return ctx;
}
