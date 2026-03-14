import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import {
  seedCustomers,
  seedOrders,
  seedWorkshops,
  seedInventory,
  seedDeliveries,
  seedWorkshopRegistrations,
  seedProducts,
} from "./seed-data.tsx";

const app = new Hono();
const BASE = "/make-server-abc5f7d2";

// Supabase client for storage
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BUCKET_NAME = "make-abc5f7d2-images";

// Idempotently create storage bucket on startup
(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: false });
      console.log(`Created storage bucket: ${BUCKET_NAME}`);
    }
  } catch (err) {
    console.log(`Error creating storage bucket: ${err}`);
  }
})();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Health check endpoint
app.get(`${BASE}/health`, (c) => {
  return c.json({ status: "ok" });
});

// ============================================================
// AUTH - Sign Up
// ============================================================
app.post(`${BASE}/signup`, async (c) => {
  try {
    const { email: rawEmail, password, fullName, plan, paymentMethod, paymentDetails } = await c.req.json();
    const email = rawEmail?.trim()?.toLowerCase();

    if (!email || !password || !fullName) {
      return c.json({ error: "Email, password, and full name are required." }, 400);
    }

    // For paid plans, require a payment method
    if (plan && plan !== "free" && !paymentMethod) {
      return c.json({ error: "Payment method is required for paid plans." }, 400);
    }

    // Create user with email_confirm: true so Supabase never blocks login.
    // We track our own email verification via user_metadata.app_verified.
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name: fullName,
        plan: plan || "basic",
        payment_method: paymentMethod || null,
        payment_details: paymentDetails || null,
        app_verified: false,  // Our own verification flag
      },
      // Automatically confirm so signInWithPassword always works
      email_confirm: true,
    });

    if (error) {
      // If user already exists, check if they are unverified and allow re-signup
      if (error.message.includes("already been registered") || error.message.includes("already exists")) {
        // Look up existing user by email
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existingUser = listData?.users?.find((u: any) => u.email === email);

        if (existingUser && !existingUser.user_metadata?.app_verified) {
          // User exists but hasn't completed OUR verification — update their info and re-issue code
          // Also confirm email at Supabase level so signInWithPassword always works
          await supabase.auth.admin.updateUserById(existingUser.id, {
            password,
            email_confirm: true,
            user_metadata: {
              ...existingUser.user_metadata,
              name: fullName,
              plan: plan || "basic",
              payment_method: paymentMethod || null,
              payment_details: paymentDetails || null,
              app_verified: false,
            },
          });

          const code = String(Math.floor(100000 + Math.random() * 900000));
          await kv.set(`verify_${email}`, { code, userId: existingUser.id, createdAt: Date.now() });

          console.log(`Unverified user updated: ${existingUser.id}, new verification code for ${email}`);
          return c.json({
            user: { id: existingUser.id, email, name: fullName, plan: plan || "basic" },
            verificationCode: code,
            message: "Existing unverified account updated. New verification code generated.",
          }, 201);
        }

        // User exists and IS verified — truly a duplicate
        console.log(`Signup rejected: ${email} is already registered and verified.`);
        return c.json({ error: "This email is already registered. Please log in instead." }, 409);
      }

      console.log(`Auth signup error: ${error.message}`);
      return c.json({ error: `Signup failed: ${error.message}` }, 400);
    }

    // Generate a 6-digit verification code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await kv.set(`verify_${email}`, { code, userId: data.user.id, createdAt: Date.now() });

    console.log(`User created: ${data.user.id}, verification code generated for ${email}`);
    // In production, you would send this code via email. For demo, it's returned in the response.
    return c.json({
      user: { id: data.user.id, email: data.user.email, name: fullName, plan: plan || "basic" },
      verificationCode: code,
      message: "Verification code generated. In production this would be emailed.",
    }, 201);
  } catch (error) {
    console.log(`Error during signup: ${error}`);
    return c.json({ error: `Signup failed: ${error}` }, 500);
  }
});

