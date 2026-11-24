import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppProviders from './context/AppProviders';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import FundoCampo from './components/FundoCampo';
import Home from './pages/Home';
import Produto from './pages/Produto';
import Carrinho from './pages/Carrinho';
import Favoritos from './pages/Favoritos';
import RastrearPedido from './pages/RastrearPedido';
import NaoEncontrado from './pages/NaoEncontrado';
import './App.css';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <FundoCampo />
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produto/:id" element={<Produto />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/rastrear-pedido" element={<RastrearPedido />} />
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
