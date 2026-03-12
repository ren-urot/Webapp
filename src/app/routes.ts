import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Workshops from "./pages/Workshops";
import WorkshopRegister from "./pages/WorkshopRegister";
import SalesOrders from "./pages/SalesOrders";
import PointOfSale from "./pages/PointOfSale";
import Inventory from "./pages/Inventory";
import Deliveries from "./pages/Deliveries";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Detect base path from Vite's import.meta.env.BASE_URL (set by `base` in vite.config.ts)
const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  { path: "/signup", Component: SignUp },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "sales", Component: SalesOrders },
      { path: "pos", Component: PointOfSale },
      { path: "customers", Component: Customers },
      { path: "workshops", Component: Workshops },
      { path: "workshops/:id/register", Component: WorkshopRegister },
      { path: "inventory", Component: Inventory },
      { path: "deliveries", Component: Deliveries },
    ],
  },
], { basename });