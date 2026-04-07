import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import UserTable from "./components/users/UserTable";
import { getUser, getUsers } from "./api/userApi";
import RegisterModal from "./pages/RegisterModal";
import UserDetailModal from "./modals/UserDetailModal";
import EditUserModal from "./modals/EditUserModal";
import DocumentsModal from "./modals/DocumentsModal";
import Toast from "./components/common/Toast";
import { logoutRequest } from "./api/authApi";

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [users, setUsers] = useState([]);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [documentsFromDetail, setDocumentsFromDetail] = useState(false);

  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast({ message: "", type: "success" });
    }, 3000);
  };

  const fetchUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  const refreshSelectedUser = async (id) => {
    const data = await getUser(id);
    setSelectedUser(data);
  };

  const handleSelectUser = async (id) => {
    const data = await getUser(id);
    setSelectedUser(data);
    setEditOpen(false);
    setDocumentsOpen(false);
    setDetailOpen(true);
  };

  const handleOpenDocuments = async (id) => {
    const data = await getUser(id);
    setSelectedUser(data);
    setEditOpen(false);
    setDetailOpen(false);
    setDocumentsFromDetail(false);
    setDocumentsOpen(true);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } catch (err) {
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("loggedInUser");
      setLoggedInUser(null);
      setUsers([]);
      setSelectedUser(null);
      setRegisterOpen(false);
      setEditOpen(false);
      setDocumentsOpen(false);
      showToast("Çıkış yapıldı");
    }
  };

  const handleLoginSuccess = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("loggedInUser", JSON.stringify(data));
    setLoggedInUser(data);
    showToast("Giriş başarılı");
  };

  const handleUserUpdated = async (updatedUser) => {
    setEditOpen(false);
    await fetchUsers();
    await refreshSelectedUser(updatedUser.id);
    showToast("Güncelleme başarılı");
  };

  const handleDocumentsChanged = async () => {
    await fetchUsers();
    if (selectedUser) {
      await refreshSelectedUser(selectedUser.id);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("loggedInUser");

    if (token && userData) {
      setLoggedInUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      fetchUsers();
    }
  }, [loggedInUser]);

  if (!loggedInUser) {
    return (
      <>
        <LoginPage
          onLogin={handleLoginSuccess}
          openRegister={() => setRegisterOpen(true)}
        />

        {registerOpen && (
          <RegisterModal
            onClose={() => setRegisterOpen(false)}
            onSuccess={() => {
              setRegisterOpen(false);
              showToast("Kayıt başarılı");
            }}
          />
        )}

        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "success" })}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between px-6">
          <div>
            <div className="inline-flex rounded-2xl bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              Yönetim Paneli
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Hoş geldin: {loggedInUser.firstName} {loggedInUser.lastName}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-2xl border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Kullanıcı Listesi</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sistemde kayıtlı kullanıcıları görüntüleyebilir, düzenleyebilir ve
            evraklarını yönetebilirsin.
          </p>
        </div>

        <UserTable
          users={users}
          onSelect={handleSelectUser}
          onOpenDocuments={handleOpenDocuments}
        />

        {selectedUser && detailOpen && !editOpen && !documentsOpen && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => {
              setDetailOpen(false);
              setSelectedUser(null);
            }}
            onOpenEdit={() => {
              setDetailOpen(false);
              setEditOpen(true);
            }}
            onOpenDocuments={() => {
              setDetailOpen(false);
              setDocumentsFromDetail(true);
              setDocumentsOpen(true);
            }}
          />
        )}

        {selectedUser && editOpen && (
          <EditUserModal
            user={selectedUser}
            onClose={() => setEditOpen(false)}
            onUpdated={handleUserUpdated}
          />
        )}

        {selectedUser && documentsOpen && (
          <DocumentsModal
            user={selectedUser}
            onClose={() => {
              setDocumentsOpen(false);

              if (documentsFromDetail) {
                setDetailOpen(true);
                setDocumentsFromDetail(false);
              } else {
                setSelectedUser(null);
              }
            }}
            onDocumentsChanged={handleDocumentsChanged}
          />
        )}
      </main>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
}