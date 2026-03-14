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
import RouteError from "./components/RouteError";

// Detect base path from Vite's import.meta.env.BASE_URL (set by `base` in vite.config.ts)
const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';

export const router = createBrowserRouter([
  { path: "/login", Component: Login, ErrorBoundary: RouteError },
  { path: "/signup", Component: SignUp, ErrorBoundary: RouteError },
  {
    path: "/",
    Component: Layout,
    ErrorBoundary: RouteError,
    children: [
      { index: true, Component: Dashboard },
      { path: "sales", Component: SalesOrders },
      { path: "pos", Component: PointOfSale },
      { path: "customers", Component: Customers },
      { path: "workshops", Component: Workshops },
      { path: "workshops/:id/register", Component: WorkshopRegister },
      { path: "inventory", Component: Inventory },
      { path: "deliveries", Component: Deliveries },
      { path: "*", Component: Dashboard },
    ],
  },
], { basename });