import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import MesPlats from "./pages/MesPlats";
import Programmation from "./pages/Programmation";
import ListeDeCourses from "./pages/ListeDeCourses";
import Marches from "./pages/Marches";

// Import styles
import './styles/globals.css';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Setup route - requires auth but not completion */}
              <Route 
                path="/setup" 
                element={

                    <Setup />

                } 
              />

              {/* Client routes - requires completed setup */}
              <Route 
                path="/dashboard" 
                element={
                  
                    <Dashboard />

                } 
              />

              <Route 
                path="/mes-plats" 
                element={

                    <MesPlats />
    
                } 
              />

              <Route 
                path="/programmation" 
                element={
      
                    <Programmation />

                } 
              />

              <Route 
                path="/liste-de-courses" 
                element={
     
                    <ListeDeCourses />

                } 
              />

              <Route 
                path="/marches" 
                element={

                    <Marches />

                } 
              />

              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={

                    <AdminDashboard />

                } 
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
