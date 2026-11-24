import React from 'react';

export default function EmptyState({ icone = '📦', titulo, mensagem, acao }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icone">{icone}</div>
      {titulo && <h3>{titulo}</h3>}
      {mensagem && <p>{mensagem}</p>}
      {acao}
    </div>
  );
}
