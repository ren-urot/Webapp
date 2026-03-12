import { useState } from "react";
import { X, ArrowUpDown, ArrowUp, ArrowDown, Truck, Package, MapPin, Clock, CheckCircle2, AlertCircle, Phone, Navigation } from "lucide-react";

type DeliveryStatus = "Preparing" | "In Transit" | "Out for Delivery" | "Delivered" | "Failed";

interface Delivery {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  address: string;
  items: string;
  scheduledDate: string;
  scheduledTime: string;
  driver: string;
  status: DeliveryStatus;
  estimatedArrival: string;
  notes: string;
  timeline: { step: string; time: string; done: boolean }[];
}

const statusColors: Record<DeliveryStatus, string> = {
  Preparing: "bg-[#f3e5f5] text-[#7b1fa2]",
  "In Transit": "bg-[#e3f2fd] text-[#1565c0]",
  "Out for Delivery": "bg-[#fff3e0] text-[#e65100]",
  Delivered: "bg-[#e8f5e9] text-[#2e7d32]",
  Failed: "bg-[#fce4ec] text-[#c62828]",
};

const statusIcons: Record<DeliveryStatus, typeof Truck> = {
  Preparing: Package,
  "In Transit": Truck,
  "Out for Delivery": Navigation,
  Delivered: CheckCircle2,
  Failed: AlertCircle,
};