// Verify email with code
app.post(`${BASE}/verify-email`, async (c) => {
  try {
    const { email: rawEmail, code } = await c.req.json();
    const email = rawEmail?.trim()?.toLowerCase();

    if (!email || !code) {
      return c.json({ error: "Email and verification code are required." }, 400);
    }

    const stored: any = await kv.get(`verify_${email}`);
    console.log(`Verify-email: email=${email}, submitted_code=${code} (type: ${typeof code}), stored=`, JSON.stringify(stored));

    if (!stored) {
      return c.json({ error: "No verification pending for this email. Please sign up first." }, 400);
    }

    // Code expires after 10 minutes
    if (Date.now() - stored.createdAt > 10 * 60 * 1000) {
      await kv.del(`verify_${email}`);
      return c.json({ error: "Verification code has expired. Please sign up again." }, 400);
    }

    // Use String() coercion on both sides to handle type mismatches from JSONB
    const storedCode = String(stored.code).trim();
    const submittedCode = String(code).trim();
    console.log(`Verify-email: comparing storedCode="${storedCode}" (type: ${typeof stored.code}) vs submittedCode="${submittedCode}"`);

    if (storedCode !== submittedCode) {
      return c.json({ error: "Invalid verification code. Please try again." }, 400);
    }

    // Mark user as app-verified in user_metadata
    const { data: userData } = await supabase.auth.admin.getUserById(stored.userId);
    const { data, error } = await supabase.auth.admin.updateUserById(stored.userId, {
      user_metadata: {
        ...(userData?.user?.user_metadata || {}),
        app_verified: true,
      },
    });

    if (error) {
      console.log(`Error confirming email: ${error.message}`);
      return c.json({ error: `Email verification failed: ${error.message}` }, 500);
    }

    // Clean up
    await kv.del(`verify_${email}`);

    console.log(`Email verified for user: ${stored.userId}`);
    return c.json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    console.log(`Error during email verification: ${error}`);
    return c.json({ error: `Verification failed: ${error}` }, 500);
  }
});

// Resend verification code
app.post(`${BASE}/resend-code`, async (c) => {
  try {
    const { email: rawEmail } = await c.req.json();
    const email = rawEmail?.trim()?.toLowerCase();

    if (!email) {
      return c.json({ error: "Email is required." }, 400);
    }

    const stored: any = await kv.get(`verify_${email}`);
    if (!stored) {
      return c.json({ error: "No verification pending for this email." }, 400);
    }

    // Generate a new code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await kv.set(`verify_${email}`, { ...stored, code, createdAt: Date.now() });

    console.log(`Verification code resent for ${email}`);
    return c.json({
      verificationCode: code,
      message: "New verification code generated.",
    });
  } catch (error) {
    console.log(`Error resending verification code: ${error}`);
    return c.json({ error: `Failed to resend code: ${error}` }, 500);
  }
});

// Check login status - helps detect unverified users
app.post(`${BASE}/login-check`, async (c) => {
  try {
    const { email: rawEmail } = await c.req.json();
    const email = rawEmail?.trim()?.toLowerCase();
    if (!email) {
      return c.json({ error: "Email is required." }, 400);
    }

    const { data: listData } = await supabase.auth.admin.listUsers();
    const user = listData?.users?.find((u: any) => u.email === email);

    if (!user) {
      return c.json({ exists: false, verified: false });
    }

    // Check our own app_verified flag in user_metadata
    const isVerified = !!user.user_metadata?.app_verified;
    const hasPendingVerification = !!(await kv.get(`verify_${email}`));

    return c.json({ exists: true, verified: isVerified, hasPendingVerification });
  } catch (error) {
    console.log(`Error checking login status: ${error}`);
    return c.json({ error: `Login check failed: ${error}` }, 500);
  }
});

// Helper: add a notification
async function addNotification(title: string, message: string, type: string) {
  try {
    const notifications: any[] = (await kv.get("crm_notifications")) || [];
    const notif = {
      id: Date.now(),
      title,
      message,
      time: new Date().toISOString(),
      read: false,
      type,
    };
    notifications.unshift(notif); // newest first
    // Keep max 50 notifications
    if (notifications.length > 50) notifications.length = 50;
    await kv.set("crm_notifications", notifications);
  } catch (err) {
    console.log(`Error adding notification: ${err}`);
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================
app.get(`${BASE}/notifications`, async (c) => {
  try {
    const notifications = (await kv.get("crm_notifications")) || [];
    return c.json(notifications);
  } catch (error) {
    console.log(`Error fetching notifications: ${error}`);
    return c.json({ error: `Failed to fetch notifications: ${error}` }, 500);
  }
});

app.put(`${BASE}/notifications/:id/read`, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const notifications: any[] = (await kv.get("crm_notifications")) || [];
    const idx = notifications.findIndex((n: any) => n.id === id);
    if (idx !== -1) {
      notifications[idx].read = true;
      await kv.set("crm_notifications", notifications);
    }
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error marking notification as read: ${error}`);
    return c.json({ error: `Failed to update notification: ${error}` }, 500);
  }
});

app.put(`${BASE}/notifications/read-all`, async (c) => {
  try {
    const notifications: any[] = (await kv.get("crm_notifications")) || [];
    notifications.forEach((n: any) => (n.read = true));
    await kv.set("crm_notifications", notifications);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error marking all notifications as read: ${error}`);
    return c.json({ error: `Failed to update notifications: ${error}` }, 500);
  }
});

