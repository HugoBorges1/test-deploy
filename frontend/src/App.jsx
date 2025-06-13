import { Navigate, Route, Routes, useLocation } from "react-router-dom"; // 1. Importe o useLocation

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import MyOrdersPage from "./pages/MyOrdersPage.jsx"; // NOVO
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AnimatedBackground from "./components/AnimatedBackground";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();
  const location = useLocation();
  const noBackgroundRoutes = ['/login', '/signup', '/secret-dashboard', '/purchase-cancel'];
  const showAnimatedBackground = !noBackgroundRoutes.includes(location.pathname);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    getCartItems();
  }, [getCartItems, user]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className='flex flex-col min-h-screen bg-black text-white relative overflow-hidden'>
      
      {/* --- INÍCIO DA ALTERAÇÃO --- */}
      {showAnimatedBackground && <AnimatedBackground />}
      {/* --- FIM DA ALTERAÇÃO --- */}

      <header className='relative z-50'>
        <Navbar />
      </header>

      <main className='flex-grow relative z-10 pt-16'>
        <Routes>
          {/* ... o resto das suas rotas ... */}
          <Route path='/' element={<HomePage />} />
          <Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
          <Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
          <Route path='/secret-dashboard' element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path='/category/:category' element={<CategoryPage />} />
          <Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />
          <Route path='/my-orders' element={user ? <MyOrdersPage /> : <Navigate to='/login' />} />
          <Route path='/purchase-success' element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' />} />
          <Route path='/purchase-cancel' element={user ? <PurchaseCancelPage /> : <Navigate to='/login' />} />
        </Routes>
      </main>

      <footer className="relative z-50">
        <Footer />
      </footer>

      <Toaster />
    </div>
  );
}

export default App;