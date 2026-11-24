import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-conteudo">
        <div className="footer-marca">
          <span className="footer-logo">⚽ LOPES STORES</span>
          <p>Projeto de estudo — camisas oficiais dos maiores times do mundo.</p>
        </div>
        <nav className="footer-links">
          <Link to="/">Catálogo</Link>
          <Link to="/favoritos">Favoritos</Link>
          <Link to="/rastrear-pedido">Rastrear Pedido</Link>
          <Link to="/carrinho">Carrinho</Link>
        </nav>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} LOPES STORES</p>
    </footer>
  );
}