app.delete(`${BASE}/notifications/:id`, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const notifications: any[] = (await kv.get("crm_notifications")) || [];
    const filtered = notifications.filter((n: any) => n.id !== id);
    await kv.set("crm_notifications", filtered);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting notification: ${error}`);
    return c.json({ error: `Failed to delete notification: ${error}` }, 500);
  }
});

// ============================================================
// SEED ENDPOINT - Populate database with initial mock data
// ============================================================
app.post(`${BASE}/seed`, async (c) => {
  try {
    const existing = await kv.get("crm_customers");
    if (existing) {
      return c.json({ message: "Database already seeded. Use force=true to overwrite.", seeded: false });
    }

    await kv.set("crm_customers", seedCustomers);
    await kv.set("crm_orders", seedOrders);
    await kv.set("crm_workshops", seedWorkshops);
    await kv.set("crm_inventory", seedInventory);
    await kv.set("crm_deliveries", seedDeliveries);
    await kv.set("crm_products", seedProducts);

    // Seed workshop registrations for each workshop
    for (const [workshopId, registrations] of Object.entries(seedWorkshopRegistrations)) {
      await kv.set(`crm_workshop_reg_${workshopId}`, registrations);
    }

    console.log("Database seeded successfully with initial mock data");
    return c.json({ message: "Database seeded successfully", seeded: true });
  } catch (error) {
    console.log(`Error seeding database: ${error}`);
    return c.json({ error: `Failed to seed database: ${error}` }, 500);
  }
});

// Force seed (overwrites existing data)
app.post(`${BASE}/seed/force`, async (c) => {
  try {
    await kv.set("crm_customers", seedCustomers);
    await kv.set("crm_orders", seedOrders);
    await kv.set("crm_workshops", seedWorkshops);
    await kv.set("crm_inventory", seedInventory);
    await kv.set("crm_deliveries", seedDeliveries);
    await kv.set("crm_products", seedProducts);

    for (const [workshopId, registrations] of Object.entries(seedWorkshopRegistrations)) {
      await kv.set(`crm_workshop_reg_${workshopId}`, registrations);
    }

    console.log("Database force-seeded successfully");
    return c.json({ message: "Database force-seeded successfully", seeded: true });
  } catch (error) {
    console.log(`Error force-seeding database: ${error}`);
    return c.json({ error: `Failed to force-seed database: ${error}` }, 500);
  }
});

// ============================================================
// CUSTOMERS CRUD
// ============================================================
app.get(`${BASE}/customers`, async (c) => {
  try {
    const customers = (await kv.get("crm_customers")) || [];
    return c.json(customers);
  } catch (error) {
    console.log(`Error fetching customers: ${error}`);
    return c.json({ error: `Failed to fetch customers: ${error}` }, 500);
  }
});

app.post(`${BASE}/customers`, async (c) => {
  try {
    const body = await c.req.json();
    const customers = (await kv.get("crm_customers")) || [];
    const newCustomer = { ...body, id: Date.now() };
    customers.push(newCustomer);
    await kv.set("crm_customers", customers);
    await addNotification("New Customer Added", `${body.name} was added to your customer list`, "customer");
    return c.json(newCustomer, 201);
  } catch (error) {
    console.log(`Error creating customer: ${error}`);
    return c.json({ error: `Failed to create customer: ${error}` }, 500);
  }
});

app.put(`${BASE}/customers/:id`, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const customers = (await kv.get("crm_customers")) || [];
    const idx = customers.findIndex((cust: any) => cust.id === id);
    if (idx === -1) return c.json({ error: "Customer not found" }, 404);
    customers[idx] = { ...customers[idx], ...body };
    await kv.set("crm_customers", customers);
    return c.json(customers[idx]);
  } catch (error) {
    console.log(`Error updating customer: ${error}`);
    return c.json({ error: `Failed to update customer: ${error}` }, 500);
  }
});

app.delete(`${BASE}/customers/:id`, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const customers = (await kv.get("crm_customers")) || [];
    const filtered = customers.filter((cust: any) => cust.id !== id);
    await kv.set("crm_customers", filtered);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting customer: ${error}`);
    return c.json({ error: `Failed to delete customer: ${error}` }, 500);
  }
});

