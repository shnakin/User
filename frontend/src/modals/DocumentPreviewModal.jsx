import { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import { clearAuthStorage, tryRefreshToken } from "../api/api";

export default function DocumentPreviewModal({ userId, document, onClose }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const isImage = document.contentType?.startsWith("image/");
  const isPdf = document.contentType === "application/pdf";

  useEffect(() => {
    let objectUrl = "";

    const requestPreview = async (accessToken) => {
      return fetch(
        `http://localhost:8080/api/users/${userId}/documents/${document.id}/preview`,
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
    };

    const loadPreview = async () => {
      try {
        setLoading(true);
        setError("");

        let token = localStorage.getItem("token");
        let res = await requestPreview(token);

        if (res.status === 401 || res.status === 403) {
          try {
            token = await tryRefreshToken();
            res = await requestPreview(token);
          } catch (err) {
            clearAuthStorage();
            throw new Error("Oturum süresi doldu, lütfen tekrar giriş yap");
          }
        }

        if (!res.ok) {
          throw new Error("Evrak önizleme alınamadı");
        }

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (err) {
        setError(err.message || "Önizleme yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [userId, document.id]);

  return (
    <Modal
      title={`Evrak Önizleme - ${document.fileName}`}
      onClose={onClose}
      maxWidth="max-w-6xl"
    >
      <div className="space-y-4">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
            Evrak yükleniyor...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && isImage && previewUrl && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <img
              src={previewUrl}
              alt={document.fileName}
              className="mx-auto max-h-[70vh] max-w-full rounded-xl object-contain"
            />
          </div>
        )}

        {!loading && !error && isPdf && previewUrl && (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <iframe
              src={previewUrl}
              title={document.fileName}
              className="h-[70vh] w-full"
            />
          </div>
        )}

        {!loading && !error && !isImage && !isPdf && previewUrl && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-slate-700">
              Bu dosya türü tarayıcı içinde önizlenemiyor.
            </p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block rounded-xl bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700"
            >
              Yeni sekmede aç
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
}