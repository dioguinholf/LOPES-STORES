import React, { useEffect, useRef } from 'react';

export default function FundoCampo() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const neon = (color, blur = 15) => {
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
      ctx.strokeStyle = color;
    };

    const draw = () => {
      t += 0.004;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fundo gradiente
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0a1128');
      grad.addColorStop(0.5, '#101b3d');
      grad.addColorStop(1, '#0a1128');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;
      const pulse = 0.6 + Math.sin(t) * 0.15;
      const pulse2 = 0.6 + Math.sin(t + 1) * 0.15;

      ctx.lineWidth = 1;

      // Gramado sutil
      for (let i = 0; i < 12; i++) {
        const x = (W / 12) * i;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 40, 20, ${0.3 + (i % 2) * 0.15})`;
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(0, 30, 15, ${0.3 + (i % 2) * 0.15})`;
        ctx.fillRect(x, 0, W / 12, H);
      }

      // Borda do campo
      const mg = W * 0.06;
      const mgV = H * 0.08;
      ctx.lineWidth = 1.5;
      neon(`rgba(214, 52, 71, ${pulse})`, 20);
      ctx.beginPath();
      ctx.strokeRect(mg, mgV, W - mg * 2, H - mgV * 2);

      // Linha do meio
      ctx.beginPath();
      ctx.moveTo(W / 2, mgV);
      ctx.lineTo(W / 2, H - mgV);
      neon(`rgba(214, 52, 71, ${pulse})`, 15);
      ctx.stroke();

      // Círculo central
      const r = Math.min(W, H) * 0.12;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      neon(`rgba(214, 52, 71, ${pulse})`, 20);
      ctx.stroke();

      // Ponto central
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(214, 52, 71, ${pulse})`;
      ctx.shadowColor = '#d63447';
      ctx.shadowBlur = 15;
      ctx.fill();

      // Área esquerda
      const aw = W * 0.13;
      const ah = H * 0.45;
      const ay = (H - ah) / 2;
      ctx.beginPath();
      ctx.strokeRect(mg, ay, aw, ah);
      neon(`rgba(59, 91, 169, ${pulse2})`, 15);
      ctx.stroke();

      // Pequena área esquerda
      const saw = W * 0.055;
      const sah = H * 0.25;
      const say = (H - sah) / 2;
      ctx.beginPath();
      ctx.strokeRect(mg, say, saw, sah);
      neon(`rgba(59, 91, 169, ${pulse2 * 0.8})`, 10);
      ctx.stroke();

      // Área direita
      ctx.beginPath();
      ctx.strokeRect(W - mg - aw, ay, aw, ah);
      neon(`rgba(59, 91, 169, ${pulse2})`, 15);
      ctx.stroke();

      // Pequena área direita
      ctx.beginPath();
      ctx.strokeRect(W - mg - saw, say, saw, sah);
      neon(`rgba(59, 91, 169, ${pulse2 * 0.8})`, 10);
      ctx.stroke();

      // Semicírculo área esquerda
      ctx.beginPath();
      ctx.arc(mg + aw, H / 2, r * 0.7, -Math.PI * 0.4, Math.PI * 0.4);
      neon(`rgba(214, 52, 71, ${pulse * 0.7})`, 12);
      ctx.stroke();

      // Semicírculo área direita
      ctx.beginPath();
      ctx.arc(W - mg - aw, H / 2, r * 0.7, Math.PI * 0.6, Math.PI * 1.4);
      neon(`rgba(214, 52, 71, ${pulse * 0.7})`, 12);
      ctx.stroke();

      // Cantos do campo (arcos)
      const cr = W * 0.025;
      // canto sup esq
      ctx.beginPath();
      ctx.arc(mg, mgV, cr, 0, Math.PI / 2);
      neon(`rgba(242, 169, 59, ${pulse2 * 0.8})`, 10);
      ctx.stroke();
      // canto sup dir
      ctx.beginPath();
      ctx.arc(W - mg, mgV, cr, Math.PI / 2, Math.PI);
      ctx.stroke();
      // canto inf esq
      ctx.beginPath();
      ctx.arc(mg, H - mgV, cr, -Math.PI / 2, 0);
      ctx.stroke();
      // canto inf dir
      ctx.beginPath();
      ctx.arc(W - mg, H - mgV, cr, Math.PI, Math.PI * 1.5);
      ctx.stroke();

      // Pontos de pênalti
      const pp = W * 0.09;
      ctx.beginPath();
      ctx.arc(mg + pp, H / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(242, 169, 59, ${pulse2})`;
      ctx.shadowColor = '#f2a93b';
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(W - mg - pp, H / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Overlay escuro para não competir com o conteúdo
      const overlay = ctx.createLinearGradient(0, 0, 0, H);
      overlay.addColorStop(0, 'rgba(10,17,40,0.55)');
      overlay.addColorStop(0.5, 'rgba(10,17,40,0.45)');
      overlay.addColorStop(1, 'rgba(10,17,40,0.55)');
      ctx.fillStyle = overlay;
      ctx.shadowBlur = 0;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}