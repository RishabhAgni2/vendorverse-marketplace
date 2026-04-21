import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { Button } from '../components/Button'
import { useAuth } from '../context/useAuth'

function TabButton({ active, children, ...props }) {
  return (
    <button
      className={`rounded-xl px-3 py-2 text-sm font-black transition ${
        active ? 'bg-white/10' : 'hover:bg-white/10 text-white/70'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}

export function VendorDashboard() {
  const { vendor, refresh } = useAuth()
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const canSell = Boolean(vendor?.isApproved)

  const emptyProduct = useMemo(
    () => ({ name: '', price: 0, stock: 0, category: 'General', description: '', images: [''] }),
    [],
  )
  const [draft, setDraft] = useState(emptyProduct)

  async function loadAll() {
    setLoading(true)
    setError('')
    try {
      const [pRes, oRes, sRes] = await Promise.all([
        api.get('/api/vendor/products'),
        api.get('/api/vendor/orders'),
        api.get('/api/vendor/stats'),
      ])
      setProducts(pRes.data.products || [])
      setOrders(oRes.data.orders || [])
      setStats(sRes.data.stats || null)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load vendor dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function createProduct() {
    if (!canSell) return
    const payload = {
      ...draft,
      price: Number(draft.price),
      stock: Number(draft.stock),
      images: (draft.images || []).map((x) => String(x).trim()).filter(Boolean),
    }
    const { data } = await api.post('/api/vendor/products', payload)
    setProducts((prev) => [data.product, ...prev])
    setDraft(emptyProduct)
  }

  async function deleteProduct(id) {
    await api.delete(`/api/vendor/products/${id}`)
    setProducts((prev) => prev.filter((p) => p._id !== id))
  }

  async function updateProfile() {
    await refresh()
    await loadAll()
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-black">Vendor Dashboard</div>
            <div className="mt-1 text-sm text-white/60">
              Manage products, view orders, and track sales analytics.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={updateProfile}>
              Refresh
            </Button>
          </div>
        </div>
        {!canSell ? (
          <div className="mt-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
            Your vendor account is <b>pending approval</b>. An admin must approve you before you can create products.
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TabButton active={tab === 'products'} onClick={() => setTab('products')}>
          Products
        </TabButton>
        <TabButton active={tab === 'orders'} onClick={() => setTab('orders')}>
          Orders
        </TabButton>
        <TabButton active={tab === 'analytics'} onClick={() => setTab('analytics')}>
          Analytics
        </TabButton>
      </div>

      {loading ? (
        <div className="text-sm text-white/70">Loading…</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
      ) : tab === 'products' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
            <div className="text-sm font-black">My products</div>
            <div className="mt-4 space-y-3">
              {products.length === 0 ? (
                <div className="text-sm text-white/60">No products yet.</div>
              ) : (
                products.map((p) => (
                  <div
                    key={p._id}
                    className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-black/20 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold">{p.name}</div>
                      <div className="text-xs text-white/60">
                        ${Number(p.price).toFixed(2)} • Stock {p.stock} • {p.category} •{' '}
                        {p.isActive ? 'Active' : 'Hidden'}
                      </div>
                    </div>
                    <div className="sm:ml-auto flex items-center gap-2">
                      <Button variant="danger" onClick={() => deleteProduct(p._id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="h-fit rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
            <div className="text-sm font-black">Add new product</div>
            <div className="mt-3 space-y-2">
              {[
                ['name', 'Name'],
                ['category', 'Category'],
                ['price', 'Price'],
                ['stock', 'Stock'],
              ].map(([k, label]) => (
                <label key={k} className="block space-y-1">
                  <div className="text-xs font-bold text-white/70">{label}</div>
                  <input
                    value={draft[k]}
                    onChange={(e) => setDraft((p) => ({ ...p, [k]: e.target.value }))}
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none"
                    disabled={!canSell}
                  />
                </label>
              ))}
              <label className="block space-y-1">
                <div className="text-xs font-bold text-white/70">Description</div>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                  className="min-h-24 w-full rounded-2xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none"
                  disabled={!canSell}
                />
              </label>
              <label className="block space-y-1">
                <div className="text-xs font-bold text-white/70">Image URL (optional)</div>
                <input
                  value={draft.images?.[0] || ''}
                  onChange={(e) => setDraft((p) => ({ ...p, images: [e.target.value] }))}
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none"
                  disabled={!canSell}
                />
              </label>
              <Button onClick={createProduct} disabled={!canSell || !draft.name}>
                Create product
              </Button>
              {!canSell ? (
                <div className="text-xs text-white/50">
                  Waiting for admin approval. Ask admin to approve you in the Admin panel.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : tab === 'orders' ? (
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
          <div className="text-sm font-black">Orders containing your products</div>
          <div className="mt-4 space-y-3">
            {orders.length === 0 ? (
              <div className="text-sm text-white/60">No orders yet.</div>
            ) : (
              orders.map((o) => (
                <div key={o._id} className="rounded-2xl border border-[var(--color-border)] bg-black/20 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-extrabold">Order #{o._id.slice(-6).toUpperCase()}</div>
                      <div className="text-xs text-white/60">{o.buyer?.email || ''}</div>
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{o.status}</div>
                  </div>
                  <div className="mt-2 text-xs text-white/60">Items: {o.items?.length || 0}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ['Orders', stats?.ordersCount ?? 0],
            ['Items sold', stats?.itemsSold ?? 0],
            ['Gross sales', `$${Number(stats?.grossSales ?? 0).toFixed(2)}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
              <div className="text-xs font-bold text-white/60">{label}</div>
              <div className="mt-1 text-2xl font-black">{value}</div>
            </div>
          ))}
          <div className="md:col-span-3 rounded-3xl border border-[var(--color-border)] bg-white/5 p-5 text-sm text-white/60">
            This is a basic analytics view. Bonus ideas: charts, top products, time series, conversion funnels.
          </div>
        </div>
      )}
    </div>
  )
}

