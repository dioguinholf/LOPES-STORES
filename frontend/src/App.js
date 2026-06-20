import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Carrinho from './pages/Carrinho';
import './App.css';

function NavBar({ carrinho }) {
  const location = useLocation();
  return (
    <nav>
      <div className="nav-logo">⚽ LOPES STORES</div>
      <div className="nav-links">
        <Link to="/" style={{ color: location.pathname === '/' ? 'var(--neon)' : '' }}>
          Catálogo
        </Link>
        <Link to="/carrinho" style={{ color: location.pathname === '/carrinho' ? 'var(--neon)' : '' }}>
          🛒 Carrinho
          {carrinho.length > 0 && <span className="badge">{carrinho.length}</span>}
        </Link>
      </div>
    </nav>
  );
}

function App() {
  const [carrinho, setCarrinho] = useState([]);

  const adicionarCarrinho = (camisa) => setCarrinho(prev => [...prev, camisa]);
  const removerCarrinho = (index) => setCarrinho(prev => prev.filter((_, i) => i !== index));
  const limparCarrinho = () => setCarrinho([]);

  return (
    <BrowserRouter>
      <NavBar carrinho={carrinho} />
      <Routes>
        <Route path="/" element={<Home adicionarCarrinho={adicionarCarrinho} />} />
        <Route path="/carrinho" element={
          <Carrinho
            carrinho={carrinho}
            removerCarrinho={removerCarrinho}
            limparCarrinho={limparCarrinho}
          />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
