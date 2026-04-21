import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../context/useCart'
import { Button } from '../components/Button'

export function Cart() {
  const { items, subtotal, totalQty, removeItem, setQty, clear } = useCart()

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-black">Cart</div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                Clear cart
              </button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-sm text-white/60">
                Your cart is empty. <Link className="font-bold text-white/80 hover:text-white" to="/">Start shopping</Link>.
              </div>
            ) : (
              items.map((x) => (
                <motion.div
                  layout
                  key={x.productId}
                  className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-black/20 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl bg-white/5">
                      {x.image ? <img src={x.image} alt={x.name} className="h-full w-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold">{x.name}</div>
                      <div className="truncate text-xs text-white/60">{x.vendorName || ''}</div>
                    </div>
                  </div>

                  <div className="sm:ml-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white/5 px-2 py-1">
                      <button
                        className="h-8 w-8 rounded-lg hover:bg-white/10"
                        onClick={() => setQty(x.productId, x.qty - 1)}
                      >
                        −
                      </button>
                      <div className="w-8 text-center text-sm font-bold">{x.qty}</div>
                      <button
                        className="h-8 w-8 rounded-lg hover:bg-white/10"
                        onClick={() => setQty(x.productId, x.qty + 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-sm font-black">${(x.price * x.qty).toFixed(2)}</div>

                    <Button variant="ghost" className="px-3" onClick={() => removeItem(x.productId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="h-fit rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
        <div className="text-sm font-black">Summary</div>
        <div className="mt-3 space-y-2 text-sm text-white/70">
          <div className="flex items-center justify-between">
            <span>Items</span>
            <span className="font-black text-white">{totalQty}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-black text-white">${subtotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/checkout">
            <Button className="w-full" disabled={items.length === 0}>
              Checkout
            </Button>
          </Link>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-white/50">
          <span>Commission is calculated during checkout.</span>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold text-white/70 hover:bg-white/10"
            >
              Clear cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

