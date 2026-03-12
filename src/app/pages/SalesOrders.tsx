import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Order {
  id: string;
  customer: string;
  items: string;
  date: string;
  total: string;
  status: "Completed" | "Pending" | "Processing" | "Cancelled";
}

const ROWS_PER_PAGE = 8;

const initialOrders: Order[] = [
  { id: "ORD-001", customer: "Mark Smith", items: "Red Roses Bouquet x2", date: "Mar 10, 2026", total: "P2,400", status: "Completed" },
  { id: "ORD-002", customer: "Susan Anderson", items: "Sunflower Arrangement x1", date: "Mar 10, 2026", total: "P1,500", status: "Processing" },
  { id: "ORD-003", customer: "Richard Mann", items: "Tulip Bouquet x3", date: "Mar 9, 2026", total: "P3,600", status: "Pending" },
  { id: "ORD-004", customer: "Jason Marcus", items: "White Lily Set x1", date: "Mar 9, 2026", total: "P1,800", status: "Completed" },
  { id: "ORD-005", customer: "David Johnson", items: "Orchid Pot x2", date: "Mar 8, 2026", total: "P4,200", status: "Completed" },
  { id: "ORD-006", customer: "Michael Bain", items: "Peony Bouquet x1", date: "Mar 8, 2026", total: "P1,200", status: "Cancelled" },
  { id: "ORD-007", customer: "Sarah Miller", items: "Mixed Wildflower x2", date: "Mar 7, 2026", total: "P2,000", status: "Processing" },
  { id: "ORD-008", customer: "Ricky Jass", items: "Lavender Bundle x5", date: "Mar 7, 2026", total: "P2,500", status: "Pending" },
  { id: "ORD-009", customer: "Elena Cruz", items: "Red Roses Bouquet x1", date: "Mar 6, 2026", total: "P1,200", status: "Completed" },
  { id: "ORD-010", customer: "Tom Baker", items: "Sunflower Arrangement x2", date: "Mar 6, 2026", total: "P3,000", status: "Processing" },
  { id: "ORD-011", customer: "Lisa Wong", items: "Tulip Bouquet x1", date: "Mar 5, 2026", total: "P1,200", status: "Completed" },
  { id: "ORD-012", customer: "Carlos Reyes", items: "Orchid Pot x1", date: "Mar 5, 2026", total: "P2,100", status: "Pending" },
  { id: "ORD-013", customer: "Angela Torres", items: "White Lily Set x2", date: "Mar 4, 2026", total: "P3,600", status: "Completed" },
  { id: "ORD-014", customer: "Kevin Navarro", items: "Mixed Wildflower x3", date: "Mar 4, 2026", total: "P3,000", status: "Processing" },
  { id: "ORD-015", customer: "Patricia Lim", items: "Peony Bouquet x2", date: "Mar 3, 2026", total: "P2,400", status: "Completed" },
  { id: "ORD-016", customer: "Roberto Flores", items: "Lavender Bundle x4", date: "Mar 3, 2026", total: "P2,000", status: "Pending" },
  { id: "ORD-017", customer: "Maria Santos", items: "Red Roses Bouquet x3", date: "Mar 2, 2026", total: "P3,600", status: "Completed" },
  { id: "ORD-018", customer: "Antonio Garcia", items: "Sunflower Arrangement x1", date: "Mar 2, 2026", total: "P1,500", status: "Cancelled" },
  { id: "ORD-019", customer: "Sophia Chen", items: "Tulip Bouquet x2", date: "Mar 1, 2026", total: "P2,400", status: "Processing" },
  { id: "ORD-020", customer: "Daniel Park", items: "Orchid Pot x1", date: "Mar 1, 2026", total: "P2,100", status: "Completed" },
  { id: "ORD-021", customer: "Grace Villanueva", items: "White Lily Set x1", date: "Feb 28, 2026", total: "P1,800", status: "Pending" },
  { id: "ORD-022", customer: "Brian Mendoza", items: "Peony Bouquet x3", date: "Feb 28, 2026", total: "P3,600", status: "Completed" },
  { id: "ORD-023", customer: "Catherine Ramos", items: "Mixed Wildflower x1", date: "Feb 27, 2026", total: "P1,000", status: "Completed" },
  { id: "ORD-024", customer: "James Ortega", items: "Lavender Bundle x6", date: "Feb 27, 2026", total: "P3,000", status: "Processing" },
  { id: "ORD-025", customer: "Natalie Rivera", items: "Red Roses Bouquet x2", date: "Feb 26, 2026", total: "P2,400", status: "Completed" },
];

