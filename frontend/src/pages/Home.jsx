import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { api } from '../lib/api'
import { ProductCard } from '../components/ProductCard'
import { motion } from 'framer-motion'

export function Home() {
  const [products, setProducts] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return ['', ...Array.from(set).sort()]
  }, [products])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (q) params.q = q
      if (category) params.category = category
      const { data } = await api.get('/api/products', { params })
      setProducts(data.products || [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--color-border)] bg-white/5 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-black tracking-tight md:text-xl">Discover products from multiple vendors</div>
            <div className="mt-1 text-sm text-white/60">
              Responsive UI, smooth animations, and role-based dashboards.
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex w-full flex-col gap-2 sm:flex-row md:w-auto"
          >
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5">
              <Search className="h-4 w-4 text-white/60" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-2xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none"
            >
              {categories.map((c) => (
                <option key={c || '__all'} value={c}>
                  {c || 'All categories'}
                </option>
              ))}
            </select>
            <button
              onClick={load}
              className="rounded-2xl bg-[var(--color-brand)] px-5 py-2.5 text-sm font-black text-white hover:brightness-110"
            >
              Search
            </button>
          </motion.div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-white/70">Loading products…</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-white/5 p-6 text-sm text-white/70">
          No products found. Tip: register as a vendor, get approved by admin, then add products.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
        </div>
      )}
    </div>
  )
}

