import React from 'react';

const ICONES = { sucesso: '✓', erro: '✕', info: 'ℹ' };

export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.tipo}`}>
          <span className="toast-icone">{ICONES[t.tipo] || ICONES.info}</span>
          {t.mensagem}
        </div>
      ))}
    </div>
  );
}
