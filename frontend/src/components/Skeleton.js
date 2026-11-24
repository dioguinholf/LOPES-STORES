import React from 'react';

export function SkeletonCard() {
  return (
    <div className="card skeleton-card">
      <div className="skeleton-shimmer skeleton-img" />
      <div className="card-body">
        <div className="skeleton-shimmer skeleton-linha skeleton-linha-sm" />
        <div className="skeleton-shimmer skeleton-linha skeleton-linha-lg" />
        <div className="skeleton-shimmer skeleton-linha skeleton-linha-sm" />
      </div>
    </div>
  );
}

export function SkeletonLinha({ largura }) {
  return <div className="skeleton-shimmer skeleton-linha" style={largura ? { width: largura } : undefined} />;
}
