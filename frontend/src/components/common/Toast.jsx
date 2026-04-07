export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  const styles =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-600"
      : "border-green-200 bg-green-50 text-green-700";

  return (
    <div className="fixed right-6 top-6 z-[100]">
      <div
        className={`min-w-[280px] rounded-2xl border px-4 py-3 shadow-lg ${styles}`}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={onClose}
            className="text-xs font-medium opacity-70 hover:opacity-100"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}