// ============================================================
// SALES ORDERS CRUD
// ============================================================
app.get(`${BASE}/orders`, async (c) => {
  try {
    const orders = (await kv.get("crm_orders")) || [];
    return c.json(orders);
  } catch (error) {
    console.log(`Error fetching orders: ${error}`);
    return c.json({ error: `Failed to fetch orders: ${error}` }, 500);
  }
});

app.post(`${BASE}/orders`, async (c) => {
  try {
    const body = await c.req.json();
    const orders = (await kv.get("crm_orders")) || [];
    const orderNum = String(orders.length + 1).padStart(3, "0");
    const newOrder = { ...body, id: `ORD-${orderNum}` };
    orders.push(newOrder);
    await kv.set("crm_orders", orders);
    await addNotification("New Order Received", `${body.customer || "A customer"} placed order ${newOrder.id} — ₱${Number(body.total || 0).toLocaleString()}`, "order");
    return c.json(newOrder, 201);
  } catch (error) {
    console.log(`Error creating order: ${error}`);
    return c.json({ error: `Failed to create order: ${error}` }, 500);
  }
});

app.put(`${BASE}/orders/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const orders = (await kv.get("crm_orders")) || [];
    const idx = orders.findIndex((o: any) => o.id === id);
    if (idx === -1) return c.json({ error: "Order not found" }, 404);
    orders[idx] = { ...orders[idx], ...body };
    await kv.set("crm_orders", orders);
    return c.json(orders[idx]);
  } catch (error) {
    console.log(`Error updating order: ${error}`);
    return c.json({ error: `Failed to update order: ${error}` }, 500);
  }
});

// ============================================================
// WORKSHOPS CRUD
// ============================================================
app.get(`${BASE}/workshops`, async (c) => {
  try {
    const workshops = (await kv.get("crm_workshops")) || [];
    return c.json(workshops);
  } catch (error) {
    console.log(`Error fetching workshops: ${error}`);
    return c.json({ error: `Failed to fetch workshops: ${error}` }, 500);
  }
});

app.post(`${BASE}/workshops`, async (c) => {
  try {
    const body = await c.req.json();
    const workshops = (await kv.get("crm_workshops")) || [];
    const newWorkshop = { ...body, id: Date.now() };
    workshops.push(newWorkshop);
    await kv.set("crm_workshops", workshops);
    await addNotification("New Workshop Created", `"${body.title || body.name || "Workshop"}" has been scheduled`, "workshop");
    return c.json(newWorkshop, 201);
  } catch (error) {
    console.log(`Error creating workshop: ${error}`);
    return c.json({ error: `Failed to create workshop: ${error}` }, 500);
  }
});

app.put(`${BASE}/workshops/:id`, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const workshops = (await kv.get("crm_workshops")) || [];
    const idx = workshops.findIndex((w: any) => w.id === id);
    if (idx === -1) return c.json({ error: "Workshop not found" }, 404);
    workshops[idx] = { ...workshops[idx], ...body };
    await kv.set("crm_workshops", workshops);
    return c.json(workshops[idx]);
  } catch (error) {
    console.log(`Error updating workshop: ${error}`);
    return c.json({ error: `Failed to update workshop: ${error}` }, 500);
  }
});

// ============================================================
// WORKSHOP REGISTRATIONS
// ============================================================
app.get(`${BASE}/workshops/:workshopId/registrations`, async (c) => {
  try {
    const workshopId = c.req.param("workshopId");
    const registrations = (await kv.get(`crm_workshop_reg_${workshopId}`)) || [];
    return c.json(registrations);
  } catch (error) {
    console.log(`Error fetching workshop registrations: ${error}`);
    return c.json({ error: `Failed to fetch registrations: ${error}` }, 500);
  }
});

app.put(`${BASE}/workshops/:workshopId/registrations/:customerId`, async (c) => {
  try {
    const workshopId = c.req.param("workshopId");
    const customerId = Number(c.req.param("customerId"));
    const registrations = (await kv.get(`crm_workshop_reg_${workshopId}`)) || [];
    const idx = registrations.findIndex((r: any) => r.id === customerId);
    if (idx === -1) return c.json({ error: "Customer not found in registrations" }, 404);
    registrations[idx] = { ...registrations[idx], registered: true };
    await kv.set(`crm_workshop_reg_${workshopId}`, registrations);
    await addNotification("Workshop Registration", `${registrations[idx].name || "A customer"} registered for a workshop`, "workshop");
    return c.json(registrations[idx]);
  } catch (error) {
    console.log(`Error registering customer for workshop: ${error}`);
    return c.json({ error: `Failed to register customer: ${error}` }, 500);
  }
});

// ============================================================
// INVENTORY CRUD
// ============================================================
app.get(`${BASE}/inventory`, async (c) => {
  try {
    const items = (await kv.get("crm_inventory")) || [];
    return c.json(items);
  } catch (error) {
    console.log(`Error fetching inventory: ${error}`);
    return c.json({ error: `Failed to fetch inventory: ${error}` }, 500);
  }
});

app.post(`${BASE}/inventory`, async (c) => {
  try {
    const body = await c.req.json();
    const items = (await kv.get("crm_inventory")) || [];
    const newItem = { ...body, id: Date.now() };
    items.push(newItem);
    await kv.set("crm_inventory", items);
    if (Number(body.stock) <= 10) {
      await addNotification("Low Stock Alert", `${body.name} was added with only ${body.stock} units in stock`, "inventory");
    }
    return c.json(newItem, 201);
  } catch (error) {
    console.log(`Error creating inventory item: ${error}`);
    return c.json({ error: `Failed to create inventory item: ${error}` }, 500);
  }
});

app.put(`${BASE}/inventory/:id`, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const items = (await kv.get("crm_inventory")) || [];
    const idx = items.findIndex((item: any) => item.id === id);
    if (idx === -1) return c.json({ error: "Item not found" }, 404);
    items[idx] = { ...items[idx], ...body };
    await kv.set("crm_inventory", items);
    if (Number(items[idx].stock) <= 10) {
      await addNotification("Low Stock Alert", `${items[idx].name} inventory is at ${items[idx].stock} units. Restock recommended.`, "inventory");
    }
    return c.json(items[idx]);
  } catch (error) {
    console.log(`Error updating inventory item: ${error}`);
    return c.json({ error: `Failed to update inventory item: ${error}` }, 500);
  }
});

app.delete(`${BASE}/inventory/:id`, async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const items = (await kv.get("crm_inventory")) || [];
    const filtered = items.filter((item: any) => item.id !== id);
    await kv.set("crm_inventory", filtered);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting inventory item: ${error}`);
    return c.json({ error: `Failed to delete inventory item: ${error}` }, 500);
  }
});

