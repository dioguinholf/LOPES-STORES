import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

function NaoEncontrado() {
  return (
    <div className="container">
      <EmptyState
        icone="🧭"
        titulo="404 — Página não encontrada"
        mensagem="O endereço que você tentou acessar não existe."
        acao={<Link to="/" className="sucesso-link">Voltar ao catálogo</Link>}
      />
    </div>
  );
}

export default NaoEncontrado;
