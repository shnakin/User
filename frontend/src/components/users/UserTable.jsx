import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export default function UserTable({ users, onSelect, onOpenDocuments }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 25;

  const [sortConfig, setSortConfig] = useState({
    field: "name",
    direction: "asc",
  });

  const normalizeSearch = (value) =>
    (value || "")
      .toLocaleLowerCase("tr-TR")
      .replace(/\s+/g, " ")
      .trim();

  const handleSort = (field) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        field,
        direction: "asc",
      };
    });

    setPage(1);
  };

  const getSortIcon = (field) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown size={16} className="text-slate-400" />;
    }

    if (sortConfig.direction === "asc") {
      return <ArrowUp size={16} className="text-slate-700" />;
    }

    return <ArrowDown size={16} className="text-slate-700" />;
  };

  const filteredUsers = useMemo(() => {
    const term = normalizeSearch(search);

    const result = term
      ? users.filter((u) => {
          const fullName = normalizeSearch(`${u.firstName} ${u.lastName}`);
          const email = normalizeSearch(u.email);

          return fullName.includes(term) || email.includes(term);
        })
      : users;

    return [...result].sort((a, b) => {
      let compare = 0;

      if (sortConfig.field === "name") {
        const nameA = normalizeSearch(`${a.firstName} ${a.lastName}`);
        const nameB = normalizeSearch(`${b.firstName} ${b.lastName}`);

        compare = nameA.localeCompare(nameB, "tr-TR", {
          sensitivity: "base",
        });
      }

      if (sortConfig.field === "createdAt") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        compare = dateA - dateB;
      }

      return sortConfig.direction === "asc" ? compare : -compare;
    });
  }, [users, search, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page]);

  const startItem = filteredUsers.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, filteredUsers.length);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const goPrev = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const goNext = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Ad Soyad veya e-posta ile ara..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="text-sm font-semibold text-slate-600">
              <th className="px-6 py-4 text-center">
                <button
                  type="button"
                  onClick={() => handleSort("name")}
                  className="inline-flex items-center gap-2 font-semibold text-slate-600 transition hover:text-slate-800"
                >
                  <span>Ad Soyad</span>
                  {getSortIcon("name")}
                </button>
              </th>

              <th className="px-6 py-4 text-center">E-posta</th>

              <th className="px-6 py-4 text-center">
                <button
                  type="button"
                  onClick={() => handleSort("createdAt")}
                  className="inline-flex items-center gap-2 font-semibold text-slate-600 transition hover:text-slate-800"
                >
                  <span>Oluşturulma Zamanı</span>
                  {getSortIcon("createdAt")}
                </button>
              </th>

              <th className="px-6 py-4 text-center">Evrak Sayısı</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                  Aramaya uygun kullanıcı bulunamadı.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onSelect(u.id)}
                      className="font-medium text-slate-800 hover:text-slate-600"
                    >
                      {u.firstName} {u.lastName}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {u.email}
                  </td>

                  <td className="px-6 py-4 text-center text-slate-600 align-middle">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleString("tr-TR")
                      : "-"}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => onOpenDocuments(u.id)}
                    >
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
                        {u.documentCount}
                      </span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>
          Toplam{" "}
          <span className="font-semibold text-slate-800">
            {filteredUsers.length}
          </span>{" "}
          kullanıcı, şu anda{" "}
          <span className="font-semibold text-slate-800">
            {startItem}-{endItem}
          </span>{" "}
          arası gösteriliyor
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={page === 1}
            className="rounded-xl border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Önceki
          </button>

          <span className="rounded-xl bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
            Sayfa {page} / {totalPages}
          </span>

          <button
            onClick={goNext}
            disabled={page === totalPages}
            className="rounded-xl border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
}