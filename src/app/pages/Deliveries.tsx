import { useState, useEffect } from "react";
import { X, ArrowUpDown, ArrowUp, ArrowDown, Truck, Package, MapPin, Clock, CheckCircle2, AlertCircle, Phone, Navigation, Loader2 } from "lucide-react";
import * as api from "../lib/api";

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

type SortKey = "id" | "customer" | "items" | "scheduledDate" | "driver" | "status";
type SortDir = "asc" | "desc" | null;
type FilterStatus = "All" | DeliveryStatus;

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailDelivery, setDetailDelivery] = useState<Delivery | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [updateModalDelivery, setUpdateModalDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const data = await api.getDeliveries();
      setDeliveries(data);
    } catch (err) {
      console.error("Failed to load deliveries:", err);
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

  const handleUpdateStatus = async (delivery: Delivery, newStatus: DeliveryStatus) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    
    const updatedTimeline = delivery.timeline.map(step => {
      if (newStatus === "Delivered" && step.step === "Delivered") return { ...step, time: timeStr, done: true };
      if (newStatus === "Out for Delivery" && step.step === "Out for Delivery") return { ...step, time: timeStr, done: true };
      if (newStatus === "In Transit" && step.step === "Picked Up by Driver") return { ...step, time: timeStr, done: true };
      if (newStatus === "Failed" && step.step.includes("Deliver")) return { ...step, time: timeStr, done: true, step: "Delivery Failed" };
      return step;
    });

    try {
      await api.updateDelivery(delivery.id, { status: newStatus, timeline: updatedTimeline });
      await loadDeliveries();
      setUpdateModalDelivery(null);
      if (detailDelivery?.id === delivery.id) {
        setDetailDelivery(prev => prev ? { ...prev, status: newStatus, timeline: updatedTimeline } : null);
      }
    } catch (err) {
      console.error("Failed to update delivery status:", err);
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff4e00] animate-spin" />
        <span className="ml-3 text-[#5d5d5d] text-[16px]">Loading deliveries...</span>
      </div>
    );
  }

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
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#fff5f0] flex items-center justify-center mb-1">
                        <Truck className="w-6 h-6 text-[#ff4e00]" />
                      </div>
                      <p className="text-[#383838] text-[16px] font-medium">No data available</p>
                      <p className="text-[#999] text-[13px]">
                        {deliveries.length === 0
                          ? "Deliveries will appear here once orders are fulfilled"
                          : "No deliveries found for this filter"}
                      </p>
                    </div>
                  </td>
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
              {detailDelivery.estimatedArrival !== "\u2014" && (
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
                  const freshDelivery = deliveries.find(d => d.id === detailDelivery.id) || detailDelivery;
                  return freshDelivery.timeline.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
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