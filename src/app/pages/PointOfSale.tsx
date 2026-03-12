import { useState } from "react";
import { Plus, Minus, X, CreditCard, Smartphone, ShoppingBag, Trash2, Banknote, ChevronLeft, ChevronRight, Truck, Store, MapPin } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends Product {
  qty: number;
}

const products: Product[] = [
  { id: 1, name: "Red Roses Bouquet", price: 1200, image: "https://images.unsplash.com/photo-1763379557051-f62483b50556?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjByb3NlcyUyMGJvdXF1ZXQlMjBmbG93ZXIlMjBzaG9wfGVufDF8fHx8MTc3MzI2Nzk4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Bouquets" },
  { id: 2, name: "Sunflower Arrangement", price: 1500, image: "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5mbG93ZXIlMjBib3VxdWV0JTIwYXJyYW5nZW1lbnR8ZW58MXx8fHwxNzczMjMyNDEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Arrangements" },
  { id: 3, name: "Tulip Bouquet", price: 1200, image: "https://images.unsplash.com/photo-1658925799003-4ff57ce83ea7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0dWxpcCUyMGJvdXF1ZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzMyNDc0ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Bouquets" },
  { id: 4, name: "Lavender Bundle", price: 500, image: "https://images.unsplash.com/photo-1760926478443-247df5fe9893?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXZlbmRlciUyMGRyaWVkJTIwZmxvd2VycyUyMGJ1bmRsZXxlbnwxfHx8fDE3NzMyNjc5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Dried" },
  { id: 5, name: "White Lily Set", price: 1800, image: "https://images.unsplash.com/photo-1687946271298-caa66056eef1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGxpbHklMjBmbG93ZXIlMjBlbGVnYW50fGVufDF8fHx8MTc3MzI2Nzk4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Arrangements" },
  { id: 6, name: "Purple Orchid Pot", price: 2100, image: "https://images.unsplash.com/photo-1767380753017-b7681c1bc172?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBwdXJwbGUlMjBmbG93ZXIlMjBwb3R8ZW58MXx8fHwxNzczMjY3OTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Potted" },
  { id: 7, name: "Pink Peony Bouquet", price: 1200, image: "https://images.unsplash.com/photo-1609840533612-0cdfb9418281?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9ueSUyMHBpbmslMjBib3VxdWV0JTIwZnJlc2h8ZW58MXx8fHwxNzczMjY3OTg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Bouquets" },
  { id: 8, name: "Mixed Wildflowers", price: 1000, image: "https://images.unsplash.com/photo-1609514281495-a8e2ee3233c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXhlZCUyMHdpbGRmbG93ZXIlMjBhcnJhbmdlbWVudCUyMHZhc2V8ZW58MXx8fHwxNzczMjY3OTg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Arrangements" },
  { id: 9, name: "Dahlia Bouquet", price: 1400, image: "https://images.unsplash.com/photo-1663476252478-b57b8ef0973f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYWhsaWElMjBmbG93ZXIlMjBib3VxdWV0fGVufDF8fHx8MTc3MzI3NDk0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Bouquets" },
  { id: 10, name: "Carnation Arrangement", price: 950, image: "https://images.unsplash.com/photo-1767810164641-11a6fb0a7b52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJuYXRpb24lMjBmbG93ZXIlMjBhcnJhbmdlbWVudHxlbnwxfHx8fDE3NzMyNzQ5NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Arrangements" },
  { id: 11, name: "Blue Hydrangea", price: 1600, image: "https://images.unsplash.com/photo-1629379555555-79c361b3736b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoeWRyYW5nZWElMjBmbG93ZXIlMjBibHVlfGVufDF8fHx8MTc3MzI3NDk0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Bouquets" },
  { id: 12, name: "Succulent Pot", price: 800, image: "https://images.unsplash.com/photo-1649531373919-a52c80fba1e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBwb3R0ZWQlMjBwbGFudHxlbnwxfHx8fDE3NzMyMjk4MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Potted" },
  { id: 13, name: "Cherry Blossom Branch", price: 1100, image: "https://images.unsplash.com/photo-1715208013039-fa1f08715ab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVycnklMjBibG9zc29tJTIwc3ByaW5nJTIwYnJhbmNofGVufDF8fHx8MTc3MzI3NDk0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Arrangements" },
  { id: 14, name: "Dried Eucalyptus", price: 650, image: "https://images.unsplash.com/photo-1678830058217-4ce4dd577629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmllZCUyMGV1Y2FseXB0dXMlMjBmbG93ZXJzfGVufDF8fHx8MTc3MzI3NDk0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Dried" },
  { id: 15, name: "Mini Cactus Pot", price: 450, image: "https://images.unsplash.com/photo-1758903823393-590ccfb3bcc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWN0dXMlMjBzbWFsbCUyMHBvdHRlZHxlbnwxfHx8fDE3NzMyNzQ5NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Potted" },
  { id: 16, name: "Gerbera Daisy Mix", price: 900, image: "https://images.unsplash.com/photo-1648316356281-c9354efc019a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZXJiZXJhJTIwZGFpc3klMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzMyNzQ5NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Bouquets" },
  { id: 17, name: "Purple Iris Set", price: 1300, image: "https://images.unsplash.com/photo-1713526979339-e2a44ee120eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcmlzJTIwcHVycGxlJTIwZmxvd2VyfGVufDF8fHx8MTc3MzI3NDk0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Arrangements" },
  { id: 18, name: "Jasmine Bouquet", price: 750, image: "https://images.unsplash.com/photo-1652018539007-fda8e4103459?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXNtaW5lJTIwd2hpdGUlMjBmbG93ZXJzfGVufDF8fHx8MTc3MzIxMDg0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Bouquets" },
  { id: 19, name: "Lily of the Valley", price: 1700, image: "https://images.unsplash.com/photo-1654679929885-742d53468f4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWx5JTIwb2YlMjB0aGUlMjB2YWxsZXklMjBib3VxdWV0fGVufDF8fHx8MTc3MzI3NDk0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Arrangements" },
  { id: 20, name: "Marigold Arrangement", price: 600, image: "https://images.unsplash.com/photo-1686847909012-c6a8f5d6baf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJpZ29sZCUyMG9yYW5nZSUyMGZsb3dlcnxlbnwxfHx8fDE3NzMyNzQ5NDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", category: "Dried" },
];

