import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Equipments from "./pages/Equipments";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Deposits from "./pages/Deposits";
import UsersPage from "./pages/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Shell = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute><DashboardLayout>{children}</DashboardLayout></ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Shell><Dashboard /></Shell>} />
            <Route path="/clients" element={<ProtectedRoute roles={["admin","employe"]}><DashboardLayout><Clients /></DashboardLayout></ProtectedRoute>} />
            <Route path="/equipments" element={<Shell><Equipments /></Shell>} />
            <Route path="/orders" element={<ProtectedRoute roles={["admin","employe","livreur"]}><DashboardLayout><Orders /></DashboardLayout></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute roles={["admin","caissier"]}><DashboardLayout><Payments /></DashboardLayout></ProtectedRoute>} />
            <Route path="/deposits" element={<ProtectedRoute roles={["admin","caissier","employe"]}><DashboardLayout><Deposits /></DashboardLayout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute roles={["admin"]}><DashboardLayout><UsersPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
