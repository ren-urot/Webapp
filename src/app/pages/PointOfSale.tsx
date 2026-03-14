import React, { useState, useEffect, useCallback } from "react";
import { Plus, Minus, X, CreditCard, Smartphone, ShoppingBag, Trash2, Banknote, ChevronLeft, ChevronRight, Truck, Store, MapPin, Printer, Loader2 } from "lucide-react";
// Image component with error fallback
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import * as api from "../lib/api";
import { QRCodeSVG } from "qrcode.react";

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

type PaymentMethod = "card" | "gcash" | "cash" | null;
type FulfillmentMethod = "pickup" | "delivery";

export default function PointOfSale() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
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

  // Sale processing state
  const [processingSale, setProcessingSale] = useState(false);
  const [saleError, setSaleError] = useState<string | null>(null);

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await api.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load POS products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Receipt printing state
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{
    items: CartItem[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
    fulfillment: FulfillmentMethod;
    paymentMethod: string;
    cashReceived?: number;
    change?: number;
    date: string;
    time: string;
    receiptNo: string;
  } | null>(null);

  const printReceipt = useCallback((receiptData: NonNullable<typeof lastReceipt>) => {
    const printWindow = window.open("", "_blank", "width=320,height=600");
    if (!printWindow) return;

    const itemsHtml = receiptData.items
      .map(
        (i) => `
        <tr>
          <td style="text-align:left;padding:2px 0;font-size:12px;">${i.name} x${i.qty}</td>
          <td style="text-align:right;padding:2px 0;font-size:12px;">P${(i.price * i.qty).toLocaleString()}</td>
        </tr>`
      )
      .join("");

    const paymentLabel =
      receiptData.paymentMethod === "card"
        ? "Card"
        : receiptData.paymentMethod === "gcash"
        ? "GCash"
        : "Cash";

    const cashSection =
      receiptData.paymentMethod === "cash" && receiptData.cashReceived != null
        ? `
        <tr>
          <td style="text-align:left;padding:2px 0;font-size:12px;">Cash Received</td>
          <td style="text-align:right;padding:2px 0;font-size:12px;">P${receiptData.cashReceived.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="text-align:left;padding:2px 0;font-size:12px;">Change</td>
          <td style="text-align:right;padding:2px 0;font-size:12px;">P${(receiptData.change ?? 0).toLocaleString()}</td>
        </tr>`
        : "";

    const deliverySection =
      receiptData.fulfillment === "delivery"
        ? `
        <tr>
          <td style="text-align:left;padding:2px 0;font-size:12px;">Delivery Fee</td>
          <td style="text-align:right;padding:2px 0;font-size:12px;">P${receiptData.deliveryFee.toLocaleString()}</td>
        </tr>`
        : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          @page { margin: 0; size: 80mm auto; }
          body {
            font-family: 'Courier New', monospace;
            width: 72mm;
            margin: 4mm auto;
            padding: 0;
            color: #000;
            font-size: 12px;
            line-height: 1.4;
          }
          .center { text-align: center; }
          .divider {
            border: none;
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          table { width: 100%; border-collapse: collapse; }
          .bold { font-weight: bold; }
          .total-row td {
            font-size: 14px;
            font-weight: bold;
            padding: 4px 0;
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="bold" style="font-size:16px;margin-bottom:2px;">Bloom & Petal</div>
          <div style="font-size:11px;">Flower Shop</div>
          <div style="font-size:10px;color:#555;">123 Flower St., Makati City</div>
          <div style="font-size:10px;color:#555;">Tel: (02) 8123-4567</div>
        </div>

        <hr class="divider" />

        <div style="display:flex;justify-content:space-between;font-size:10px;color:#555;">
          <span>Receipt #${receiptData.receiptNo}</span>
          <span>${receiptData.date}</span>
        </div>
        <div style="font-size:10px;color:#555;">Time: ${receiptData.time}</div>
        <div style="font-size:10px;color:#555;">Payment: ${paymentLabel}</div>
        <div style="font-size:10px;color:#555;">Type: ${receiptData.fulfillment === "delivery" ? "Delivery" : "Store Pickup"}</div>

        <hr class="divider" />

        <table>
          <thead>
            <tr>
              <th style="text-align:left;font-size:11px;padding-bottom:4px;border-bottom:1px solid #ccc;">Item</th>
              <th style="text-align:right;font-size:11px;padding-bottom:4px;border-bottom:1px solid #ccc;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <hr class="divider" />

        <table>
          <tbody>
            <tr>
              <td style="text-align:left;padding:2px 0;font-size:12px;">Subtotal</td>
              <td style="text-align:right;padding:2px 0;font-size:12px;">P${receiptData.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="text-align:left;padding:2px 0;font-size:12px;">Tax (12%)</td>
              <td style="text-align:right;padding:2px 0;font-size:12px;">P${receiptData.tax.toLocaleString()}</td>
            </tr>
            ${deliverySection}
          </tbody>
        </table>

        <hr class="divider" />

        <table>
          <tbody>
            <tr class="total-row">
              <td style="text-align:left;">TOTAL</td>
              <td style="text-align:right;">P${receiptData.total.toLocaleString()}</td>
            </tr>
            ${cashSection}
          </tbody>
        </table>

        <hr class="divider" />

        <div class="center" style="margin-top:8px;">
          <div style="font-size:12px;font-weight:bold;">Thank you for your purchase!</div>
          <div style="font-size:10px;color:#555;margin-top:4px;">Visit us again at Bloom & Petal</div>
          <div style="font-size:10px;color:#555;">www.bloomandpetal.ph</div>
        </div>

        <div class="center" style="margin-top:12px;font-size:9px;color:#999;">
          --- End of Receipt ---
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
            setTimeout(function() { window.close(); }, 10000);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }, []);

  const categories = ["All", "Flowers", "Dried Flowers", "Potted", "Supplies", "Accessories"];

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

  const handlePayment = async () => {
    if (processingSale) return; // Prevent double clicks
    setProcessingSale(true);
    setSaleError(null);

    // Save order to backend
    const itemsSummary = cart.map(i => `${i.name} x${i.qty}`).join(", ");
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const receiptNo = `BP-${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    // Capture cart items before clearing
    const cartSnapshot = [...cart];
    const saleItems = cartSnapshot.map(i => ({ id: i.id, qty: i.qty }));

    try {
      // 1. Deduct inventory stock FIRST (await it so we know it worked)
      console.log("POS Sale: Sending cart items for stock deduction:", JSON.stringify(saleItems));
      const saleResult = await api.posSale(saleItems);
      console.log("POS Sale: Stock deduction response:", JSON.stringify(saleResult));
      if (saleResult.notFound && saleResult.notFound.length > 0) {
        console.warn("POS Sale: Some items were NOT found in inventory:", JSON.stringify(saleResult.notFound));
      }
      if (saleResult.deductions) {
        console.log("POS Sale: Deductions applied:", saleResult.deductions.map((d: any) => `${d.name}: ${d.oldStock} -> ${d.newStock} (qty: ${d.qty})`).join(", "));
      }

      // 2. Create order record (fire-and-forget is OK for this)
      api.createOrder({
        customer: "Walk-in Customer",
        items: itemsSummary,
        date: dateStr,
        total: `P${total.toLocaleString()}`,
        status: "Completed",
      }).catch(err => console.error("Failed to save order:", err));

      // 3. Create delivery record if fulfillment is delivery
      if (fulfillment === "delivery") {
        const now2 = new Date();
        const scheduledDate = now2.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const scheduledTime = now2.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const orderTime = now2.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

        api.createDelivery({
          orderId: receiptNo,
          customer: "Walk-in Customer",
          phone: "—",
          address: deliveryAddress || "No address provided",
          items: itemsSummary,
          scheduledDate,
          scheduledTime,
          driver: "Unassigned",
          status: "Preparing",
          estimatedArrival: "—",
          notes: deliveryNote || "",
          timeline: [
            { step: "Order Placed", time: orderTime, done: true },
            { step: "Preparing Order", time: "Pending", done: false },
            { step: "Picked Up by Driver", time: "Pending", done: false },
            { step: "Out for Delivery", time: "Pending", done: false },
            { step: "Delivered", time: "Pending", done: false },
          ],
        }).catch(err => console.error("Failed to create delivery record:", err));
      }

      // 4. Refresh products list to reflect updated stock
      try {
        const updatedProducts = await api.getProducts();
        setProducts(updatedProducts);
      } catch (err) {
        console.error("Failed to refresh products after sale:", err);
      }

      // Prepare receipt data
      const receiptData: NonNullable<typeof lastReceipt> = {
        items: cartSnapshot,
        subtotal,
        tax,
        deliveryFee,
        total,
        fulfillment,
        paymentMethod: paymentMethod ?? "cash",
        cashReceived: paymentMethod === "cash" ? Number(cashReceived) : undefined,
        change: paymentMethod === "cash" ? Number(cashReceived) - total : undefined,
        date: dateStr,
        time: timeStr,
        receiptNo,
      };

      // Set last receipt
      setLastReceipt(receiptData);

      // Print receipt if auto print is enabled
      if (autoPrintReceipt) {
        printReceipt(receiptData);
      }

      setPaymentMethod(null);
      setShowSuccess(true);
      setCart([]);
      setCardForm({ name: "", number: "", expiry: "", cvv: "" });
      setGcashForm({ name: "", phone: "" });
      setCashReceived("");
      setDeliveryAddress("");
      setDeliveryNote("");
      setFulfillment("pickup");
    } catch (err: any) {
      console.error("POS Sale FAILED:", err);
      setSaleError(err?.message || "Failed to process sale. Please try again.");
    } finally {
      setProcessingSale(false);
    }
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
            {loadingProducts ? (
              <div className="flex-1 h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#ff4e00] animate-spin" />
                <span className="ml-3 text-[#5d5d5d] text-[14px]">Loading products...</span>
              </div>
            ) : (
            <>
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
              {pagedProducts.length === 0 ? (
                <div className="col-span-full row-span-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#fff5f0] flex items-center justify-center mb-2">
                    <ShoppingBag className="w-6 h-6 text-[#ff4e00]" />
                  </div>
                  <p className="text-[#383838] text-[16px] font-medium">No data available</p>
                  <p className="text-[#999] text-[13px] mt-1">Products will appear here once added</p>
                </div>
              ) : (
                pagedProducts.map(product => (
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
                ))
              )}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => setProductPage(prev => Math.min(totalProductPages - 1, prev + 1))}
              disabled={productPage >= totalProductPages - 1}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ff4e00] text-white flex items-center justify-center hover:bg-[#e64600] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            </>
            )}
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

                  {/* Auto Print Receipt Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <label htmlFor="auto-print" className="flex items-center gap-1.5 cursor-pointer select-none">
                      <Printer className="w-3.5 h-3.5 text-[#5d5d5d]" />
                      <span className="text-[#5d5d5d] text-[12px]">Auto-print receipt</span>
                    </label>
                    <button
                      id="auto-print"
                      onClick={() => setAutoPrintReceipt(!autoPrintReceipt)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        autoPrintReceipt ? "bg-[#ff4e00]" : "bg-[#d8d8d8]"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        autoPrintReceipt ? "translate-x-[18px]" : "translate-x-0.5"
                      }`} />
                    </button>
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
                disabled={processingSale}
                className="flex-1 px-6 py-3 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={processingSale}
                className="flex-1 px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingSale ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Confirm Payment"}
              </button>
            </div>
            {saleError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[13px]">{saleError}</div>
            )}
          </div>
        </div>
      )}

      {/* GCash Payment Modal */}
      {paymentMethod === "gcash" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
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

            <div className="bg-[#e8f4ff] rounded-lg p-4 mb-5">
              <div className="flex justify-between text-[14px] mb-1">
                <span className="text-[#5d5d5d]">Amount to Pay</span>
                <span className="text-[#007dfe] text-[22px] font-semibold">P{total.toLocaleString()}</span>
              </div>
              <p className="text-[#999] text-[12px]">{cart.length} item(s) + 12% tax</p>
            </div>

            {/* QR Code Section */}
            <div className="bg-[#fafafa] rounded-xl p-5 mb-5">
              <p className="text-[#383838] text-[14px] font-semibold text-center mb-3">Scan QR Code to Pay</p>
              <div className="flex justify-center mb-3">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-[#e9e9e9]">
                  <QRCodeSVG
                    value={`gcash://pay?amount=${total}&merchant=BloomAndPetal&ref=${Date.now()}`}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#007dfe"
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-[#007dfe] mb-2">
                <Smartphone className="w-4 h-4" />
                <span className="text-[13px] font-medium">Open GCash app & scan</span>
              </div>
              <p className="text-[#999] text-[11px] text-center">QR code expires in 10 minutes</p>
            </div>

            {/* Divider with "or" */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#e9e9e9]" />
              <span className="text-[#999] text-[12px] font-medium">or enter details manually</span>
              <div className="flex-1 h-px bg-[#e9e9e9]" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#383838] text-[13px] font-medium mb-1.5">Account Name</label>
                <input
                  type="text"
                  value={gcashForm.name}
                  onChange={e => setGcashForm({ ...gcashForm, name: e.target.value })}
                  placeholder="Juan Dela Cruz"
                  className="w-full px-4 py-2.5 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#007dfe] text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[#383838] text-[13px] font-medium mb-1.5">GCash Number</label>
                <input
                  type="tel"
                  value={gcashForm.phone}
                  onChange={e => setGcashForm({ ...gcashForm, phone: e.target.value })}
                  placeholder="09XX XXX XXXX"
                  className="w-full px-4 py-2.5 border border-[#d8d8d8] rounded-lg focus:outline-none focus:border-[#007dfe] text-[14px]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-5">
              <button
                onClick={handlePayment}
                disabled={processingSale}
                className="w-full px-6 py-3 bg-[#007dfe] text-white rounded-lg hover:bg-[#0066d1] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingSale ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Confirm Payment"}
              </button>
              <button
                onClick={() => setPaymentMethod(null)}
                disabled={processingSale}
                className="w-full px-6 py-3 border-[1.5px] border-[#007dfe] text-[#007dfe] rounded-lg hover:bg-[#e8f4ff] transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            {saleError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[13px]">{saleError}</div>
            )}
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
                disabled={processingSale || !cashReceived || Number(cashReceived) < total}
                className="w-full px-6 py-3 bg-[#2e7d32] text-white rounded-lg hover:bg-[#256b29] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingSale ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Confirm Payment"}
              </button>
              <button
                onClick={() => setPaymentMethod(null)}
                disabled={processingSale}
                className="w-full px-6 py-3 border-[1.5px] border-[#2e7d32] text-[#2e7d32] rounded-lg hover:bg-[#e8f5e9] transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            {saleError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[13px]">{saleError}</div>
            )}
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
            <p className="text-[#5d5d5d] text-[14px] mb-6">Transaction has been completed successfully.</p>
            {lastReceipt && (
              <button
                onClick={() => printReceipt(lastReceipt)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-medium mb-2"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
            )}
            <button
              onClick={() => { setShowSuccess(false); setLastReceipt(null); }}
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