type PaymentMethod = "card" | "gcash" | "cash" | null;
type FulfillmentMethod = "pickup" | "delivery";

export default function PointOfSale() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  // Card form state
  const [cardForm, setCardForm] = useState({ name: "", number: "", expiry: "", cvv: "" });
  // GCash form state
  const [gcashForm, setGcashForm] = useState({ name: "", phone: "" });
  // Cash form state
  const [cashReceived, setCashReceived] = useState("");

  const categories = ["All", "Bouquets", "Arrangements", "Potted", "Dried"];

  const filtered = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);

  const COLS = 6;
  const ROWS = 3;
  const PAGE_SIZE = COLS * ROWS;
  const [productPage, setProductPage] = useState(0);
  const totalProductPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedProducts = filtered.slice(productPage * PAGE_SIZE, (productPage + 1) * PAGE_SIZE);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.12);
  const deliveryFee = fulfillment === "delivery" ? 150 : 0;
  const total = subtotal + tax + deliveryFee;

  const handlePayment = () => {
    setPaymentMethod(null);
    setShowSuccess(true);
    setCart([]);
    setCardForm({ name: "", number: "", expiry: "", cvv: "" });
    setGcashForm({ name: "", phone: "" });
    setCashReceived("");
  };

  return (
    <div className="lg:h-full flex flex-col max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-5">
      <h1 className="text-[#ff4e00] text-[24px] sm:text-[32px] font-semibold mb-4 flex-shrink-0">Point of Sale</h1>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
        {/* Products Grid */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Category Tabs */}
          <div className="flex gap-2 mb-3 flex-shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setProductPage(0); }}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-[#ff4e00] text-white"
                    : "bg-white text-[#5d5d5d] border border-[#e9e9e9] hover:border-[#ff4e00] hover:text-[#ff4e00]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products with arrows */}
          <div className="flex-1 flex items-center gap-2 min-h-0">
            {/* Left Arrow */}
            <button
              onClick={() => setProductPage(prev => Math.max(0, prev - 1))}
              disabled={productPage === 0}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ff4e00] text-white flex items-center justify-center hover:bg-[#e64600] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Products Grid */}
            <div className="flex-1 h-full grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 grid-rows-3 gap-2 min-h-0">
              {pagedProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group bg-white rounded-[8px] border border-[#e9e9e9] overflow-hidden hover:border-[#ff4e00] hover:shadow-md transition-all text-left flex flex-col min-w-0 min-h-0"
                >
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-1.5 flex-shrink-0">
                    <p className="text-[#383838] text-[12px] font-medium truncate">{product.name}</p>
                    <p className="text-[#ff4e00] text-[13px] font-semibold">P{product.price.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => setProductPage(prev => Math.min(totalProductPages - 1, prev + 1))}
              disabled={productPage >= totalProductPages - 1}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ff4e00] text-white flex items-center justify-center hover:bg-[#e64600] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col min-h-0">
          <div className="bg-white rounded-[12px] border border-[#e9e9e9] flex flex-col h-full">
            <div className="p-5 border-b border-[#e9e9e9]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#ff4e00]" />
                <h2 className="text-[#383838] text-[18px] font-semibold">Current Order</h2>
                <span className="ml-auto bg-[#ff4e00] text-white text-[12px] font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </span>
              </div>
            </div>

            {/* Fulfillment Toggle */}
            <div className="px-4 py-3 border-b border-[#e9e9e9] flex-shrink-0">
              <div className="flex rounded-lg bg-[#f6f6f6] p-1">
                <button
                  onClick={() => setFulfillment("pickup")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[13px] font-medium transition-all ${
                    fulfillment === "pickup"
                      ? "bg-[#ff4e00] text-white shadow-sm"
                      : "text-[#5d5d5d] hover:text-[#383838]"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  Store Pickup
                </button>
                <button
                  onClick={() => setFulfillment("delivery")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[13px] font-medium transition-all ${
                    fulfillment === "delivery"
                      ? "bg-[#ff4e00] text-white shadow-sm"
                      : "text-[#5d5d5d] hover:text-[#383838]"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  Delivery
                </button>
              </div>
              {fulfillment === "delivery" && (
                <div className="mt-2.5 space-y-2">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff4e00]" />
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      placeholder="Delivery address"
                      className="w-full pl-9 pr-3 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00] text-[13px]"
                    />
                  </div>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={e => setDeliveryNote(e.target.value)}
                    placeholder="Delivery notes (optional)"
                    className="w-full px-3 py-2 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00] text-[13px]"
                  />
                  <p className="text-[#ff4e00] text-[11px] font-medium">+ P150 delivery fee</p>
                </div>
              )}
              {fulfillment === "pickup" && (
                <div className="mt-2.5 bg-[#fff5f0] rounded-lg p-2.5 flex items-start gap-2">
                  <Store className="w-4 h-4 text-[#ff4e00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#383838] text-[12px] font-medium">Bloom & Petal Flower Shop</p>
                    <p className="text-[#5d5d5d] text-[11px]">123 Flower St., Makati City</p>
                  </div>
                </div>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center text-[#999]">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-[#ddd]" />
                <p className="text-[14px]">Your cart is empty</p>
                <p className="text-[12px] mt-1">Tap a product to add it</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto min-h-0">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-2 border-b border-[#f0f0f0]">
                      <ImageWithFallback src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#383838] text-[13px] font-medium truncate">{item.name}</p>
                        <p className="text-[#ff4e00] text-[13px] font-semibold">P{(item.price * item.qty).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full border border-[#e9e9e9] flex items-center justify-center hover:border-[#ff4e00] hover:text-[#ff4e00] transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-[13px] font-medium">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full border border-[#e9e9e9] flex items-center justify-center hover:border-[#ff4e00] hover:text-[#ff4e00] transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-[#ccc] hover:text-[#ff4e00] transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 space-y-1.5 border-t border-[#e9e9e9] flex-shrink-0">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#5d5d5d]">Subtotal</span>
                    <span className="text-[#383838] font-medium">P{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#5d5d5d]">Tax (12%)</span>
                    <span className="text-[#383838] font-medium">P{tax.toLocaleString()}</span>
                  </div>
                  {fulfillment === "delivery" && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#5d5d5d]">Delivery Fee</span>
                      <span className="text-[#383838] font-medium">P{deliveryFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[16px] font-semibold pt-1.5 border-t border-[#e9e9e9]">
                    <span className="text-[#383838]">Total</span>
                    <span className="text-[#ff4e00]">P{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-1.5 flex-shrink-0">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium text-[14px]"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay with Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod("gcash")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#007dfe] text-white rounded-lg hover:bg-[#0066d1] transition-colors font-medium text-[14px]"
                  >
                    <Smartphone className="w-4 h-4" />
                    Pay with GCash
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2e7d32] text-white rounded-lg hover:bg-[#256b29] transition-colors font-medium text-[14px]"
                  >
                    <Banknote className="w-4 h-4" />
                    Pay with Cash
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Payment Modal */}
      {paymentMethod === "card" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#fff5f0] rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#ff4e00]" />
                </div>
                <h2 className="text-[#383838] text-[22px] font-semibold">Card Payment</h2>
              </div>
              <button onClick={() => setPaymentMethod(null)} className="text-[#5d5d5d] hover:text-[#ff4e00]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#fafafa] rounded-lg p-4 mb-6">
              <div className="flex justify-between text-[14px] mb-1">
                <span className="text-[#5d5d5d]">Amount to Pay</span>
                <span className="text-[#ff4e00] text-[22px] font-semibold">P{total.toLocaleString()}</span>
              </div>
              <p className="text-[#999] text-[12px]">{cart.length} item(s) + 12% tax</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Cardholder Name</label>
                <input
                  type="text"
                  value={cardForm.name}
                  onChange={e => setCardForm({ ...cardForm, name: e.target.value })}
                  placeholder="John Anderson"
                  className="w-full px-4 py-2.5 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]"
                />
              </div>
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Card Number</label>
                <input
                  type="text"
                  value={cardForm.number}
                  onChange={e => setCardForm({ ...cardForm, number: e.target.value })}
                  placeholder="1234  5678  9012  3456"
                  maxLength={19}
                  className="w-full px-4 py-2.5 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00] tracking-wider"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={cardForm.expiry}
                    onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-2.5 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]"
                  />
                </div>
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-2">CVV</label>
                  <input
                    type="password"
                    value={cardForm.cvv}
                    onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })}
                    placeholder="***"
                    maxLength={4}
                    className="w-full px-4 py-2.5 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#ff4e00]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setPaymentMethod(null)}
                className="flex-1 px-6 py-3 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GCash Payment Modal */}
      {paymentMethod === "gcash" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e8f4ff] rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#007dfe]" />
                </div>
                <h2 className="text-[#383838] text-[22px] font-semibold">GCash Payment</h2>
              </div>
              <button onClick={() => setPaymentMethod(null)} className="text-[#5d5d5d] hover:text-[#007dfe]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#e8f4ff] rounded-lg p-4 mb-6">
              <div className="flex justify-between text-[14px] mb-1">
                <span className="text-[#5d5d5d]">Amount to Pay</span>
                <span className="text-[#007dfe] text-[22px] font-semibold">P{total.toLocaleString()}</span>
              </div>
              <p className="text-[#999] text-[12px]">{cart.length} item(s) + 12% tax</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Account Name</label>
                <input
                  type="text"
                  value={gcashForm.name}
                  onChange={e => setGcashForm({ ...gcashForm, name: e.target.value })}
                  placeholder="Juan Dela Cruz"
                  className="w-full px-4 py-2.5 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#007dfe]"
                />
              </div>
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">GCash Number</label>
                <input
                  type="tel"
                  value={gcashForm.phone}
                  onChange={e => setGcashForm({ ...gcashForm, phone: e.target.value })}
                  placeholder="09XX XXX XXXX"
                  className="w-full px-4 py-2.5 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#007dfe]"
                />
              </div>

              <div className="bg-[#fafafa] rounded-lg p-4 text-center">
                <p className="text-[#5d5d5d] text-[13px] mb-2">A payment request will be sent to your GCash app for confirmation.</p>
                <div className="flex items-center justify-center gap-2 text-[#007dfe]">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[13px] font-medium">Check your phone for the GCash notification</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-6">
              <button
                onClick={handlePayment}
                className="w-full px-6 py-3 bg-[#007dfe] text-white rounded-lg hover:bg-[#0066d1] transition-colors font-medium"
              >
                Send Payment Request
              </button>
              <button
                onClick={() => setPaymentMethod(null)}
                className="w-full px-6 py-3 border-[1.5px] border-[#007dfe] text-[#007dfe] rounded-lg hover:bg-[#e8f4ff] transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Payment Modal */}
      {paymentMethod === "cash" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e8f5e9] rounded-full flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-[#2e7d32]" />
                </div>
                <h2 className="text-[#383838] text-[22px] font-semibold">Cash Payment</h2>
              </div>
              <button onClick={() => setPaymentMethod(null)} className="text-[#5d5d5d] hover:text-[#2e7d32]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#e8f5e9] rounded-lg p-4 mb-6">
              <div className="flex justify-between text-[14px] mb-1">
                <span className="text-[#5d5d5d]">Amount to Pay</span>
                <span className="text-[#2e7d32] text-[22px] font-semibold">P{total.toLocaleString()}</span>
              </div>
              <p className="text-[#999] text-[12px]">{cart.length} item(s) + 12% tax</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#383838] text-[14px] font-medium mb-2">Cash Received</label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={e => setCashReceived(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2.5 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#2e7d32] text-[18px]"
                />
              </div>

              {/* Quick denomination buttons */}
              <div>
                <label className="block text-[#5d5d5d] text-[13px] mb-2">Quick Amount</label>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 200, 500, 1000, 2000, 5000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setCashReceived(String(amount))}
                      className="px-3 py-2 border border-[#d8d8d8] rounded-lg text-[13px] font-medium text-[#383838] hover:border-[#2e7d32] hover:text-[#2e7d32] transition-colors"
                    >
                      P{amount.toLocaleString()}
                    </button>
                  ))}
                  <button
                    onClick={() => setCashReceived(String(total))}
                    className="col-span-2 px-3 py-2 border border-[#2e7d32] bg-[#e8f5e9] rounded-lg text-[13px] font-medium text-[#2e7d32] hover:bg-[#c8e6c9] transition-colors"
                  >
                    Exact Amount
                  </button>
                </div>
              </div>

              {/* Change calculation */}
              {cashReceived && (
                <div className={`rounded-lg p-4 ${Number(cashReceived) >= total ? 'bg-[#e8f5e9]' : 'bg-[#fff3e0]'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5d5d5d] text-[14px]">Change</span>
                    <span className={`text-[20px] font-semibold ${Number(cashReceived) >= total ? 'text-[#2e7d32]' : 'text-[#e65100]'}`}>
                      {Number(cashReceived) >= total
                        ? `P${(Number(cashReceived) - total).toLocaleString()}`
                        : `Short P${(total - Number(cashReceived)).toLocaleString()}`
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-6">
              <button
                onClick={handlePayment}
                disabled={!cashReceived || Number(cashReceived) < total}
                className="w-full px-6 py-3 bg-[#2e7d32] text-white rounded-lg hover:bg-[#256b29] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Payment
              </button>
              <button
                onClick={() => setPaymentMethod(null)}
                className="w-full px-6 py-3 border-[1.5px] border-[#2e7d32] text-[#2e7d32] rounded-lg hover:bg-[#e8f5e9] transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#2e7d32]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[#383838] text-[24px] font-semibold mb-2">Payment Successful!</h2>
            <p className="text-[#5d5d5d] text-[14px] mb-6">Transaction has been completed. A receipt has been sent to the customer.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}