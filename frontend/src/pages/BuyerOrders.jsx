import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export function BuyerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/orders')
        if (!alive) return
        setOrders(data.orders || [])
      } catch (e) {
        if (!alive) return
        setError(e?.response?.data?.message || 'Failed to load orders')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
        <div className="text-lg font-black">My Orders</div>
        <div className="mt-1 text-sm text-white/60">Orders created from checkout (stock is deducted on the backend).</div>
      </div>

      {loading ? (
        <div className="text-sm text-white/70">Loading…</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-white/5 p-6 text-sm text-white/60">
          No orders yet. <Link to="/" className="font-bold text-white/80 hover:text-white">Shop now</Link>.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="rounded-2xl border border-[var(--color-border)] bg-white/5 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-black">Order #{o._id.slice(-6).toUpperCase()}</div>
                  <div className="text-xs text-white/60">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{o.status}</div>
                  <div className="text-sm font-black">${Number(o.total).toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-white/60">
                Items: {o.items?.length || 0} • Subtotal: ${Number(o.subtotal).toFixed(2)} • Commission: $
                {Number(o.commissionAmount).toFixed(2)}
              </div>
              {o.items?.length ? (
                <div className="mt-3 space-y-1 rounded-2xl border border-[var(--color-border)] bg-black/15 p-3 text-xs text-white/80">
                  {o.items.map((it, idx) => (
                    <div key={`${it.product || idx}-${idx}`} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{it.name}</div>
                        <div className="truncate text-[11px] text-white/55">
                          Qty {it.qty} × ${Number(it.price).toFixed(2)}
                        </div>
                      </div>
                      <div className="shrink-0 text-[11px] font-bold text-white">
                        ${(it.lineTotal ?? it.price * it.qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

