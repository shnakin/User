import { useState } from "react";
import Modal from "../components/common/Modal";
import { updateUser } from "../api/userApi";
import Toast from "../components/common/Toast";

export default function EditUserModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });

  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setFieldErrors({
        firstName: "",
        lastName: "",
        email: "",
      });
      setLoading(true);

      const updated = await updateUser(user.id, form);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        onUpdated(updated);
      }, 1500);
    } catch (err) {
      const data = err?.data || err?.response?.data || null;

      if (data && typeof data === "object" && !Array.isArray(data) && !data.error) {
        setFieldErrors({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        });
        setError("");
      } else if (data?.error) {
        setError(data.error);
      } else {
        setError("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Kullanıcı Düzenle" onClose={onClose} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Ad <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
              fieldErrors.firstName
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
            }`}
            placeholder="İsim"
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            disabled={loading}
          />
          {fieldErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Soyad <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
              fieldErrors.lastName
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
            }`}
            placeholder="Soyisim"
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            disabled={loading}
          />
          {fieldErrors.lastName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            E-posta <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
              fieldErrors.email
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
            }`}
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={loading}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Güncelleniyor..." : "Güncelle"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {showToast && <Toast message="Güncelleme başarılı" />}
    </Modal>
  );
}