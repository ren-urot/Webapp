import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Calendar, Users, MapPin, Clock, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "react-router";

interface Workshop {
  id: number;
  title: string;
  date: string;
  capacity: number;
  spotsLeft: number;
  price: string;
  description: string;
  location: string;
  instructor: string;
  duration: string;
}

const ROWS_PER_PAGE = 8;

export default function Workshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([
    { id: 1, title: "Flower Arrangement Workshop", date: "Oct. 20, 2025 - 10PM", capacity: 20, spotsLeft: 11, price: "P50", description: "Learn the art of flower arrangement with fresh seasonal blooms. Perfect for beginners who want to create stunning centerpieces.", location: "Main Studio, 2nd Floor", instructor: "Maria Santos", duration: "2 hours" },
    { id: 2, title: "Flower Growing Workshop", date: "Oct. 20, 2025 - 10PM", capacity: 30, spotsLeft: 5, price: "P100", description: "Discover the secrets to growing beautiful flowers at home. Covers soil preparation, watering techniques, and seasonal planting.", location: "Garden Area", instructor: "Juan Dela Cruz", duration: "3 hours" },
    { id: 3, title: "Flower Arrangement Workshop", date: "Oct. 20, 2025 - 10PM", capacity: 50, spotsLeft: 45, price: "P75", description: "An intermediate workshop focused on modern arrangement styles including ikebana-inspired and free-form designs.", location: "Main Studio, 2nd Floor", instructor: "Maria Santos", duration: "2.5 hours" },
    { id: 4, title: "Flower Growing Workshop", date: "Oct. 20, 2025 - 10PM", capacity: 20, spotsLeft: 10, price: "P80", description: "Hands-on workshop covering propagation methods and care for tropical flowers native to the Philippines.", location: "Garden Area", instructor: "Juan Dela Cruz", duration: "2 hours" },
    { id: 5, title: "Flower Arrangement Workshop", date: "Oct. 20, 2025 - 10PM", capacity: 10, spotsLeft: 6, price: "P100", description: "Small group premium workshop with personal instruction on bridal bouquet arrangement techniques.", location: "VIP Room", instructor: "Rosa Gonzales", duration: "3 hours" },
    { id: 6, title: "Flower Growing Workshop", date: "Oct. 20, 2025 - 10PM", capacity: 30, spotsLeft: 3, price: "P50", description: "Learn how to grow roses, sunflowers, and orchids. Includes a take-home starter kit.", location: "Garden Area", instructor: "Juan Dela Cruz", duration: "2 hours" },
    { id: 7, title: "Flower Arrangement Workshop", date: "Oct. 20, 2025 - 10PM", capacity: 20, spotsLeft: 12, price: "P60", description: "Create your own dried flower arrangement to take home. All materials provided.", location: "Main Studio, 2nd Floor", instructor: "Maria Santos", duration: "1.5 hours" },
    { id: 8, title: "Flower Growing Workshop", date: "Oct. 20, 2025 - 10PM", capacity: 50, spotsLeft: 40, price: "P75", description: "Community workshop on urban gardening with flowers. Great for apartment dwellers.", location: "Rooftop Garden", instructor: "Ana Reyes", duration: "2 hours" },
    { id: 9, title: "Bouquet Design Workshop", date: "Nov. 5, 2025 - 2PM", capacity: 15, spotsLeft: 8, price: "P120", description: "Design your own signature bouquet with premium imported flowers and local blooms.", location: "Main Studio, 2nd Floor", instructor: "Rosa Gonzales", duration: "2.5 hours" },
    { id: 10, title: "Dried Flower Art Workshop", date: "Nov. 10, 2025 - 3PM", capacity: 25, spotsLeft: 20, price: "P90", description: "Create beautiful wall art and decor using dried and preserved flowers.", location: "Art Room", instructor: "Maria Santos", duration: "2 hours" },
    { id: 11, title: "Wedding Floral Design", date: "Nov. 15, 2025 - 9AM", capacity: 12, spotsLeft: 4, price: "P200", description: "Professional-level workshop on wedding floral design including bouquets, centerpieces, and arches.", location: "VIP Room", instructor: "Rosa Gonzales", duration: "4 hours" },
    { id: 12, title: "Succulent Potting Class", date: "Nov. 18, 2025 - 1PM", capacity: 20, spotsLeft: 15, price: "P85", description: "Learn to pot and arrange succulents in decorative containers. Take your creation home!", location: "Garden Area", instructor: "Ana Reyes", duration: "1.5 hours" },
    { id: 13, title: "Ikebana Basics Workshop", date: "Nov. 22, 2025 - 10AM", capacity: 10, spotsLeft: 7, price: "P150", description: "Introduction to the Japanese art of flower arrangement. Minimalist and meditative.", location: "Main Studio, 2nd Floor", instructor: "Maria Santos", duration: "2 hours" },
    { id: 14, title: "Flower Preservation Class", date: "Nov. 25, 2025 - 2PM", capacity: 18, spotsLeft: 12, price: "P110", description: "Techniques for preserving flowers including pressing, drying, and resin casting.", location: "Art Room", instructor: "Juan Dela Cruz", duration: "2.5 hours" },
    { id: 15, title: "Holiday Wreath Making", date: "Dec. 1, 2025 - 10AM", capacity: 25, spotsLeft: 18, price: "P130", description: "Create a festive holiday wreath using fresh greens, flowers, and seasonal decorations.", location: "Main Studio, 2nd Floor", instructor: "Rosa Gonzales", duration: "2 hours" },
    { id: 16, title: "Corsage & Boutonniere", date: "Dec. 5, 2025 - 3PM", capacity: 15, spotsLeft: 9, price: "P95", description: "Learn to make elegant corsages and boutonnieres for prom, weddings, and special occasions.", location: "VIP Room", instructor: "Maria Santos", duration: "1.5 hours" },
    { id: 17, title: "Flower Photography Tips", date: "Dec. 10, 2025 - 11AM", capacity: 30, spotsLeft: 25, price: "P60", description: "Photography workshop focused on capturing flowers beautifully. Bring your own camera or phone.", location: "Garden Area", instructor: "Ana Reyes", duration: "2 hours" },
    { id: 18, title: "Advanced Arrangement", date: "Dec. 15, 2025 - 9AM", capacity: 10, spotsLeft: 2, price: "P250", description: "For experienced arrangers only. Master complex techniques and large-scale installations.", location: "Main Studio, 2nd Floor", instructor: "Rosa Gonzales", duration: "4 hours" },
    { id: 19, title: "Terrarium Building", date: "Dec. 18, 2025 - 1PM", capacity: 20, spotsLeft: 14, price: "P140", description: "Build your own miniature garden terrarium with mosses, ferns, and small flowers.", location: "Art Room", instructor: "Juan Dela Cruz", duration: "2 hours" },
    { id: 20, title: "Valentine's Day Prep", date: "Jan. 10, 2026 - 10AM", capacity: 40, spotsLeft: 35, price: "P75", description: "Get ready for Valentine's Day! Learn to make romantic bouquets and heart-shaped arrangements.", location: "Main Studio, 2nd Floor", instructor: "Maria Santos", duration: "2 hours" },
  ]);

  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailWorkshop, setDetailWorkshop] = useState<Workshop | null>(null);
  const [newWorkshop, setNewWorkshop] = useState({ title: "", date: "", capacity: "", spots: "", price: "" });
  const [sortKey, setSortKey] = useState<"title" | "date" | "capacity" | "spotsLeft" | "price" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  type WSortKey = "title" | "date" | "capacity" | "spotsLeft" | "price";

  const handleSort = (key: WSortKey) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
      else setSortDir("asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedWorkshops = [...workshops].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    if (sortKey === "capacity" || sortKey === "spotsLeft") {
      return sortDir === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
    }
    if (sortKey === "price") {
      const aNum = Number(String(a.price).replace(/[^0-9]/g, ""));
      const bNum = Number(String(b.price).replace(/[^0-9]/g, ""));
      return sortDir === "asc" ? aNum - bNum : bNum - aNum;
    }
    const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: WSortKey }) => {
    if (sortKey !== col || !sortDir) return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-4 h-4 ml-1 inline" /> : <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  const totalPages = Math.ceil(workshops.length / ROWS_PER_PAGE);
  const startIdx = (page - 1) * ROWS_PER_PAGE;
  const endIdx = Math.min(startIdx + ROWS_PER_PAGE, workshops.length);
  const paged = sortedWorkshops.slice(startIdx, endIdx);

  const handleCreateWorkshop = () => {
    if (newWorkshop.title && newWorkshop.date && newWorkshop.capacity && newWorkshop.spots && newWorkshop.price) {
      setWorkshops([
        ...workshops,
        {
          id: Date.now(),
          title: newWorkshop.title,
          date: newWorkshop.date,
          capacity: parseInt(newWorkshop.capacity),
          spotsLeft: parseInt(newWorkshop.spots),
          price: newWorkshop.price,
          description: "",
          location: "",
          instructor: "",
          duration: "",
        },
      ]);
      setNewWorkshop({ title: "", date: "", capacity: "", spots: "", price: "" });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-5">
      {/* Header with pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 flex-shrink-0">
        <h1 className="text-[#ff4e00] text-[24px] sm:text-[32px] font-medium tracking-[-0.64px]">Workshops</h1>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#ff4e00] border-[1.5px] border-[#ff4e00] rounded-lg hover:bg-[#ff4e00] hover:text-white transition-colors font-medium text-[14px]"
          >
            Create Workshop
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[14px] border border-[#c3c3c3] flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#c3c3c3]">
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("title")}>Title<SortIcon col="title" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("date")}>Date<SortIcon col="date" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("capacity")}>Capacity<SortIcon col="capacity" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("spotsLeft")}>Spots Left<SortIcon col="spotsLeft" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("price")}>Price<SortIcon col="price" /></th>
                <th className="text-right px-6 py-4 text-[#ff4e00] font-medium text-[18px]"></th>
              </tr>
            </thead>
            <tbody>
              {sortedWorkshops.map((workshop, index) => (
                <tr key={workshop.id} className={index % 2 === 0 ? "bg-[#f6f6f6]" : "bg-white"}>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{workshop.title}</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{workshop.date}</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{workshop.capacity} People</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{workshop.spotsLeft} Spots</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{workshop.price}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDetailWorkshop(workshop)}
                        className="px-4 py-1.5 text-[#ff4e00] border border-[#ff4e00] rounded-[5px] hover:bg-[#fff5f0] transition-colors text-[13px] font-semibold"
                      >
                        Details
                      </button>
                      <Link
                        to={`/workshops/${workshop.id}/register`}
                        className="px-4 py-1.5 bg-[#ff4e00] text-white rounded-[5px] hover:bg-[#e64600] transition-colors text-[13px] font-semibold"
                      >
                        Register
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Workshop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#ff4e00] text-[24px] font-semibold">Create Workshop</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#5d5d5d] hover:text-[#ff4e00]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Title</label>
                <input type="text" value={newWorkshop.title} onChange={(e) => setNewWorkshop({ ...newWorkshop, title: e.target.value })} className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-2">Date</label>
                  <div className="relative">
                    <input type="text" value={newWorkshop.date} onChange={(e) => setNewWorkshop({ ...newWorkshop, date: e.target.value })} placeholder="Oct. 20, 2025" className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ff4e00]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-2">Capacity</label>
                  <input type="number" value={newWorkshop.capacity} onChange={(e) => setNewWorkshop({ ...newWorkshop, capacity: e.target.value })} className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-2">Spots</label>
                  <input type="number" value={newWorkshop.spots} onChange={(e) => setNewWorkshop({ ...newWorkshop, spots: e.target.value })} className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
                </div>
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-2">Price</label>
                  <input type="text" value={newWorkshop.price} onChange={(e) => setNewWorkshop({ ...newWorkshop, price: e.target.value })} placeholder="P50" className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-medium">Cancel</button>
              <button onClick={handleCreateWorkshop} className="flex-1 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Workshop Details Modal */}
      {detailWorkshop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[#ff4e00] text-[24px] font-semibold">Workshop Details</h2>
              <button onClick={() => setDetailWorkshop(null)} className="text-[#5d5d5d] hover:text-[#ff4e00]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <h3 className="text-[#383838] text-[20px] font-semibold">{detailWorkshop.title}</h3>
                <p className="text-[#5d5d5d] text-[14px] mt-1">{detailWorkshop.description}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#fff5f0] rounded-lg p-3 flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#ff4e00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#383838] text-[13px] font-semibold">Date & Time</p>
                    <p className="text-[#5d5d5d] text-[13px]">{detailWorkshop.date}</p>
                  </div>
                </div>
                <div className="bg-[#fff5f0] rounded-lg p-3 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#ff4e00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#383838] text-[13px] font-semibold">Duration</p>
                    <p className="text-[#5d5d5d] text-[13px]">{detailWorkshop.duration}</p>
                  </div>
                </div>
                <div className="bg-[#fff5f0] rounded-lg p-3 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#ff4e00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#383838] text-[13px] font-semibold">Location</p>
                    <p className="text-[#5d5d5d] text-[13px]">{detailWorkshop.location}</p>
                  </div>
                </div>
                <div className="bg-[#fff5f0] rounded-lg p-3 flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#ff4e00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#383838] text-[13px] font-semibold">Instructor</p>
                    <p className="text-[#5d5d5d] text-[13px]">{detailWorkshop.instructor}</p>
                  </div>
                </div>
              </div>

              {/* Capacity & Price Bar */}
              <div className="flex items-center gap-4 bg-[#f6f6f6] rounded-lg p-4">
                <div className="flex-1">
                  <p className="text-[#5d5d5d] text-[12px]">Capacity</p>
                  <p className="text-[#383838] text-[16px] font-semibold">{detailWorkshop.capacity} People</p>
                </div>
                <div className="w-px h-10 bg-[#d8d8d8]" />
                <div className="flex-1">
                  <p className="text-[#5d5d5d] text-[12px]">Spots Left</p>
                  <p className={`text-[16px] font-semibold ${detailWorkshop.spotsLeft <= 5 ? 'text-[#e53935]' : 'text-[#383838]'}`}>{detailWorkshop.spotsLeft} Spots</p>
                </div>
                <div className="w-px h-10 bg-[#d8d8d8]" />
                <div className="flex-1">
                  <p className="text-[#5d5d5d] text-[12px]">Price</p>
                  <p className="text-[#ff4e00] text-[16px] font-semibold">{detailWorkshop.price}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-[#5d5d5d]">Registration Progress</span>
                  <span className="text-[#383838] font-medium">{detailWorkshop.capacity - detailWorkshop.spotsLeft}/{detailWorkshop.capacity} registered</span>
                </div>
                <div className="w-full bg-[#e9e9e9] rounded-full h-2.5">
                  <div
                    className="bg-[#ff4e00] h-2.5 rounded-full transition-all"
                    style={{ width: `${((detailWorkshop.capacity - detailWorkshop.spotsLeft) / detailWorkshop.capacity) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setDetailWorkshop(null)}
                className="flex-1 px-6 py-3 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-medium"
              >
                Close
              </button>
              <Link
                to={`/workshops/${detailWorkshop.id}/register`}
                className="flex-1 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium text-center"
              >
                Register Customers
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}