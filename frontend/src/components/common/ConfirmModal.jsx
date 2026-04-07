import Modal from "./Modal";

export default function ConfirmModal({
  title = "Onay",
  message,
  confirmText = "Onayla",
  cancelText = "Vazgeç",
  onConfirm,
  onClose,
  loading = false,
}) {
  return (
    <Modal title={title} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-6">
        <p className="text-sm leading-6 text-slate-600">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "İşleniyor..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}