import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { RequireRole } from './components/RequireRole'
import { Home } from './pages/Home'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { BuyerOrders } from './pages/BuyerOrders'
import { VendorDashboard } from './pages/VendorDashboard'
import { AdminPanel } from './pages/AdminPanel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          <Route element={<RequireRole role="buyer" />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<BuyerOrders />} />
          </Route>

          <Route element={<RequireRole role="vendor" />}>
            <Route path="vendor" element={<VendorDashboard />} />
          </Route>

          <Route element={<RequireRole role="admin" />}>
            <Route path="admin" element={<AdminPanel />} />
          </Route>

          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
