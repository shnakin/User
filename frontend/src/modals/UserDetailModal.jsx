import Modal from "../components/common/Modal";

export default function UserDetailModal({
  user,
  onClose,
  onOpenEdit,
  onOpenDocuments,
}) {
  return (
    <Modal title="Kullanıcı Detayı" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-start gap-3 pt-2">
          <button
            onClick={onOpenEdit}
            className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Düzenle
          </button>

         <div className="relative inline-block">
          <button
            onClick={onOpenDocuments}
            className="rounded-xl bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700"
          >
            Evraklar
          </button>

         {user.documentCount > 0 && (
            <span className="absolute -right-2 -top-2 min-w-[20px] rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white text-center">
              {user.documentCount > 99 ? "99+" : user.documentCount}
            </span>
          )}
        </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Ad</p>
            <p className="mt-1 font-medium text-slate-800">{user.firstName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Soyad</p>
            <p className="mt-1 font-medium text-slate-800">{user.lastName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <p className="text-sm text-slate-500">E-posta</p>
            <p className="mt-1 font-medium text-slate-800">{user.email}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <p className="text-sm text-slate-500">Oluşturulma Zamanı</p>
            <p className="mt-1 font-medium text-slate-800">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleString("tr-TR")
                : "-"}
            </p>
          </div>
        </div>

        
      </div>
    </Modal>
  );
}