// ============================================================
// DELIVERIES CRUD
// ============================================================
app.get(`${BASE}/deliveries`, async (c) => {
  try {
    const deliveries = (await kv.get("crm_deliveries")) || [];
    return c.json(deliveries);
  } catch (error) {
    console.log(`Error fetching deliveries: ${error}`);
    return c.json({ error: `Failed to fetch deliveries: ${error}` }, 500);
  }
});

app.put(`${BASE}/deliveries/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const deliveries = (await kv.get("crm_deliveries")) || [];
    const idx = deliveries.findIndex((d: any) => d.id === id);
    if (idx === -1) return c.json({ error: "Delivery not found" }, 404);
    deliveries[idx] = { ...deliveries[idx], ...body };
    await kv.set("crm_deliveries", deliveries);
    return c.json(deliveries[idx]);
  } catch (error) {
    console.log(`Error updating delivery: ${error}`);
    return c.json({ error: `Failed to update delivery: ${error}` }, 500);
  }
});

app.post(`${BASE}/deliveries`, async (c) => {
  try {
    const body = await c.req.json();
    const deliveries = (await kv.get("crm_deliveries")) || [];
    const delNum = String(deliveries.length + 1).padStart(3, "0");
    const newDelivery = { ...body, id: `DEL-${delNum}` };
    deliveries.push(newDelivery);
    await kv.set("crm_deliveries", deliveries);
    await addNotification("New Delivery Scheduled", `Delivery ${newDelivery.id} for ${body.customer || "a customer"} has been created`, "order");
    return c.json(newDelivery, 201);
  } catch (error) {
    console.log(`Error creating delivery: ${error}`);
    return c.json({ error: `Failed to create delivery: ${error}` }, 500);
  }
});

// ============================================================
// POS PRODUCTS - reads from inventory (single source of truth)
// ============================================================
app.get(`${BASE}/products`, async (c) => {
  try {
    const inventory: any[] = (await kv.get("crm_inventory")) || [];
    // Transform inventory items into POS product format
    // Only include items that are in stock (stock > 0)
    const products = inventory
      .filter((item: any) => item.stock > 0)
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        // Extract numeric price from string like "P60/stem", "P150", "₱200/bundle"
        price: Number(String(item.price).replace(/[^0-9.]/g, "")) || 0,
        image: item.image || "",
        category: item.category || "Flowers",
        stock: item.stock,
      }));
    return c.json(products);
  } catch (error) {
    console.log(`Error fetching products from inventory: ${error}`);
    return c.json({ error: `Failed to fetch products: ${error}` }, 500);
  }
});

// Remove separate product CRUD - POS now uses inventory directly
// Products are managed through the Inventory page

// ============================================================
// POS SALE - deduct inventory stock after a sale
// ============================================================
app.post(`${BASE}/pos/sale`, async (c) => {
  try {
    const body = await c.req.json();
    const { cartItems } = body;
    // cartItems: [{ id: number, qty: number }, ...]
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.log(`POS Sale: Rejected - invalid cartItems. Received body:`, JSON.stringify(body));
      return c.json({ error: "Cart items are required." }, 400);
    }

    console.log(`POS Sale: Processing ${cartItems.length} cart items:`, JSON.stringify(cartItems));

    const items: any[] = (await kv.get("crm_inventory")) || [];
    console.log(`POS Sale: Loaded ${items.length} inventory items from KV. IDs: ${items.map((i: any) => `${i.id}(${typeof i.id})`).join(', ')}`);
    const lowStockAlerts: string[] = [];
    const deductions: any[] = [];
    const notFound: any[] = [];

    for (const cartItem of cartItems) {
      // Try both strict and loose ID matching to handle type mismatches
      let idx = items.findIndex((item: any) => item.id === cartItem.id);
      if (idx === -1) {
        idx = items.findIndex((item: any) => String(item.id) === String(cartItem.id));
        if (idx !== -1) {
          console.log(`POS Sale: ID type mismatch fixed for item ${cartItem.id} (inventory type: ${typeof items[idx].id}, cart type: ${typeof cartItem.id})`);
        }
      }
      if (idx !== -1) {
        const oldStock = Number(items[idx].stock);
        const deductQty = Number(cartItem.qty);
        items[idx].stock = Math.max(0, oldStock - deductQty);
        deductions.push({ name: items[idx].name, id: items[idx].id, oldStock, newStock: items[idx].stock, qty: deductQty });
        // Update status based on new stock level
        if (items[idx].stock === 0) {
          items[idx].status = "Out of Stock";
        } else if (items[idx].stock <= 15) {
          items[idx].status = "Low Stock";
          lowStockAlerts.push(`${items[idx].name} is now at ${items[idx].stock} units`);
        } else {
          items[idx].status = "In Stock";
        }
      } else {
        notFound.push({ id: cartItem.id, type: typeof cartItem.id });
        console.log(`POS Sale: WARNING - Cart item ID ${cartItem.id} (type: ${typeof cartItem.id}) not found in inventory.`);
      }
    }

    console.log(`POS Sale: Saving updated inventory. Deductions: ${JSON.stringify(deductions)}, Not found: ${JSON.stringify(notFound)}`);
    await kv.set("crm_inventory", items);
    console.log(`POS Sale: Inventory saved successfully.`);

    // Send low stock notifications
    for (const alert of lowStockAlerts) {
      await addNotification("Low Stock Alert", `${alert}. Restock recommended.`, "inventory");
    }

    return c.json({ success: true, message: "Inventory stock updated after sale.", deductions, notFound });
  } catch (error) {
    console.log(`Error deducting inventory stock after POS sale: ${error}`);
    return c.json({ error: `Failed to deduct stock: ${error}` }, 500);
  }
});

// ============================================================
// IMAGE UPLOAD
// ============================================================
app.post(`${BASE}/upload`, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" }, 400);
    }

    // Validate file size (max 100KB)
    if (file.size > 100 * 1024) {
      return c.json({ error: "File too large. Maximum size: 100KB" }, 400);
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `inventory/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.log(`Storage upload error: ${uploadError.message}`);
      return c.json({ error: `Upload failed: ${uploadError.message}` }, 500);
    }

    // Create a signed URL (valid for 1 year)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);

    if (signedError) {
      console.log(`Signed URL error: ${signedError.message}`);
      return c.json({ error: `Failed to create signed URL: ${signedError.message}` }, 500);
    }

    return c.json({ url: signedData.signedUrl, fileName });
  } catch (error) {
    console.log(`Error uploading image: ${error}`);
    return c.json({ error: `Failed to upload image: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);