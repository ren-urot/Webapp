import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Eye, X, ArrowUpDown, ArrowUp, ArrowDown, Loader2, ShoppingBag } from "lucide-react";
import * as api from "../lib/api";

interface Order {
  id: string;
  customer: string;
  items: string;
  date: string;
  total: string;
  status: "Completed" | "Pending" | "Processing" | "Cancelled";
}

const statusColors: Record<Order["status"], string> = {
  Completed: "bg-[#e8f5e9] text-[#2e7d32]",
  Pending: "bg-[#fff3e0] text-[#e65100]",
  Processing: "bg-[#e3f2fd] text-[#1565c0]",
  Cancelled: "bg-[#fce4ec] text-[#c62828]",
};

type SortKey = "id" | "customer" | "items" | "date" | "total" | "status";
type SortDir = "asc" | "desc" | null;

export default function SalesOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
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

  const totalSales = orders
    .filter(o => o.status === "Completed")
    .reduce((sum, o) => sum + Number(String(o.total).replace(/[^0-9]/g, "")), 0);
  const completedOrders = orders.filter(o => o.status === "Completed").length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff4e00] animate-spin" />
        <span className="ml-3 text-[#5d5d5d] text-[16px]">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-[#ff4e00] text-[24px] sm:text-[32px] font-medium tracking-[-0.64px]">Sales & Orders</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 flex-shrink-0">
        <div className="bg-white rounded-[12px] border border-[#e9e9e9] p-4">
          <p className="text-[#5d5d5d] text-[13px] mb-1">Total Sales</p>
          <p className="text-[#ff4e00] text-[26px] font-semibold">P{totalSales.toLocaleString()}</p>
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
              {sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#fff5f0] flex items-center justify-center mb-1">
                        <ShoppingBag className="w-6 h-6 text-[#ff4e00]" />
                      </div>
                      <p className="text-[#383838] text-[16px] font-medium">No data available</p>
                      <p className="text-[#999] text-[13px]">Orders will appear here once created</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedOrders.map((order, index) => (
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
                ))
              )}
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