import { X } from "lucide-react";

export default function Modal({
  title,
  children,
  onClose,
  maxWidth = "max-w-2xl",
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
      <div
        className={`w-full ${maxWidth} overflow-hidden rounded-3xl bg-white shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}