const initialDeliveries: Delivery[] = [
  { id: "DEL-001", orderId: "ORD-002", customer: "Susan Anderson", phone: "+63 917 123 4567", address: "123 Rizal Ave, Makati City", items: "Sunflower Arrangement x1", scheduledDate: "Mar 12, 2026", scheduledTime: "2:00 PM", driver: "Juan Dela Cruz", status: "Out for Delivery", estimatedArrival: "2:15 PM", notes: "Gate code: 4521. Leave with guard if not home.", timeline: [{ step: "Order Confirmed", time: "9:00 AM", done: true }, { step: "Preparing Bouquet", time: "10:30 AM", done: true }, { step: "Picked Up by Driver", time: "1:15 PM", done: true }, { step: "Out for Delivery", time: "1:45 PM", done: true }, { step: "Delivered", time: "—", done: false }] },
  { id: "DEL-002", orderId: "ORD-003", customer: "Richard Mann", phone: "+63 918 234 5678", address: "45 Ayala Blvd, Quezon City", items: "Tulip Bouquet x3", scheduledDate: "Mar 12, 2026", scheduledTime: "3:00 PM", driver: "Pedro Santos", status: "In Transit", estimatedArrival: "3:10 PM", notes: "Call upon arrival.", timeline: [{ step: "Order Confirmed", time: "10:00 AM", done: true }, { step: "Preparing Bouquet", time: "11:45 AM", done: true }, { step: "Picked Up by Driver", time: "2:00 PM", done: true }, { step: "Out for Delivery", time: "—", done: false }, { step: "Delivered", time: "—", done: false }] },
  { id: "DEL-003", orderId: "ORD-008", customer: "Ricky Jass", phone: "+63 919 345 6789", address: "78 Taft Ave, Pasay City", items: "Lavender Bundle x5", scheduledDate: "Mar 12, 2026", scheduledTime: "4:00 PM", driver: "Miguel Reyes", status: "Preparing", estimatedArrival: "4:00 PM", notes: "Fragile. Handle with care.", timeline: [{ step: "Order Confirmed", time: "11:30 AM", done: true }, { step: "Preparing Bouquet", time: "12:00 PM", done: true }, { step: "Picked Up by Driver", time: "—", done: false }, { step: "Out for Delivery", time: "—", done: false }, { step: "Delivered", time: "—", done: false }] },
  { id: "DEL-004", orderId: "ORD-001", customer: "Mark Smith", phone: "+63 920 456 7890", address: "200 Shaw Blvd, Mandaluyong", items: "Red Roses Bouquet x2", scheduledDate: "Mar 11, 2026", scheduledTime: "11:00 AM", driver: "Juan Dela Cruz", status: "Delivered", estimatedArrival: "11:05 AM", notes: "Recipient confirmed.", timeline: [{ step: "Order Confirmed", time: "8:00 AM", done: true }, { step: "Preparing Bouquet", time: "9:00 AM", done: true }, { step: "Picked Up by Driver", time: "10:00 AM", done: true }, { step: "Out for Delivery", time: "10:30 AM", done: true }, { step: "Delivered", time: "11:05 AM", done: true }] },
  { id: "DEL-005", orderId: "ORD-004", customer: "Jason Marcus", phone: "+63 921 567 8901", address: "56 Ortigas Center, Pasig City", items: "White Lily Set x1", scheduledDate: "Mar 11, 2026", scheduledTime: "1:00 PM", driver: "Pedro Santos", status: "Delivered", estimatedArrival: "12:55 PM", notes: "", timeline: [{ step: "Order Confirmed", time: "7:30 AM", done: true }, { step: "Preparing Bouquet", time: "9:15 AM", done: true }, { step: "Picked Up by Driver", time: "11:00 AM", done: true }, { step: "Out for Delivery", time: "12:15 PM", done: true }, { step: "Delivered", time: "12:55 PM", done: true }] },
  { id: "DEL-006", orderId: "ORD-006", customer: "Michael Bain", phone: "+63 922 678 9012", address: "10 Roxas Blvd, Manila", items: "Peony Bouquet x1", scheduledDate: "Mar 11, 2026", scheduledTime: "10:00 AM", driver: "Miguel Reyes", status: "Failed", estimatedArrival: "—", notes: "Recipient not available. No safe drop-off location.", timeline: [{ step: "Order Confirmed", time: "7:00 AM", done: true }, { step: "Preparing Bouquet", time: "8:30 AM", done: true }, { step: "Picked Up by Driver", time: "9:15 AM", done: true }, { step: "Out for Delivery", time: "9:45 AM", done: true }, { step: "Delivery Failed", time: "10:20 AM", done: true }] },
  { id: "DEL-007", orderId: "ORD-010", customer: "Tom Baker", phone: "+63 923 789 0123", address: "88 Katipunan Ave, Quezon City", items: "Sunflower Arrangement x2", scheduledDate: "Mar 12, 2026", scheduledTime: "5:00 PM", driver: "Juan Dela Cruz", status: "Preparing", estimatedArrival: "5:00 PM", notes: "Birthday surprise. Be discreet.", timeline: [{ step: "Order Confirmed", time: "1:00 PM", done: true }, { step: "Preparing Bouquet", time: "—", done: false }, { step: "Picked Up by Driver", time: "—", done: false }, { step: "Out for Delivery", time: "—", done: false }, { step: "Delivered", time: "—", done: false }] },
  { id: "DEL-008", orderId: "ORD-012", customer: "Carlos Reyes", phone: "+63 924 890 1234", address: "32 Bonifacio High St, Taguig", items: "Orchid Pot x1", scheduledDate: "Mar 12, 2026", scheduledTime: "6:00 PM", driver: "Pedro Santos", status: "Preparing", estimatedArrival: "6:00 PM", notes: "Office delivery. Ask for reception.", timeline: [{ step: "Order Confirmed", time: "2:00 PM", done: true }, { step: "Preparing Bouquet", time: "—", done: false }, { step: "Picked Up by Driver", time: "—", done: false }, { step: "Out for Delivery", time: "—", done: false }, { step: "Delivered", time: "—", done: false }] },
  { id: "DEL-009", orderId: "ORD-014", customer: "Kevin Navarro", phone: "+63 925 901 2345", address: "15 EDSA, Cubao, Quezon City", items: "Mixed Wildflower x3", scheduledDate: "Mar 12, 2026", scheduledTime: "1:00 PM", driver: "Miguel Reyes", status: "In Transit", estimatedArrival: "1:20 PM", notes: "Leave at door.", timeline: [{ step: "Order Confirmed", time: "8:00 AM", done: true }, { step: "Preparing Bouquet", time: "10:00 AM", done: true }, { step: "Picked Up by Driver", time: "12:00 PM", done: true }, { step: "Out for Delivery", time: "—", done: false }, { step: "Delivered", time: "—", done: false }] },
  { id: "DEL-010", orderId: "ORD-016", customer: "Roberto Flores", phone: "+63 926 012 3456", address: "7 Timog Ave, Quezon City", items: "Lavender Bundle x4", scheduledDate: "Mar 13, 2026", scheduledTime: "10:00 AM", driver: "Juan Dela Cruz", status: "Preparing", estimatedArrival: "10:00 AM", notes: "Weekend delivery. Confirm day before.", timeline: [{ step: "Order Confirmed", time: "—", done: false }, { step: "Preparing Bouquet", time: "—", done: false }, { step: "Picked Up by Driver", time: "—", done: false }, { step: "Out for Delivery", time: "—", done: false }, { step: "Delivered", time: "—", done: false }] },
  { id: "DEL-011", orderId: "ORD-019", customer: "Sophia Chen", phone: "+63 927 123 4567", address: "99 Makati Ave, Makati City", items: "Tulip Bouquet x2", scheduledDate: "Mar 12, 2026", scheduledTime: "11:30 AM", driver: "Pedro Santos", status: "Out for Delivery", estimatedArrival: "11:40 AM", notes: "Ring doorbell twice.", timeline: [{ step: "Order Confirmed", time: "7:00 AM", done: true }, { step: "Preparing Bouquet", time: "8:30 AM", done: true }, { step: "Picked Up by Driver", time: "10:00 AM", done: true }, { step: "Out for Delivery", time: "11:00 AM", done: true }, { step: "Delivered", time: "—", done: false }] },
  { id: "DEL-012", orderId: "ORD-021", customer: "Grace Villanueva", phone: "+63 928 234 5678", address: "22 España Blvd, Manila", items: "White Lily Set x1", scheduledDate: "Mar 13, 2026", scheduledTime: "2:00 PM", driver: "Miguel Reyes", status: "Preparing", estimatedArrival: "2:00 PM", notes: "Anniversary gift. Add card.", timeline: [{ step: "Order Confirmed", time: "—", done: false }, { step: "Preparing Bouquet", time: "—", done: false }, { step: "Picked Up by Driver", time: "—", done: false }, { step: "Out for Delivery", time: "—", done: false }, { step: "Delivered", time: "—", done: false }] },
  { id: "DEL-013", orderId: "ORD-005", customer: "David Johnson", phone: "+63 929 345 6789", address: "180 Quezon Ave, Quezon City", items: "Orchid Pot x2", scheduledDate: "Mar 10, 2026", scheduledTime: "9:00 AM", driver: "Juan Dela Cruz", status: "Delivered", estimatedArrival: "8:55 AM", notes: "", timeline: [{ step: "Order Confirmed", time: "6:00 AM", done: true }, { step: "Preparing Bouquet", time: "7:00 AM", done: true }, { step: "Picked Up by Driver", time: "8:00 AM", done: true }, { step: "Out for Delivery", time: "8:30 AM", done: true }, { step: "Delivered", time: "8:55 AM", done: true }] },
  { id: "DEL-014", orderId: "ORD-009", customer: "Elena Cruz", phone: "+63 930 456 7890", address: "5 Alabang-Zapote Rd, Muntinlupa", items: "Red Roses Bouquet x1", scheduledDate: "Mar 10, 2026", scheduledTime: "3:00 PM", driver: "Pedro Santos", status: "Delivered", estimatedArrival: "2:50 PM", notes: "", timeline: [{ step: "Order Confirmed", time: "10:00 AM", done: true }, { step: "Preparing Bouquet", time: "11:30 AM", done: true }, { step: "Picked Up by Driver", time: "1:00 PM", done: true }, { step: "Out for Delivery", time: "2:15 PM", done: true }, { step: "Delivered", time: "2:50 PM", done: true }] },
  { id: "DEL-015", orderId: "ORD-024", customer: "James Ortega", phone: "+63 931 567 8901", address: "40 C5 Road, Taguig City", items: "Lavender Bundle x6", scheduledDate: "Mar 12, 2026", scheduledTime: "4:30 PM", driver: "Miguel Reyes", status: "In Transit", estimatedArrival: "4:40 PM", notes: "Condo unit 12B. Use service elevator.", timeline: [{ step: "Order Confirmed", time: "9:00 AM", done: true }, { step: "Preparing Bouquet", time: "11:00 AM", done: true }, { step: "Picked Up by Driver", time: "3:00 PM", done: true }, { step: "Out for Delivery", time: "—", done: false }, { step: "Delivered", time: "—", done: false }] },
  { id: "DEL-016", orderId: "ORD-025", customer: "Natalie Rivera", phone: "+63 932 678 9012", address: "66 Pioneer St, Mandaluyong", items: "Red Roses Bouquet x2", scheduledDate: "Mar 11, 2026", scheduledTime: "12:00 PM", driver: "Juan Dela Cruz", status: "Delivered", estimatedArrival: "11:50 AM", notes: "", timeline: [{ step: "Order Confirmed", time: "6:30 AM", done: true }, { step: "Preparing Bouquet", time: "8:00 AM", done: true }, { step: "Picked Up by Driver", time: "10:00 AM", done: true }, { step: "Out for Delivery", time: "11:15 AM", done: true }, { step: "Delivered", time: "11:50 AM", done: true }] },
  { id: "DEL-017", orderId: "ORD-007", customer: "Sarah Miller", phone: "+63 933 789 0123", address: "110 Marcos Highway, Marikina", items: "Mixed Wildflower x2", scheduledDate: "Mar 12, 2026", scheduledTime: "10:30 AM", driver: "Pedro Santos", status: "Out for Delivery", estimatedArrival: "10:45 AM", notes: "Back entrance only.", timeline: [{ step: "Order Confirmed", time: "6:00 AM", done: true }, { step: "Preparing Bouquet", time: "7:30 AM", done: true }, { step: "Picked Up by Driver", time: "9:00 AM", done: true }, { step: "Out for Delivery", time: "10:00 AM", done: true }, { step: "Delivered", time: "—", done: false }] },
  { id: "DEL-018", orderId: "ORD-011", customer: "Lisa Wong", phone: "+63 934 890 1234", address: "28 Congressional Ave, Quezon City", items: "Tulip Bouquet x1", scheduledDate: "Mar 10, 2026", scheduledTime: "2:00 PM", driver: "Miguel Reyes", status: "Delivered", estimatedArrival: "1:55 PM", notes: "", timeline: [{ step: "Order Confirmed", time: "8:00 AM", done: true }, { step: "Preparing Bouquet", time: "10:00 AM", done: true }, { step: "Picked Up by Driver", time: "12:00 PM", done: true }, { step: "Out for Delivery", time: "1:30 PM", done: true }, { step: "Delivered", time: "1:55 PM", done: true }] },
];

