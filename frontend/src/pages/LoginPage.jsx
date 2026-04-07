import { useState } from "react";
import { login } from "../api/authApi";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage({ onLogin, openRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };


 const handleSubmit = async (e) => {
  e.preventDefault();

  let hasError = false;

  const errors = {
    email: "",
    password: "",
  };

  if (!form.email.trim()) {
    errors.email = "E-posta zorunludur";
    hasError = true;
  }
  else if (!isValidEmail(form.email)) {
    errors.email = "Geçerli bir e-posta giriniz";
    hasError = true;
  }

  if (!form.password.trim()) {
    errors.password = "Şifre zorunludur";
    hasError = true;
  }

  setFieldErrors(errors);

  if (hasError) return;

  try {
      setError("");
      setLoading(true);
      const data = await login(form);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

};

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div>
          <div className="mb-6 inline-flex rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-slate-100">
            Evrak Yönetim Sistemi
          </div>

          <h1 className="max-w-md text-4xl font-bold leading-tight">
            Kullanıcılarını ve evraklarını tek ekrandan yönet.
          </h1>

          <p className="mt-5 max-w-md text-slate-300">
            Güvenli kullanıcı kaydı, evrak yükleme, evrak görüntüleme ve detay
            yönetimini tek uygulamada topla.
          </p>
        </div>

        <div className="text-sm text-slate-400">
          Modern React + Spring Boot + PostgreSQL + MinIO mimarisi
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-8">
            <div className="mb-3 inline-flex rounded-2xl bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              Hoş geldin
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Giriş Yap</h2>
            <p className="mt-2 text-sm text-slate-500">
              Hesabına giriş yaparak kullanıcıları ve evrakları yönet.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="E-posta giriniz."
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                className={`w-full rounded-xl border px-4 py-3 pr-12 outline-none transition focus:ring-2 ${
                  fieldErrors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
                }`}
                placeholder="Şifre giriniz."
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={openRegister}
              disabled={loading}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Kayıt Ol
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}