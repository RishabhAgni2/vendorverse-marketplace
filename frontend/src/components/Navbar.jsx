import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, Store, Shield, LogOut } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { Button } from './Button'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-semibold transition ${
          isActive ? 'bg-white/10' : 'hover:bg-white/10'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export function Navbar() {
  const { user, vendor, logout } = useAuth()
  const { items, totalQty, lastAddedAt } = useCart()

  return (
    <div className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-black/10 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -8, scale: 0.95 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="h-9 w-9 rounded-xl bg-[var(--color-brand)]"
          />
          <div className="leading-tight">
            <div className="text-sm font-black tracking-wide">TradeHive</div>
            <div className="text-xs text-white/60">Multi-vendor marketplace</div>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavItem to="/">Shop</NavItem>
          {user?.role === 'buyer' && <NavItem to="/orders">My Orders</NavItem>}
          {user?.role === 'vendor' && (
            <NavItem to="/vendor">
              <span className="inline-flex items-center gap-2">
                <Store className="h-4 w-4" /> Vendor
              </span>
            </NavItem>
          )}
          {user?.role === 'admin' && (
            <NavItem to="/admin">
              <span className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4" /> Admin
              </span>
            </NavItem>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Link to="/cart">
              <motion.div
                key={totalQty}
                whileTap={{ scale: 0.9 }}
                animate={{ scale: totalQty > 0 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.25 }}
                className="relative rounded-xl p-2 hover:bg-white/10"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalQty > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-brand2)] px-1 text-[11px] font-black text-black">
                    {totalQty}
                  </span>
                )}
              </motion.div>
            </Link>
            <AnimatePresence>
              {lastAddedAt && (
                <motion.div
                  key={lastAddedAt}
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: -4, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                  className="pointer-events-none absolute -right-1 -top-1 h-6 w-6 rounded-full bg-[var(--color-brand)]/80"
                />
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <div className="text-xs font-bold">{user.name}</div>
                <div className="text-[11px] text-white/60">
                  {user.role === 'vendor'
                    ? vendor?.isApproved
                      ? 'Vendor (approved)'
                      : 'Vendor (pending)'
                    : user.role}
                </div>
              </div>
              <Button variant="secondary" onClick={logout} className="px-3">
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link to="/register" className="hidden sm:block">
                <Button>Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      {user?.role === 'vendor' && vendor && !vendor.isApproved && (
        <div className="border-t border-[var(--color-border)] bg-yellow-500/10 px-4 py-2 text-center text-xs text-yellow-100">
          Your vendor account is pending approval. You can edit your profile, but product selling is locked until an
          admin approves you.
        </div>
      )}
    </div>
  )
}

