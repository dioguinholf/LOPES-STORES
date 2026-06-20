import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Carrinho from './pages/Carrinho';
import './App.css';

function App() {
  const [carrinho, setCarrinho] = useState([]);

  const adicionarCarrinho = (camisa) => setCarrinho([...carrinho, camisa]);
  const removerCarrinho = (index) => setCarrinho(carrinho.filter((_, i) => i !== index));
  const limparCarrinho = () => setCarrinho([]);

  return (
    <BrowserRouter>
      <nav>
        <div className="nav-logo">⚽ LOPES STORES</div>
        <div className="nav-links">
          <Link to="/">Catálogo</Link>
          <Link to="/carrinho">
            🛒 Carrinho {carrinho.length > 0 && <span className="badge">{carrinho.length}</span>}
          </Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home adicionarCarrinho={adicionarCarrinho} />} />
        <Route path="/carrinho" element={
          <Carrinho carrinho={carrinho} removerCarrinho={removerCarrinho} limparCarrinho={limparCarrinho} />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
