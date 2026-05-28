import { useRef, useEffect } from 'react';

/**
 * Smooth line/area chart drawn on Canvas.
 * Shows last 6 months of income vs expenses.
 */
export default function ExpenseChart({ transactions, selectedYear, selectedMonth, months, t }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Size the canvas
    const rect = canvas.parentElement.getBoundingClientRect();
    const W = rect.width;
    const H = 220;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    // Compute 6 months of data (going back from selected month)
    const data = [];
    for (let i = 5; i >= 0; i--) {
      let m = selectedMonth - i;
      let y = selectedYear;
      while (m < 0) { m += 12; y--; }
      while (m > 11) { m -= 12; y++; }

      const monthTx = transactions.filter(tx => {
        const d = new Date(tx.date);
        return d.getFullYear() === y && d.getMonth() === m;
      });

      data.push({
        label: (months[m] || '').substring(0, 3),
        income: monthTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0),
        expense: monthTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0),
      });
    }

    // Chart layout
    const pad = { top: 28, right: 16, bottom: 36, left: 56 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;

    const allVals = data.flatMap(d => [d.income, d.expense]);
    const maxVal = Math.max(...allVals, 1);

    const xStep = cW / Math.max(data.length - 1, 1);
    const toX = (i) => pad.left + i * xStep;
    const toY = (v) => pad.top + cH - (v / maxVal) * cH;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = '#eef0f3';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (cH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
    }

    // Grid value labels
    ctx.fillStyle = '#9aa0aa';
    ctx.font = '600 10px Manrope, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = maxVal - (maxVal / 4) * i;
      const y = pad.top + (cH / 4) * i;
      ctx.fillText(formatShort(val), pad.left - 8, y + 3);
    }

    // Month labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5c6370';
    ctx.font = '700 10px Manrope, sans-serif';
    data.forEach((d, i) => {
      ctx.fillText(d.label, toX(i), H - 8);
    });

    // Draw smooth curves
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#f6821f';

    drawSmoothLine(ctx, data.map((d, i) => [toX(i), toY(d.expense)]), primary, cH + pad.top, true);
    drawSmoothLine(ctx, data.map((d, i) => [toX(i), toY(d.income)]), '#6c757d', cH + pad.top, false);

    // Dots
    data.forEach((d, i) => {
      // Expense dot
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(toX(i), toY(d.expense), 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Income dot
      ctx.fillStyle = '#6c757d';
      ctx.beginPath();
      ctx.arc(toX(i), toY(d.income), 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Legend
    ctx.font = '600 10px Manrope, sans-serif';
    const legX = pad.left + 4;
    const legY = 14;
    // Expense
    ctx.fillStyle = primary;
    ctx.fillRect(legX, legY - 6, 12, 4);
    ctx.fillStyle = '#5c6370';
    ctx.textAlign = 'left';
    ctx.fillText(t('dashboard.expenses'), legX + 16, legY);
    // Income
    const offset = 16 + ctx.measureText(t('dashboard.expenses')).width + 20;
    ctx.fillStyle = '#6c757d';
    ctx.fillRect(legX + offset, legY - 6, 12, 4);
    ctx.fillStyle = '#5c6370';
    ctx.fillText(t('dashboard.income'), legX + offset + 16, legY);

  }, [transactions, selectedYear, selectedMonth, months, t]);

  return (
    <div className="chart-canvas-wrapper">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

// Helpers ─────────────────────────────────────────────────────
function formatShort(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
  return Math.round(n).toString();
}

function drawSmoothLine(ctx, pts, color, baseY, fill) {
  if (pts.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);

  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cpx = (x0 + x1) / 2;
    ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
  }

  if (fill) {
    ctx.lineTo(pts[pts.length - 1][0], baseY);
    ctx.lineTo(pts[0][0], baseY);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, baseY);
    grad.addColorStop(0, color + '30');
    grad.addColorStop(1, color + '05');
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Stroke on top
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cpx = (x0 + x1) / 2;
    ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}
