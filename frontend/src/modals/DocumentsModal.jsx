import { useCallback, useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import {
  deleteDocument,
  getDocuments,
  uploadDocument,
  downloadDocument,
} from "../api/documentApi";
import DocumentPreviewModal from "./DocumentPreviewModal";
import ConfirmModal from "../components/common/ConfirmModal";
import { Trash2, Eye, Download } from "lucide-react";

export default function DocumentsModal({ user, onClose, onDocumentsChanged }) {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [previewDocument, setPreviewDocument] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [downloadLoadingId, setDownloadLoadingId] = useState(null);

  const ACCEPTED_FILE_TYPES =
    ".gif,.jpg,.png,.jpeg,.zip,.rar,.xls,.xlsx,.xlt,.xltx,.txt,.doc,.docx,.csv,.odt,.pdf,.ppt,.pptx,.tiff,.tif,.mp4,.wav,.mov,.xer,.eml,.msg,.dxf,.dwg";

  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const loadDocuments = useCallback(async () => {
    try {
      const data = await getDocuments(user.id);
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    }
  }, [user.id]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) {
      setError("Lütfen en az bir dosya seç");
      return;
    }

    const oversizedFiles = files.filter(
      (file) => file.size > MAX_FILE_SIZE_BYTES
    );

    if (oversizedFiles.length > 0) {
      setError(
        `Maksimum dosya boyutu ${MAX_FILE_SIZE_MB} MB olabilir. Büyük dosyalar: ${oversizedFiles
          .map((file) => file.name)
          .join(", ")}`
      );
      return;
    }

    try {
      setError("");
      setMessage("");
      setUploadLoading(true);

      for (const file of files) {
        await uploadDocument(user.id, file);
      }

      await loadDocuments();
      onDocumentsChanged();
      setMessage(
        files.length === 1
          ? "Dosya yüklendi"
          : `${files.length} dosya yüklendi`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      setError("");
      setMessage("");
      setDownloadLoadingId(doc.id);

      await downloadDocument(user.id, doc.id, doc.fileName);
      setMessage(`"${doc.fileName}" indirildi`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadLoadingId(null);
    }
  };

  const requestDelete = (doc) => {
    setDeleteTarget(doc);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setError("");
      setMessage("");
      setDeleteLoading(true);
      await deleteDocument(user.id, deleteTarget.id);
      await loadDocuments();
      onDocumentsChanged();
      setMessage("Evrak silindi");
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "-";

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal title="Evraklar" onClose={onClose} maxWidth="max-w-5xl">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Kullanıcı</p>
          <p className="mt-1 font-medium text-slate-800">
            {user.firstName} {user.lastName}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Evrak Yükleme Alanı
          </h3>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES}
              disabled={uploadLoading}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleUpload(files);
                  e.target.value = "";
                }
              }}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-medium file:text-slate-700 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <p className="mx-auto mt-2 max-w-xl text-center text-xs leading-relaxed text-orange-500">
            Bir veya birden fazla dosya seçebilirsiniz. Sadece gif, jpg, png,
            jpeg, zip, rar, xls, xlsx, xlt, xltx, txt, doc, docx, csv, odt, pdf,
            ppt, pptx, tiff, tif, mp4, wav, mov, xer, eml, msg, dxf, dwg
            dosyaları kabul edilir. Maksimum dosya boyutu 5 MB'dır.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-lg font-semibold text-slate-800">
              Evrak Listesi
            </h3>
          </div>

          {documents.length === 0 ? (
            <div className="px-4 py-6 text-slate-500">Evrak bulunamadı</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-sm font-semibold text-slate-600">
                    <th className="px-4 py-3 text-center">Dosya</th>
                    <th className="px-4 py-3 text-center">Tür</th>
                    <th className="px-4 py-3 text-center">Boyut</th>
                    <th className="px-4 py-3 text-center">Yüklenme Zamanı</th>
                    <th className="px-4 py-3 text-center">İşlemler</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">
                        {doc.fileName}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {doc.contentType}
                      </td>

                      <td
                        className="px-4 py-3 text-slate-600"
                        title={`${doc.size} bytes`}
                      >
                        {formatFileSize(doc.size)}
                      </td>

                      <td className="px-4 py-3 text-slate-600 text-center">
                        {doc.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleString("tr-TR")
                          : "-"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="Önizle"
                            onClick={() => setPreviewDocument(doc)}
                            className="rounded-lg bg-sky-50 p-2 text-sky-600 transition hover:bg-sky-100 hover:text-sky-700"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            type="button"
                            title="İndir"
                            onClick={() => handleDownload(doc)}
                            disabled={downloadLoadingId === doc.id}
                            className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Download size={18} />
                          </button>

                          <button
                            type="button"
                            title="Sil"
                            onClick={() => requestDelete(doc)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {previewDocument && (
        <DocumentPreviewModal
          userId={user.id}
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Evrak Sil"
          message={`"${deleteTarget.fileName}" adlı evrağı silmek istediğine emin misin?`}
          confirmText="Sil"
          cancelText="Vazgeç"
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </Modal>
  );
}