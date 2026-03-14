// Frontend API helper for Flowershop CRM
// All data operations go through the Supabase Edge Function server

import { projectId, publicAnonKey } from "../utils/supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-abc5f7d2`;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${publicAnonKey}`,
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { headers, ...options });
  if (!res.ok) {
    const errBody = await res.text();
    console.error(`API Error [${res.status}] ${options?.method || "GET"} ${path}: ${errBody}`);
    throw new Error(`API Error: ${res.status} - ${errBody}`);
  }
  return res.json();
}

// Seed the database with initial data (only runs once unless forced)
export const seedDatabase = () => request<{ message: string; seeded: boolean }>("/seed", { method: "POST" });
export const forceSeedDatabase = () => request<{ message: string; seeded: boolean }>("/seed/force", { method: "POST" });

// Customers
export const getCustomers = () => request<any[]>("/customers");
export const createCustomer = (data: { name: string; email: string; phone: string }) =>
  request<any>("/customers", { method: "POST", body: JSON.stringify(data) });
export const updateCustomer = (id: number, data: Partial<{ name: string; email: string; phone: string }>) =>
  request<any>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCustomer = (id: number) =>
  request<{ success: boolean }>(`/customers/${id}`, { method: "DELETE" });

// Orders
export const getOrders = () => request<any[]>("/orders");
export const createOrder = (data: any) =>
  request<any>("/orders", { method: "POST", body: JSON.stringify(data) });
export const updateOrder = (id: string, data: any) =>
  request<any>(`/orders/${id}`, { method: "PUT", body: JSON.stringify(data) });

// Workshops
export const getWorkshops = () => request<any[]>("/workshops");
export const createWorkshop = (data: any) =>
  request<any>("/workshops", { method: "POST", body: JSON.stringify(data) });
export const updateWorkshop = (id: number, data: any) =>
  request<any>(`/workshops/${id}`, { method: "PUT", body: JSON.stringify(data) });

// Workshop Registrations
export const getWorkshopRegistrations = (workshopId: string) =>
  request<any[]>(`/workshops/${workshopId}/registrations`);
export const registerForWorkshop = (workshopId: string, customerId: number) =>
  request<any>(`/workshops/${workshopId}/registrations/${customerId}`, { method: "PUT" });

// Inventory
export const getInventory = () => request<any[]>("/inventory");
export const createInventoryItem = (data: any) =>
  request<any>("/inventory", { method: "POST", body: JSON.stringify(data) });
export const updateInventoryItem = (id: number, data: any) =>
  request<any>(`/inventory/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteInventoryItem = (id: number) =>
  request<{ success: boolean }>(`/inventory/${id}`, { method: "DELETE" });

// Deliveries
export const getDeliveries = () => request<any[]>("/deliveries");
export const updateDelivery = (id: string, data: any) =>
  request<any>(`/deliveries/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const createDelivery = (data: any) =>
  request<any>("/deliveries", { method: "POST", body: JSON.stringify(data) });

// POS Products
export const getProducts = () => request<any[]>("/products");
export const createProduct = (data: any) =>
  request<any>("/products", { method: "POST", body: JSON.stringify(data) });
export const updateProduct = (id: number, data: any) =>
  request<any>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduct = (id: number) =>
  request<{ success: boolean }>(`/products/${id}`, { method: "DELETE" });

// Notifications
export const getNotifications = () => request<any[]>("/notifications");
export const markNotificationRead = (id: number) =>
  request<{ success: boolean }>(`/notifications/${id}/read`, { method: "PUT" });
export const markAllNotificationsRead = () =>
  request<{ success: boolean }>("/notifications/read-all", { method: "PUT" });
export const deleteNotification = (id: number) =>
  request<{ success: boolean }>(`/notifications/${id}`, { method: "DELETE" });

// Image Upload
export const uploadImage = async (file: File): Promise<{ url: string; fileName: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const url = `${API_BASE}/upload`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${publicAnonKey}` },
    body: formData,
  });
  if (!res.ok) {
    const errBody = await res.text();
    console.error(`API Error [${res.status}] POST /upload: ${errBody}`);
    throw new Error(`Upload failed: ${res.status} - ${errBody}`);
  }
  return res.json();
};

// Auth - Sign Up (calls server to create user via admin API)
export const signUp = (data: { email: string; password: string; fullName: string; plan: string; paymentMethod?: string; paymentDetails?: Record<string, string> }) =>
  request<{ user: { id: string; email: string; name: string; plan: string }; verificationCode: string }>("/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Auth - Verify Email
export const verifyEmail = (data: { email: string; code: string }) =>
  request<{ success: boolean; message: string }>("/verify-email", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Auth - Resend Verification Code
export const resendCode = (email: string) =>
  request<{ verificationCode: string; message: string }>("/resend-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

// Auth - Login Check (detect unverified users)
export const loginCheck = (email: string) =>
  request<{ exists: boolean; verified: boolean; hasPendingVerification?: boolean }>("/login-check", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