type SortKey = "id" | "customer" | "items" | "scheduledDate" | "driver" | "status";
type SortDir = "asc" | "desc" | null;
type FilterStatus = "All" | DeliveryStatus;

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [detailDelivery, setDetailDelivery] = useState<Delivery | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [updateModalDelivery, setUpdateModalDelivery] = useState<Delivery | null>(null);

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

  const filteredDeliveries = deliveries.filter(d => filterStatus === "All" || d.status === filterStatus);

  const sortedDeliveries = [...filteredDeliveries].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col || !sortDir) return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-4 h-4 ml-1 inline" /> : <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  const statusCounts = {
    preparing: deliveries.filter(d => d.status === "Preparing").length,
    inTransit: deliveries.filter(d => d.status === "In Transit").length,
    outForDelivery: deliveries.filter(d => d.status === "Out for Delivery").length,
    delivered: deliveries.filter(d => d.status === "Delivered").length,
    failed: deliveries.filter(d => d.status === "Failed").length,
  };

  const handleUpdateStatus = (delivery: Delivery, newStatus: DeliveryStatus) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    setDeliveries(prev => prev.map(d => {
      if (d.id !== delivery.id) return d;
      const updatedTimeline = d.timeline.map(step => {
        if (newStatus === "Delivered" && step.step === "Delivered") return { ...step, time: timeStr, done: true };
        if (newStatus === "Out for Delivery" && step.step === "Out for Delivery") return { ...step, time: timeStr, done: true };
        if (newStatus === "In Transit" && step.step === "Picked Up by Driver") return { ...step, time: timeStr, done: true };
        if (newStatus === "Failed" && step.step.includes("Deliver")) return { ...step, time: timeStr, done: true, step: "Delivery Failed" };
        return step;
      });
      return { ...d, status: newStatus, timeline: updatedTimeline };
    }));
    setUpdateModalDelivery(null);
    // Also update detail modal if open
    if (detailDelivery?.id === delivery.id) {
      setDetailDelivery(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const getNextStatus = (status: DeliveryStatus): DeliveryStatus | null => {
    const flow: Record<string, DeliveryStatus> = {
      Preparing: "In Transit",
      "In Transit": "Out for Delivery",
      "Out for Delivery": "Delivered",
    };
    return flow[status] || null;
  };

  const filterButtons: { label: string; value: FilterStatus; count: number }[] = [
    { label: "All", value: "All", count: deliveries.length },
    { label: "Preparing", value: "Preparing", count: statusCounts.preparing },
    { label: "In Transit", value: "In Transit", count: statusCounts.inTransit },
    { label: "Out for Delivery", value: "Out for Delivery", count: statusCounts.outForDelivery },
    { label: "Delivered", value: "Delivered", count: statusCounts.delivered },
    { label: "Failed", value: "Failed", count: statusCounts.failed },
  ];

  return (
    <div className="h-full flex flex-col max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-[#ff4e00] text-[24px] sm:text-[32px] font-medium tracking-[-0.64px]">Delivery Monitoring</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 flex-shrink-0">
        <div className="bg-white rounded-[12px] border border-[#e9e9e9] p-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-[#7b1fa2]" />
            <p className="text-[#5d5d5d] text-[12px]">Preparing</p>
          </div>
          <p className="text-[#7b1fa2] text-[24px] font-semibold">{statusCounts.preparing}</p>
        </div>
        <div className="bg-white rounded-[12px] border border-[#e9e9e9] p-3">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-[#1565c0]" />
            <p className="text-[#5d5d5d] text-[12px]">In Transit</p>
          </div>
          <p className="text-[#1565c0] text-[24px] font-semibold">{statusCounts.inTransit}</p>
        </div>
        <div className="bg-white rounded-[12px] border border-[#e9e9e9] p-3">
          <div className="flex items-center gap-2 mb-1">
            <Navigation className="w-4 h-4 text-[#e65100]" />
            <p className="text-[#5d5d5d] text-[12px]">Out for Delivery</p>
          </div>
          <p className="text-[#e65100] text-[24px] font-semibold">{statusCounts.outForDelivery}</p>
        </div>
        <div className="bg-white rounded-[12px] border border-[#e9e9e9] p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
            <p className="text-[#5d5d5d] text-[12px]">Delivered</p>
          </div>
          <p className="text-[#2e7d32] text-[24px] font-semibold">{statusCounts.delivered}</p>
        </div>
        <div className="bg-white rounded-[12px] border border-[#e9e9e9] p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-[#c62828]" />
            <p className="text-[#5d5d5d] text-[12px]">Failed</p>
          </div>
          <p className="text-[#c62828] text-[24px] font-semibold">{statusCounts.failed}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0">
        {filterButtons.map(fb => (
          <button
            key={fb.value}
            onClick={() => setFilterStatus(fb.value)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              filterStatus === fb.value
                ? "bg-[#ff4e00] text-white"
                : "bg-white border border-[#d8d8d8] text-[#5d5d5d] hover:border-[#ff4e00] hover:text-[#ff4e00]"
            }`}
          >
            {fb.label} ({fb.count})
          </button>
        ))}
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-[14px] border border-[#c3c3c3] flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-[1000px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#c3c3c3]">
                <th className="text-left px-5 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("id")}>Delivery ID<SortIcon col="id" /></th>
                <th className="text-left px-5 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("customer")}>Customer<SortIcon col="customer" /></th>
                <th className="text-left px-5 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("items")}>Items<SortIcon col="items" /></th>
                <th className="text-left px-5 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("scheduledDate")}>Scheduled<SortIcon col="scheduledDate" /></th>
                <th className="text-left px-5 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("driver")}>Driver<SortIcon col="driver" /></th>
                <th className="text-left px-5 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("status")}>Status<SortIcon col="status" /></th>
                <th className="text-right px-5 py-4 text-[#ff4e00] font-medium text-[18px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedDeliveries.map((delivery, index) => {
                const StatusIcon = statusIcons[delivery.status];
                return (
                  <tr key={delivery.id} className={index % 2 === 0 ? "bg-[#f6f6f6]" : "bg-white"}>
                    <td className="px-5 py-3.5 text-[#5d5d5d] text-[16px]">{delivery.id}</td>
                    <td className="px-5 py-3.5 text-[#5d5d5d] text-[16px]">{delivery.customer}</td>
                    <td className="px-5 py-3.5 text-[#5d5d5d] text-[16px] max-w-[200px] truncate">{delivery.items}</td>
                    <td className="px-5 py-3.5 text-[#5d5d5d] text-[16px]">
                      <div>{delivery.scheduledDate}</div>
                      <div className="text-[12px] text-[#999]">{delivery.scheduledTime}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[#5d5d5d] text-[16px]">{delivery.driver}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium ${statusColors[delivery.status]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {delivery.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDetailDelivery(delivery)}
                          className="px-3 py-1.5 text-[#ff4e00] border border-[#ff4e00] rounded-[5px] hover:bg-[#fff5f0] transition-colors text-[13px] font-semibold"
                        >
                          Track
                        </button>
                        {delivery.status !== "Delivered" && delivery.status !== "Failed" && (
                          <button
                            onClick={() => setUpdateModalDelivery(delivery)}
                            className="px-3 py-1.5 bg-[#ff4e00] text-white rounded-[5px] hover:bg-[#e64600] transition-colors text-[13px] font-semibold"
                          >
                            Update
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedDeliveries.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#999] text-[16px]">No deliveries found for this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Detail / Tracking Modal */}
      {detailDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDetailDelivery(null)}>
          <div className="bg-white rounded-[14px] w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e9e9e9] sticky top-0 bg-white rounded-t-[14px] z-10">
              <div>
                <h2 className="text-[#ff4e00] text-[22px] font-semibold">{detailDelivery.id}</h2>
                <p className="text-[#999] text-[13px]">Order: {detailDelivery.orderId}</p>
              </div>
              <button onClick={() => setDetailDelivery(null)} className="text-[#5d5d5d] hover:text-[#ff4e00] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="px-6 pt-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium ${statusColors[detailDelivery.status]}`}>
                {(() => { const Icon = statusIcons[detailDelivery.status]; return <Icon className="w-4 h-4" />; })()}
                {detailDelivery.status}
              </span>
            </div>

            {/* Customer & Delivery Info */}
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#ff4e00] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#383838] text-[15px] font-medium">{detailDelivery.customer}</p>
                  <p className="text-[#5d5d5d] text-[13px]">{detailDelivery.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#ff4e00] flex-shrink-0" />
                <p className="text-[#5d5d5d] text-[14px]">{detailDelivery.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#ff4e00] flex-shrink-0" />
                <p className="text-[#5d5d5d] text-[14px]">{detailDelivery.scheduledDate} at {detailDelivery.scheduledTime}</p>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-[#ff4e00] flex-shrink-0" />
                <p className="text-[#5d5d5d] text-[14px]">Driver: <span className="text-[#383838] font-medium">{detailDelivery.driver}</span></p>
              </div>
              {detailDelivery.estimatedArrival !== "—" && (
                <div className="flex items-center gap-3">
                  <Navigation className="w-4 h-4 text-[#ff4e00] flex-shrink-0" />
                  <p className="text-[#5d5d5d] text-[14px]">ETA: <span className="text-[#383838] font-medium">{detailDelivery.estimatedArrival}</span></p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="px-6 pb-3">
              <div className="bg-[#f6f6f6] rounded-lg p-3">
                <p className="text-[#999] text-[12px] mb-1">Items</p>
                <p className="text-[#383838] text-[14px] font-medium">{detailDelivery.items}</p>
              </div>
            </div>

            {/* Notes */}
            {detailDelivery.notes && (
              <div className="px-6 pb-3">
                <div className="bg-[#fff8f0] border border-[#ffe0c0] rounded-lg p-3">
                  <p className="text-[#e65100] text-[12px] mb-1">Delivery Notes</p>
                  <p className="text-[#5d5d5d] text-[14px]">{detailDelivery.notes}</p>
                </div>
              </div>
            )}

            {/* Delivery Timeline */}
            <div className="px-6 pb-6">
              <p className="text-[#383838] text-[16px] font-medium mb-3">Delivery Timeline</p>
              <div className="space-y-0">
                {(() => {
                  // Get the fresh delivery data from state
                  const freshDelivery = deliveries.find(d => d.id === detailDelivery.id) || detailDelivery;
                  return freshDelivery.timeline.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {/* Timeline dot and line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                          step.done
                            ? step.step.includes("Failed") ? "bg-[#c62828]" : "bg-[#ff4e00]"
                            : "bg-[#d8d8d8]"
                        }`} />
                        {i < freshDelivery.timeline.length - 1 && (
                          <div className={`w-0.5 h-8 ${step.done ? "bg-[#ff4e00]" : "bg-[#d8d8d8]"}`} />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-4 -mt-0.5">
                        <p className={`text-[14px] font-medium ${step.done ? "text-[#383838]" : "text-[#999]"}`}>{step.step}</p>
                        <p className={`text-[12px] ${step.done ? "text-[#5d5d5d]" : "text-[#ccc]"}`}>{step.time}</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Footer action */}
            <div className="px-6 pb-6">
              <button onClick={() => setDetailDelivery(null)} className="w-full px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {updateModalDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setUpdateModalDelivery(null)}>
          <div className="bg-white rounded-[14px] p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[#ff4e00] text-[20px] font-semibold">Update Status</h2>
              <button onClick={() => setUpdateModalDelivery(null)} className="text-[#5d5d5d] hover:text-[#ff4e00]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#5d5d5d] text-[14px] mb-1">{updateModalDelivery.id} — {updateModalDelivery.customer}</p>
            <p className="text-[#999] text-[13px] mb-5">Current: <span className={`px-2 py-0.5 rounded-full text-[12px] font-medium ${statusColors[updateModalDelivery.status]}`}>{updateModalDelivery.status}</span></p>

            <div className="space-y-2">
              {getNextStatus(updateModalDelivery.status) && (
                <button
                  onClick={() => handleUpdateStatus(updateModalDelivery, getNextStatus(updateModalDelivery.status)!)}
                  className="w-full px-4 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium text-[14px] flex items-center justify-center gap-2"
                >
                  {(() => { const next = getNextStatus(updateModalDelivery.status)!; const Icon = statusIcons[next]; return <><Icon className="w-4 h-4" /> Mark as {next}</>; })()}
                </button>
              )}
              <button
                onClick={() => handleUpdateStatus(updateModalDelivery, "Failed")}
                className="w-full px-4 py-3 bg-white text-[#c62828] border border-[#c62828] rounded-lg hover:bg-[#fce4ec] transition-colors font-medium text-[14px] flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" /> Mark as Failed
              </button>
            </div>

            <button onClick={() => setUpdateModalDelivery(null)} className="w-full mt-3 px-4 py-2.5 text-[#5d5d5d] hover:text-[#383838] transition-colors text-[14px]">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}