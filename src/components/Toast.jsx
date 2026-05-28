export default function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div className="alert-toast no-print">
      <span>{message}</span>
    </div>
  );
}
