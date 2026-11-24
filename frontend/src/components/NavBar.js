import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';
import { useFavoritos } from '../context/FavoritosContext';

function linkClasse(ativo) {
  return ativo ? 'nav-link ativo' : 'nav-link';
}

export default function NavBar() {
  const location = useLocation();
  const { totalItens } = useCarrinho();
  const { favoritos } = useFavoritos();
  const [menuAberto, setMenuAberto] = useState(false);

  const fechar = () => setMenuAberto(false);

  return (
    <nav>
      <Link to="/" className="nav-logo" onClick={fechar}>⚽ LOPES STORES</Link>

      <button
        type="button"
        className="nav-hamburger"
        aria-label="Abrir menu"
        aria-expanded={menuAberto}
        onClick={() => setMenuAberto(prev => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={menuAberto ? 'nav-links aberto' : 'nav-links'}>
        <Link to="/" className={linkClasse(location.pathname === '/')} onClick={fechar}>
          Catálogo
        </Link>
        <Link to="/favoritos" className={linkClasse(location.pathname === '/favoritos')} onClick={fechar}>
          ♥ Favoritos
          {favoritos.length > 0 && <span className="badge">{favoritos.length}</span>}
        </Link>
        <Link to="/rastrear-pedido" className={linkClasse(location.pathname === '/rastrear-pedido')} onClick={fechar}>
          Rastrear Pedido
        </Link>
        <Link to="/carrinho" className={linkClasse(location.pathname === '/carrinho')} onClick={fechar}>
          🛒 Carrinho
          {totalItens > 0 && <span className="badge">{totalItens}</span>}
        </Link>
      </div>
    </nav>
  );
}
