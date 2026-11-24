import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritosContext = createContext(null);

const CHAVE_STORAGE = 'lopes_favoritos';

function carregarFavoritos() {
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState(carregarFavoritos);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(favoritos));
    } catch {
      // localStorage indisponível — segue só em memória
    }
  }, [favoritos]);

  const alternarFavorito = (id) => {
    setFavoritos(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const isFavorito = (id) => favoritos.includes(id);

  const value = { favoritos, alternarFavorito, isFavorito };

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>;
}

export function useFavoritos() {
  const ctx = useContext(FavoritosContext);
  if (!ctx) throw new Error('useFavoritos precisa ser usado dentro de um FavoritosProvider');
  return ctx;
}
