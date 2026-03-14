import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Loader2, ImageIcon, Upload, Link } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import * as api from "../lib/api";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  image?: string;
}

const statusColors: Record<InventoryItem["status"], string> = {
  "In Stock": "bg-[#e8f5e9] text-[#2e7d32]",
  "Low Stock": "bg-[#fff3e0] text-[#e65100]",
  "Out of Stock": "bg-[#fce4ec] text-[#c62828]",
};

type ISortKey = "name" | "category" | "stock" | "price" | "status";

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "", stock: "", price: "", image: "" });
  const [sortKey, setSortKey] = useState<ISortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", stock: "", price: "", image: "" });

  // Image upload state
  const [addImageMode, setAddImageMode] = useState<"url" | "upload">("url");
  const [editImageMode, setEditImageMode] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File, target: "add" | "edit") => {
    // Validate file size (max 100KB)
    if (file.size > 100 * 1024) {
      alert("File too large. Maximum size is 100KB. Please compress or resize your image.");
      return;
    }
    try {
      setUploading(true);
      const result = await api.uploadImage(file);
      if (target === "add") {
        setNewItem(prev => ({ ...prev, image: result.url }));
      } else {
        setEditForm(prev => ({ ...prev, image: result.url }));
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert("Failed to upload image. Please try again or use a URL instead.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await api.getInventory();
      setItems(data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const computeStatus = (stock: number): InventoryItem["status"] => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 15) return "Low Stock";
    return "In Stock";
  };

  const handleAdd = async () => {
    if (newItem.name && newItem.category && newItem.stock && newItem.price) {
      try {
        setSaving(true);
        const stock = parseInt(newItem.stock);
        await api.createInventoryItem({
          name: newItem.name,
          category: newItem.category,
          stock,
          price: newItem.price,
          status: computeStatus(stock),
          image: newItem.image || "",
        });
        await loadInventory();
        setNewItem({ name: "", category: "", stock: "", price: "", image: "" });
        setIsModalOpen(false);
      } catch (err) {
        console.error("Failed to add inventory item:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteInventoryItem(id);
      await loadInventory();
    } catch (err) {
      console.error("Failed to delete inventory item:", err);
    }
  };

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setEditForm({ name: item.name, category: item.category, stock: String(item.stock), price: item.price, image: item.image || "" });
  };

  const handleEdit = async () => {
    if (editItem && editForm.name && editForm.category && editForm.stock && editForm.price) {
      try {
        setSaving(true);
        const stock = parseInt(editForm.stock);
        await api.updateInventoryItem(editItem.id, {
          name: editForm.name,
          category: editForm.category,
          stock,
          price: editForm.price,
          status: computeStatus(stock),
          image: editForm.image || "",
        });
        await loadInventory();
        setEditItem(null);
      } catch (err) {
        console.error("Failed to edit inventory item:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const totalItems = items.length;
  const lowStockCount = items.filter(i => i.status === "Low Stock").length;
  const outOfStockCount = items.filter(i => i.status === "Out of Stock").length;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff4e00] animate-spin" />
        <span className="ml-3 text-[#5d5d5d] text-[16px]">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-5">
      {/* Header */}
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
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#c3c3c3]">
                <th className="text-left px-4 py-4 text-[#ff4e00] font-medium text-[18px] w-[60px]">Photo</th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("name")}>Item Name<SortIcon col="name" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("category")}>Category<SortIcon col="category" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("stock")}>Stock<SortIcon col="stock" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("price")}>Price<SortIcon col="price" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px] cursor-pointer select-none hover:bg-[#fff5f0] transition-colors" onClick={() => handleSort("status")}>Status<SortIcon col="status" /></th>
                <th className="text-left px-6 py-4 text-[#ff4e00] font-medium text-[18px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#fff5f0] flex items-center justify-center mb-1">
                        <Plus className="w-6 h-6 text-[#ff4e00]" />
                      </div>
                      <p className="text-[#383838] text-[16px] font-medium">No data available</p>
                      <p className="text-[#999] text-[13px]">Click "Add Item" to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedItems.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-[#f6f6f6]" : "bg-white"}>
                    <td className="px-4 py-2">
                      {item.image ? (
                        <ImageWithFallback src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#f0f0f0] flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-[#ccc]" />
                        </div>
                      )}
                    </td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
              {/* Add Modal - Image section */}
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Image <span className="text-[#999] font-normal">(optional)</span></label>
                {/* Tab toggle */}
                <div className="flex rounded-lg bg-[#f6f6f6] p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setAddImageMode("url")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                      addImageMode === "url"
                        ? "bg-[#ff4e00] text-white shadow-sm"
                        : "text-[#5d5d5d] hover:text-[#383838]"
                    }`}
                  >
                    <Link className="w-3.5 h-3.5" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddImageMode("upload")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                      addImageMode === "upload"
                        ? "bg-[#ff4e00] text-white shadow-sm"
                        : "text-[#5d5d5d] hover:text-[#383838]"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </button>
                </div>
                {addImageMode === "url" ? (
                  <input type="url" value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00] text-[14px]" />
                ) : (
                  <div>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "add"); }} className="hidden" id="add-image-upload" />
                    <label
                      htmlFor="add-image-upload"
                      className={`flex flex-col items-center justify-center w-full py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploading ? "border-[#ff4e00] bg-[#fff5f0]" : "border-[#d8d8d8] hover:border-[#ff4e00] hover:bg-[#fff5f0]"
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-6 h-6 text-[#ff4e00] animate-spin mb-2" />
                          <span className="text-[#ff4e00] text-[13px] font-medium">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-[#999] mb-2" />
                          <span className="text-[#5d5d5d] text-[13px] font-medium">Click to upload photo</span>
                          <span className="text-[#999] text-[11px] mt-1">JPEG, PNG, WebP, GIF (max 100KB)</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
                {newItem.image && (
                  <div className="mt-2 flex items-center gap-2">
                    <ImageWithFallback src={newItem.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-[#e9e9e9]" />
                    <span className="text-[#999] text-[11px]">Preview</span>
                    <button type="button" onClick={() => setNewItem({ ...newItem, image: "" })} className="ml-auto text-[#999] hover:text-[#c62828] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-medium">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
              {/* Edit Modal - Image section */}
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Image <span className="text-[#999] font-normal">(optional)</span></label>
                {/* Tab toggle */}
                <div className="flex rounded-lg bg-[#f6f6f6] p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setEditImageMode("url")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                      editImageMode === "url"
                        ? "bg-[#ff4e00] text-white shadow-sm"
                        : "text-[#5d5d5d] hover:text-[#383838]"
                    }`}
                  >
                    <Link className="w-3.5 h-3.5" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditImageMode("upload")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                      editImageMode === "upload"
                        ? "bg-[#ff4e00] text-white shadow-sm"
                        : "text-[#5d5d5d] hover:text-[#383838]"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </button>
                </div>
                {editImageMode === "url" ? (
                  <input type="url" value={editForm.image} onChange={e => setEditForm({ ...editForm, image: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full px-4 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00] text-[14px]" />
                ) : (
                  <div>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "edit"); }} className="hidden" id="edit-image-upload" />
                    <label
                      htmlFor="edit-image-upload"
                      className={`flex flex-col items-center justify-center w-full py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploading ? "border-[#ff4e00] bg-[#fff5f0]" : "border-[#d8d8d8] hover:border-[#ff4e00] hover:bg-[#fff5f0]"
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-6 h-6 text-[#ff4e00] animate-spin mb-2" />
                          <span className="text-[#ff4e00] text-[13px] font-medium">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-[#999] mb-2" />
                          <span className="text-[#5d5d5d] text-[13px] font-medium">Click to upload photo</span>
                          <span className="text-[#999] text-[11px] mt-1">JPEG, PNG, WebP, GIF (max 100KB)</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
                {editForm.image && (
                  <div className="mt-2 flex items-center gap-2">
                    <ImageWithFallback src={editForm.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-[#e9e9e9]" />
                    <span className="text-[#999] text-[11px]">Preview</span>
                    <button type="button" onClick={() => setEditForm({ ...editForm, image: "" })} className="ml-auto text-[#999] hover:text-[#c62828] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setEditItem(null)} className="flex-1 px-6 py-3 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-medium">Cancel</button>
              <button onClick={handleEdit} disabled={saving} className="flex-1 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}