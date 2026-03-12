import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

const ROWS_PER_PAGE = 8;

const initialItems: InventoryItem[] = [
  { id: 1, name: "Red Roses", category: "Flowers", stock: 150, price: "P60/stem", status: "In Stock" },
  { id: 2, name: "Sunflowers", category: "Flowers", stock: 80, price: "P80/stem", status: "In Stock" },
  { id: 3, name: "Tulips", category: "Flowers", stock: 12, price: "P75/stem", status: "Low Stock" },
  { id: 4, name: "Lavender", category: "Dried Flowers", stock: 200, price: "P40/bundle", status: "In Stock" },
  { id: 5, name: "White Lilies", category: "Flowers", stock: 45, price: "P90/stem", status: "In Stock" },
  { id: 6, name: "Orchids", category: "Potted", stock: 0, price: "P350/pot", status: "Out of Stock" },
  { id: 7, name: "Peonies", category: "Flowers", stock: 8, price: "P120/stem", status: "Low Stock" },
  { id: 8, name: "Wrapping Paper", category: "Supplies", stock: 300, price: "P25/sheet", status: "In Stock" },
  { id: 9, name: "Ribbon Rolls", category: "Supplies", stock: 5, price: "P150/roll", status: "Low Stock" },
  { id: 10, name: "Vases (Small)", category: "Accessories", stock: 22, price: "P280/pc", status: "In Stock" },
  { id: 11, name: "Vases (Large)", category: "Accessories", stock: 10, price: "P450/pc", status: "Low Stock" },
  { id: 12, name: "Floral Foam", category: "Supplies", stock: 100, price: "P35/block", status: "In Stock" },
  { id: 13, name: "Carnations", category: "Flowers", stock: 90, price: "P45/stem", status: "In Stock" },
  { id: 14, name: "Baby's Breath", category: "Flowers", stock: 120, price: "P30/bunch", status: "In Stock" },
  { id: 15, name: "Eucalyptus", category: "Dried Flowers", stock: 60, price: "P55/bunch", status: "In Stock" },
  { id: 16, name: "Chrysanthemums", category: "Flowers", stock: 3, price: "P65/stem", status: "Low Stock" },
  { id: 17, name: "Daisies", category: "Flowers", stock: 75, price: "P35/stem", status: "In Stock" },
  { id: 18, name: "Hydrangeas", category: "Flowers", stock: 0, price: "P180/stem", status: "Out of Stock" },
  { id: 19, name: "Gift Boxes (Small)", category: "Supplies", stock: 50, price: "P85/pc", status: "In Stock" },
  { id: 20, name: "Gift Boxes (Large)", category: "Supplies", stock: 25, price: "P150/pc", status: "In Stock" },
  { id: 21, name: "Floral Wire", category: "Supplies", stock: 200, price: "P20/roll", status: "In Stock" },
  { id: 22, name: "Succulent Mix", category: "Potted", stock: 15, price: "P120/pot", status: "In Stock" },
  { id: 23, name: "Ceramic Pots", category: "Accessories", stock: 8, price: "P320/pc", status: "Low Stock" },
  { id: 24, name: "Dried Roses", category: "Dried Flowers", stock: 40, price: "P70/bunch", status: "In Stock" },
  { id: 25, name: "Flower Food Sachets", category: "Supplies", stock: 500, price: "P10/sachet", status: "In Stock" },
];