const statusColors: Record<Order["status"], string> = {
  Completed: "bg-[#e8f5e9] text-[#2e7d32]",
  Pending: "bg-[#fff3e0] text-[#e65100]",
  Processing: "bg-[#e3f2fd] text-[#1565c0]",
  Cancelled: "bg-[#fce4ec] text-[#c62828]",
};

type SortKey = "id" | "customer" | "items" | "date" | "total" | "status";
type SortDir = "asc" | "desc" | null;

export default function SalesOrders() {
  const [orders] = useState<Order[]>(initialOrders);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
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

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (sortKey === "total") {
      const aNum = Number(String(aVal).replace(/[^0-9]/g, ""));
      const bNum = Number(String(bVal).replace(/[^0-9]/g, ""));
      return sortDir === "asc" ? aNum - bNum : bNum - aNum;
    }
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col || !sortDir) return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-4 h-4 ml-1 inline" /> : <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  const totalSales = "P19,200";
  const completedOrders = orders.filter(o => o.status === "Completed").length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;

  return (
    <div className="h-full flex flex-col max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-5">
      {/* Header with pagination */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-[#ff4e00] text-[24px] sm:text-[32px] font-medium tracking-[-0.64px]">Sales & Orders</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 flex-shrink-0">
        <div className="bg-white rounded-[12px] border border-[#e9e9e9] p-4">
          <p className="text-[#5d5d5d] text-[13px] mb-1">Total Sales</p>
          <p className="text-[#ff4e00] text-[26px] font-semibold">{totalSales}</p>
        </div>
        <div className="bg-white rounded-[12px] border border-[#e9e9e9] p-4">
          <p className="text-[#5d5d5d] text-[13px] mb-1">Completed Orders</p>
          <p className="text-[#2e7d32] text-[26px] font-semibold">{completedOrders}</p>
        </div>
        <div className="bg-white rounded-[12px] border border-[#e9e9e9] p-4">
          <p className="text-[#5d5d5d] text-[13px] mb-1">Pending Orders</p>
          <p className="text-[#e65100] text-[26px] font-semibold">{pendingOrders}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[14px] border border-[#c3c3c3] flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#c3c3c3]">
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("id")}>Order ID<SortIcon col="id" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("customer")}>Customer<SortIcon col="customer" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("items")}>Items<SortIcon col="items" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("date")}>Date<SortIcon col="date" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("total")}>Total<SortIcon col="total" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("status")}>Status<SortIcon col="status" /></th>
                <th className="text-right px-6 py-4 text-[#ff4e00] font-medium text-[18px]"></th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order, index) => (
                <tr key={order.id} className={index % 2 === 0 ? "bg-[#f6f6f6]" : "bg-white"}>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{order.id}</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{order.customer}</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{order.items}</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{order.date}</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{order.total}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => setDetailOrder(order)}
                      className="px-4 py-1.5 text-[#ff4e00] border border-[#ff4e00] rounded-[5px] hover:bg-[#fff5f0] transition-colors text-[13px] font-semibold"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#ff4e00] text-[24px] font-semibold">Order Details</h2>
              <button onClick={() => setDetailOrder(null)} className="text-[#5d5d5d] hover:text-[#ff4e00]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between"><span className="text-[#5d5d5d]">Order ID</span><span className="text-[#383838] font-medium">{detailOrder.id}</span></div>
              <div className="flex justify-between"><span className="text-[#5d5d5d]">Customer</span><span className="text-[#383838] font-medium">{detailOrder.customer}</span></div>
              <div className="flex justify-between"><span className="text-[#5d5d5d]">Items</span><span className="text-[#383838] font-medium">{detailOrder.items}</span></div>
              <div className="flex justify-between"><span className="text-[#5d5d5d]">Date</span><span className="text-[#383838] font-medium">{detailOrder.date}</span></div>
              <div className="flex justify-between"><span className="text-[#5d5d5d]">Total</span><span className="text-[#ff4e00] font-semibold text-[18px]">{detailOrder.total}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-[#5d5d5d]">Status</span>
                <span className={`px-3 py-1 rounded-full text-[13px] font-medium ${statusColors[detailOrder.status]}`}>{detailOrder.status}</span>
              </div>
            </div>
            <button onClick={() => setDetailOrder(null)} className="w-full mt-6 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}