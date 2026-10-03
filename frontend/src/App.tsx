import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { ShopProvider } from "./context/ShopContext";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollManager from "./components/ScrollManager";
import VisitTracker from "./components/VisitTracker";
import Products from "./pages/client/Products";
import ProductDetail from "./pages/client/ProductDetail";
import AuthLayout from "./components/auth/AuthLayout";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import Home from "./pages/client/Home";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminComingSoon from "./pages/admin/AdminComingSoon";
import AdminShell from "./admin/components/layout/AdminShell";

const AUTH_PATHS = ["/login", "/register", "/verify-email", "/forgot-password", "/reset-code", "/reset-password"];

// La navbar et le footer publics n'apparaissent ni dans l'administration ni sur les pages de connexion
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return pathname.startsWith("/admin") || AUTH_PATHS.includes(pathname) ? null : <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      {/* reducedMotion="user" : respecte le réglage « réduire les animations » du système */}
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <ShopProvider>
            <ScrollManager />
            <PublicOnly>
              <VisitTracker />
              <Navbar />
            </PublicOnly>
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/produits" element={<Products />} />
                <Route path="/produits/:id" element={<ProductDetail />} />
                {/* Authentification : image à gauche, formulaire à droite */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<SignIn />} />
                  <Route path="/register" element={<SignUp />} />
                  <Route path="/verify-email" element={<VerifyOTP mode="email" />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-code" element={<VerifyOTP mode="reset" />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>
                {/* Administration : la structure (barre latérale, en-tête) reste montée entre les pages */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminShell />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="homepage" element={<AdminHomepage />} />
                  <Route path="promotions" element={<AdminComingSoon />} />
                  <Route path="reviews" element={<AdminComingSoon />} />
                  <Route path="settings" element={<AdminComingSoon />} />
                  <Route path="*" element={<AdminDashboard />} />
                </Route>
              </Routes>
            </main>
            <PublicOnly>
              <Footer />
            </PublicOnly>
          </ShopProvider>
        </AuthProvider>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;
