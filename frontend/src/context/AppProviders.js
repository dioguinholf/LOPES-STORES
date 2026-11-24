import React from 'react';
import { ToastProvider } from './ToastContext';
import { FavoritosProvider } from './FavoritosContext';
import { CarrinhoProvider } from './CarrinhoContext';

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <FavoritosProvider>
        <CarrinhoProvider>
          {children}
        </CarrinhoProvider>
      </FavoritosProvider>
    </ToastProvider>
  );
}
