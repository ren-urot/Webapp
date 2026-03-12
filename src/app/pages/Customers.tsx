import { useState } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight, Plus, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

const ROWS_PER_PAGE = 8;

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 1, name: "Mark Smith", email: "mark.smith@gmail.com", phone: "1+ 23 4567 890" },
    { id: 2, name: "Susan Anderson", email: "susananderson@gmail.com", phone: "1+ 23 4567 890" },
    { id: 3, name: "Richard Mann", email: "richard.mann@gmail.com", phone: "1+ 23 4567 890" },
    { id: 4, name: "Jason Marcus", email: "jason.marcus@gmail.com", phone: "1+ 23 4567 890" },
    { id: 5, name: "David Johnson", email: "davidjohnson@gmail.com", phone: "1+ 23 4567 890" },
    { id: 6, name: "Michael Bain", email: "michael.bain@gmail.com", phone: "1+ 23 4567 890" },
    { id: 7, name: "Ricky Jass", email: "ricky.jass@gmail.com", phone: "1+ 23 4567 890" },
    { id: 8, name: "Sarah Miller", email: "sarah.miller@gmail.com", phone: "1+ 23 4567 890" },
    { id: 9, name: "Elena Cruz", email: "elena.cruz@gmail.com", phone: "1+ 23 4567 890" },
    { id: 10, name: "Tom Baker", email: "tom.baker@gmail.com", phone: "1+ 23 4567 890" },
    { id: 11, name: "Lisa Wong", email: "lisa.wong@gmail.com", phone: "1+ 23 4567 890" },
    { id: 12, name: "Carlos Reyes", email: "carlos.reyes@gmail.com", phone: "1+ 23 4567 890" },
    { id: 13, name: "Angela Torres", email: "angela.torres@gmail.com", phone: "1+ 23 4567 891" },
    { id: 14, name: "Kevin Navarro", email: "kevin.navarro@gmail.com", phone: "1+ 23 4567 892" },
    { id: 15, name: "Patricia Lim", email: "patricia.lim@gmail.com", phone: "1+ 23 4567 893" },
    { id: 16, name: "Roberto Flores", email: "roberto.flores@gmail.com", phone: "1+ 23 4567 894" },
    { id: 17, name: "Maria Santos", email: "maria.santos@gmail.com", phone: "1+ 23 4567 895" },
    { id: 18, name: "Antonio Garcia", email: "antonio.garcia@gmail.com", phone: "1+ 23 4567 896" },
    { id: 19, name: "Sophia Chen", email: "sophia.chen@gmail.com", phone: "1+ 23 4567 897" },
    { id: 20, name: "Daniel Park", email: "daniel.park@gmail.com", phone: "1+ 23 4567 898" },
    { id: 21, name: "Grace Villanueva", email: "grace.villanueva@gmail.com", phone: "1+ 23 4567 899" },
    { id: 22, name: "Brian Mendoza", email: "brian.mendoza@gmail.com", phone: "1+ 23 4567 900" },
    { id: 23, name: "Catherine Ramos", email: "catherine.ramos@gmail.com", phone: "1+ 23 4567 901" },
    { id: 24, name: "James Ortega", email: "james.ortega@gmail.com", phone: "1+ 23 4567 902" },
    { id: 25, name: "Natalie Rivera", email: "natalie.rivera@gmail.com", phone: "1+ 23 4567 903" },
  ]);

  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

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

  const totalPages = Math.ceil(customers.length / ROWS_PER_PAGE);
  const startIdx = (page - 1) * ROWS_PER_PAGE;
  const endIdx = Math.min(startIdx + ROWS_PER_PAGE, customers.length);
  const paged = sortedCustomers.slice(startIdx, endIdx);

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.email && newCustomer.phone) {
      setCustomers([...customers, { ...newCustomer, id: Date.now() }]);
      setNewCustomer({ name: "", email: "", phone: "" });
      setIsModalOpen(false);
      setPage(Math.ceil((customers.length + 1) / ROWS_PER_PAGE));
    }
  };

  const handleDeleteCustomer = (id: number) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    const newTotalPages = Math.ceil(updated.length / ROWS_PER_PAGE);
    if (page > newTotalPages && newTotalPages > 0) setPage(newTotalPages);
  };

  return (
    <div className="h-full flex flex-col max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-6">
      {/* Header with pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 flex-shrink-0">
        <h1 className="text-[#ff4e00] text-[24px] sm:text-[32px] font-medium tracking-[-0.64px]">Customers</h1>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsModalOpen(true)}
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
              {sortedCustomers.map((customer, index) => (
                <tr key={customer.id} className={index % 2 === 0 ? "bg-[#f6f6f6]" : "bg-white"}>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{customer.name}</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{customer.email}</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{customer.phone}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-1.5 text-[#ff4e00] border border-[#ff4e00] rounded-[5px] hover:bg-[#fff5f0] transition-colors text-[13px] font-semibold">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#ff4e00] text-[24px] font-semibold">+ Add Customer</h2>
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
              <button onClick={handleAddCustomer} className="flex-1 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}