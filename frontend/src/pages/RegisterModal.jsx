import { useState } from "react";
import Modal from "../components/common/Modal";
import { register } from "../api/authApi";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        password: "",
      });
      setLoading(true);

      await register(form);
      onSuccess();
    } catch (err) {
        const data = err?.data || null;

        if (data && typeof data === "object" && !Array.isArray(data) && !data.error) {
          setFieldErrors({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            password: data.password || "",
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
    <Modal title="Kayıt Ol" onClose={onClose} maxWidth="max-w-xl">
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
            placeholder="ornek@mail.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={loading}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Şifre <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                fieldErrors.password
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
              }`}
              placeholder="Şifre"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </Modal>
  );
}