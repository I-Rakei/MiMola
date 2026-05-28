const formatLocalYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function CalendarTab({
  transactions, t,
  selectedYear, selectedMonth, months, days,
  onChangeMonth,
}) {
  const getCalendarDays = () => {
    const result = [];
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daysInPrev = new Date(selectedYear, selectedMonth, 0).getDate();

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      const dt = new Date(selectedYear, selectedMonth - 1, d);
      result.push({ day: d, dateStr: formatLocalYMD(dt), current: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      result.push({ day: i, dateStr, current: true });
    }
    const remaining = 42 - result.length;
    for (let i = 1; i <= remaining; i++) {
      const dt = new Date(selectedYear, selectedMonth + 1, i);
      result.push({ day: i, dateStr: formatLocalYMD(dt), current: false });
    }
    return result;
  };

  const getDayTx = (ds) => transactions.filter(t => t.date === ds);
  const getDayTotal = (ds, type) => getDayTx(ds).filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);

  const today = formatLocalYMD(new Date());

  return (
    <div className="card no-print">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>{months[selectedMonth]} {selectedYear}</span>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => onChangeMonth(-1)}>
            {t('calendar.prevMonth')}
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => onChangeMonth(1)}>
            {t('calendar.nextMonth')}
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="calendar-header-days mb-2">
          {days.map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="calendar-days-grid">
          {getCalendarDays().map((cell, idx) => {
            const exp = getDayTotal(cell.dateStr, 'expense');
            const inc = getDayTotal(cell.dateStr, 'income');
            const dayTx = getDayTx(cell.dateStr);

            return (
              <div key={idx} className={`calendar-day-cell ${cell.current ? '' : 'other-month'} ${cell.dateStr === today ? 'today' : ''}`}>
                <div className="calendar-day-num">{cell.day}</div>
                {cell.current && dayTx.length > 0 && (
                  <div className="calendar-indicator-dots">
                    {dayTx.map(tx => (
                      <div key={tx.id} className="calendar-dot" title={`${tx.description}: MZN ${tx.amount}`}></div>
                    ))}
                  </div>
                )}
                <div className="d-flex flex-column gap-1">
                  {inc > 0 && <div className="calendar-day-total income">+{inc.toLocaleString(undefined, { maximumFractionDigits: 0 })} MZN</div>}
                  {exp > 0 && <div className="calendar-day-total expense">-{exp.toLocaleString(undefined, { maximumFractionDigits: 0 })} MZN</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
