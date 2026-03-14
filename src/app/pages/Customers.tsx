import { useState, useEffect } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight, Plus, X, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import * as api from "../lib/api";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

type SortKey = "name" | "email" | "phone";
type SortDir = "asc" | "desc" | null;

const ROWS_PER_PAGE = 8;

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
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

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col || !sortDir) return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-4 h-4 ml-1 inline" /> : <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  const handleAddCustomer = async () => {
    if (newCustomer.name && newCustomer.email && newCustomer.phone) {
      try {
        setSaving(true);
        await api.createCustomer(newCustomer);
        await loadCustomers();
        setNewCustomer({ name: "", email: "", phone: "" });
        setIsModalOpen(false);
        setPage(Math.ceil((customers.length + 1) / ROWS_PER_PAGE));
      } catch (err) {
        console.error("Failed to add customer:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleEditCustomer = async () => {
    if (editingCustomer && newCustomer.name && newCustomer.email && newCustomer.phone) {
      try {
        setSaving(true);
        await api.updateCustomer(editingCustomer.id, newCustomer);
        await loadCustomers();
        setNewCustomer({ name: "", email: "", phone: "" });
        setEditingCustomer(null);
        setIsModalOpen(false);
      } catch (err) {
        console.error("Failed to edit customer:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    try {
      await api.deleteCustomer(id);
      await loadCustomers();
      const newTotalPages = Math.ceil((customers.length - 1) / ROWS_PER_PAGE);
      if (page > newTotalPages && newTotalPages > 0) setPage(newTotalPages);
    } catch (err) {
      console.error("Failed to delete customer:", err);
    }
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setNewCustomer({ name: customer.name, email: customer.email, phone: customer.phone });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setNewCustomer({ name: "", email: "", phone: "" });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff4e00] animate-spin" />
        <span className="ml-3 text-[#5d5d5d] text-[16px]">Loading customers...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 flex-shrink-0">
        <h1 className="text-[#ff4e00] text-[24px] sm:text-[32px] font-medium tracking-[-0.64px]">Customers</h1>
        <div className="flex items-center gap-6">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#ff4e00] border-[1.5px] border-[#ff4e00] rounded-lg hover:bg-[#ff4e00] hover:text-white transition-colors font-medium text-[14px]"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[14px] border border-[#c3c3c3] flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#c3c3c3]">
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("name")}>Name<SortIcon col="name" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("email")}>Email<SortIcon col="email" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("phone")}>Phone<SortIcon col="phone" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#fff5f0] flex items-center justify-center mb-1">
                        <Plus className="w-6 h-6 text-[#ff4e00]" />
                      </div>
                      <p className="text-[#383838] text-[16px] font-medium">No data available</p>
                      <p className="text-[#999] text-[13px]">Click "Add Customer" to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedCustomers.map((customer, index) => (
                  <tr key={customer.id} className={index % 2 === 0 ? "bg-[#f6f6f6]" : "bg-white"}>
                    <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{customer.name}</td>
                    <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{customer.email}</td>
                    <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{customer.phone}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="px-4 py-1.5 text-[#ff4e00] border border-[#ff4e00] rounded-[5px] hover:bg-[#fff5f0] transition-colors text-[13px] font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="px-4 py-1.5 bg-[#ff4e00] text-white rounded-[5px] hover:bg-[#e64600] transition-colors text-[13px] font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#ff4e00] text-[24px] font-semibold">
                {editingCustomer ? "Edit Customer" : "+ Add Customer"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#5d5d5d] hover:text-[#ff4e00]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Name</label>
                <input type="text" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
              </div>
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Email</label>
                <input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
              </div>
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Phone</label>
                <input type="tel" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-medium">Cancel</button>
              <button
                onClick={editingCustomer ? handleEditCustomer : handleAddCustomer}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : editingCustomer ? "Save Changes" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}