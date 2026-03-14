import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, ArrowUpDown, ArrowUp, ArrowDown, Loader2, Users } from "lucide-react";
import * as api from "../lib/api";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  registered: boolean;
}

const ROWS_PER_PAGE = 8;

export default function WorkshopRegister() {
  const { id } = useParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; customerId: number | null }>({
    open: false,
    customerId: null,
  });
  const [sortKey, setSortKey] = useState<"name" | "email" | "phone" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  type RSortKey = "name" | "email" | "phone";

  useEffect(() => {
    loadRegistrations();
  }, [id]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      if (id) {
        const data = await api.getWorkshopRegistrations(id);
        setCustomers(data);
      }
    } catch (err) {
      console.error("Failed to load workshop registrations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: RSortKey) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
      else setSortDir("asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: RSortKey }) => {
    if (sortKey !== col || !sortDir) return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-4 h-4 ml-1 inline" /> : <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  const totalPages = Math.ceil(sortedCustomers.length / ROWS_PER_PAGE);
  const startIdx = (page - 1) * ROWS_PER_PAGE;
  const endIdx = Math.min(startIdx + ROWS_PER_PAGE, sortedCustomers.length);
  const paged = sortedCustomers.slice(startIdx, endIdx);

  const handleRegister = async (customerId: number) => {
    try {
      if (id) {
        await api.registerForWorkshop(id, customerId);
        await loadRegistrations();
      }
      setConfirmModal({ open: false, customerId: null });
    } catch (err) {
      console.error("Failed to register customer:", err);
    }
  };

  const openConfirmModal = (customerId: number) => {
    setConfirmModal({ open: true, customerId });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff4e00] animate-spin" />
        <span className="ml-3 text-[#5d5d5d] text-[16px]">Loading registrations...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-5">
      {/* Back Button */}
      <Link
        to="/workshops"
        className="inline-flex items-center gap-2 text-[#ff4e00] hover:text-[#e64600] transition-colors mb-3 font-medium text-[14px] flex-shrink-0"
      >
        <ArrowLeft className="w-4 h-4" />
        Register for Flower Arrangement Workshop
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-[#ff4e00] text-[24px] sm:text-[32px] font-medium tracking-[-0.64px]">Customers List</h1>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[14px] border border-[#c3c3c3] flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#c3c3c3]">
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] w-16">#</th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("name")}>Name<SortIcon col="name" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("email")}>Email<SortIcon col="email" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("phone")}>Phone<SortIcon col="phone" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px]">Register</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#fff5f0] flex items-center justify-center mb-1">
                        <Users className="w-6 h-6 text-[#ff4e00]" />
                      </div>
                      <p className="text-[#383838] text-[16px] font-medium">No data available</p>
                      <p className="text-[#999] text-[13px]">Add customers first to register them for workshops</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((customer, index) => (
                  <tr key={customer.id} className={index % 2 === 0 ? "bg-[#f6f6f6]" : "bg-white"}>
                    <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{startIdx + index + 1}</td>
                    <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{customer.name}</td>
                    <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{customer.email}</td>
                    <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{customer.phone}</td>
                    <td className="px-6 py-3.5">
                      {customer.registered ? (
                        <button disabled className="px-4 py-1.5 border border-[#4caf50] text-[#4caf50] rounded-[5px] text-[13px] font-semibold cursor-not-allowed opacity-70">
                          Added to workshop
                        </button>
                      ) : (
                        <button
                          onClick={() => openConfirmModal(customer.id)}
                          className="px-4 py-1.5 bg-[#ff4e00] text-white rounded-[5px] hover:bg-[#e64600] transition-colors text-[13px] font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add to workshop
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md text-center">
            <h2 className="text-[#ff4e00] text-[28px] font-semibold mb-4">
              Flower Arrangement<br />Workshop
            </h2>
            <p className="text-[#5d5d5d] text-[16px] mb-8">
              Are you sure you want to register this person?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmModal({ open: false, customerId: null })}
                className="flex-1 px-6 py-3 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-medium"
              >
                No, Cancel
              </button>
              <button
                onClick={() => confirmModal.customerId && handleRegister(confirmModal.customerId)}
                className="flex-1 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium"
              >
                Yes, Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}