const statusColors: Record<InventoryItem["status"], string> = {
  "In Stock": "bg-[#e8f5e9] text-[#2e7d32]",
  "Low Stock": "bg-[#fff3e0] text-[#e65100]",
  "Out of Stock": "bg-[#fce4ec] text-[#c62828]",
};

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "", stock: "", price: "" });
  const [sortKey, setSortKey] = useState<"name" | "category" | "stock" | "price" | "status" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", stock: "", price: "" });

  type ISortKey = "name" | "category" | "stock" | "price" | "status";

  const handleSort = (key: ISortKey) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
      else setSortDir("asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    if (sortKey === "stock") {
      return sortDir === "asc" ? a.stock - b.stock : b.stock - a.stock;
    }
    if (sortKey === "price") {
      const aNum = Number(String(a.price).replace(/[^0-9]/g, ""));
      const bNum = Number(String(b.price).replace(/[^0-9]/g, ""));
      return sortDir === "asc" ? aNum - bNum : bNum - aNum;
    }
    const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: ISortKey }) => {
    if (sortKey !== col || !sortDir) return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-4 h-4 ml-1 inline" /> : <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  const totalPages = Math.ceil(sortedItems.length / ROWS_PER_PAGE);
  const startIdx = (page - 1) * ROWS_PER_PAGE;
  const endIdx = Math.min(startIdx + ROWS_PER_PAGE, sortedItems.length);
  const paged = sortedItems.slice(startIdx, endIdx);

  const handleAdd = () => {
    if (newItem.name && newItem.category && newItem.stock && newItem.price) {
      const stock = parseInt(newItem.stock);
      let status: InventoryItem["status"] = "In Stock";
      if (stock === 0) status = "Out of Stock";
      else if (stock <= 15) status = "Low Stock";
      setItems([...items, { id: Date.now(), name: newItem.name, category: newItem.category, stock, price: newItem.price, status }]);
      setNewItem({ name: "", category: "", stock: "", price: "" });
      setIsModalOpen(false);
    }
  };

  const handleDelete = (id: number) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    const newTotalPages = Math.ceil(updated.length / ROWS_PER_PAGE);
    if (page > newTotalPages && newTotalPages > 0) setPage(newTotalPages);
  };

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setEditForm({ name: item.name, category: item.category, stock: String(item.stock), price: item.price });
  };

  const handleEdit = () => {
    if (editItem && editForm.name && editForm.category && editForm.stock && editForm.price) {
      const stock = parseInt(editForm.stock);
      let status: InventoryItem["status"] = "In Stock";
      if (stock === 0) status = "Out of Stock";
      else if (stock <= 15) status = "Low Stock";
      setItems(items.map(i => i.id === editItem.id ? { ...i, name: editForm.name, category: editForm.category, stock, price: editForm.price, status } : i));
      setEditItem(null);
    }
  };

  const totalItems = items.length;
  const lowStockCount = items.filter(i => i.status === "Low Stock").length;
  const outOfStockCount = items.filter(i => i.status === "Out of Stock").length;

  return (
    <div className="h-full flex flex-col max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-5">
      {/* Header with pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 flex-shrink-0">
        <h1 className="text-[#ff4e00] text-[24px] sm:text-[32px] font-medium tracking-[-0.64px]">Inventory</h1>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#ff4e00] border-[1.5px] border-[#ff4e00] rounded-lg hover:bg-[#ff4e00] hover:text-white transition-colors font-medium text-[14px]"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 flex-shrink-0">
        <div className="bg-white rounded-[12px] border border-[#e9e9e9] p-4">
          <p className="text-[#5d5d5d] text-[13px] mb-1">Total Items</p>
          <p className="text-[#383838] text-[26px] font-semibold">{totalItems}</p>
        </div>
        <div className="bg-white rounded-[12px] border border-[#e9e9e9] p-4">
          <p className="text-[#5d5d5d] text-[13px] mb-1">Low Stock</p>
          <p className="text-[#e65100] text-[26px] font-semibold">{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-[12px] border border-[#e9e9e9] p-4">
          <p className="text-[#5d5d5d] text-[13px] mb-1">Out of Stock</p>
          <p className="text-[#c62828] text-[26px] font-semibold">{outOfStockCount}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[14px] border border-[#c3c3c3] flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#c3c3c3]">
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("name")}>Item Name<SortIcon col="name" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("category")}>Category<SortIcon col="category" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("stock")}>Stock<SortIcon col="stock" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("price")}>Price<SortIcon col="price" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("status")}>Status<SortIcon col="status" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? "bg-[#f6f6f6]" : "bg-white"}>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{item.name}</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{item.category}</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{item.stock}</td>
                  <td className="px-6 py-3.5 text-[#5d5d5d] text-[16px]">{item.price}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="px-4 py-1.5 text-[#ff4e00] border border-[#ff4e00] rounded-[5px] hover:bg-[#fff5f0] transition-colors text-[13px] font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#ff4e00] text-[24px] font-semibold">Add Item</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#5d5d5d] hover:text-[#ff4e00]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Item Name</label>
                <input type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
              </div>
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Category</label>
                <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00] bg-white">
                  <option value="">Select category</option>
                  <option>Flowers</option>
                  <option>Dried Flowers</option>
                  <option>Potted</option>
                  <option>Supplies</option>
                  <option>Accessories</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-2">Stock</label>
                  <input type="number" value={newItem.stock} onChange={e => setNewItem({ ...newItem, stock: e.target.value })} className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
                </div>
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-2">Price</label>
                  <input type="text" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} placeholder="P60/stem" className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-medium">Cancel</button>
              <button onClick={handleAdd} className="flex-1 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#ff4e00] text-[24px] font-semibold">Edit Item</h2>
              <button onClick={() => setEditItem(null)} className="text-[#5d5d5d] hover:text-[#ff4e00]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Item Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
              </div>
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Category</label>
                <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00] bg-white">
                  <option value="">Select category</option>
                  <option>Flowers</option>
                  <option>Dried Flowers</option>
                  <option>Potted</option>
                  <option>Supplies</option>
                  <option>Accessories</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-2">Stock</label>
                  <input type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
                </div>
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-2">Price</label>
                  <input type="text" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} placeholder="P60/stem" className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setEditItem(null)} className="flex-1 px-6 py-3 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-medium">Cancel</button>
              <button onClick={handleEdit} className="flex-1 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}