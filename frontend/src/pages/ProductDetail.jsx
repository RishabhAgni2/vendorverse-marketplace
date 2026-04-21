import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ShoppingCart } from 'lucide-react'
import { api } from '../lib/api'
import { useCart } from '../context/useCart'
import { Button } from '../components/Button'
import { useAuth } from '../context/useAuth'

export function ProductDetail() {
  const { id } = useParams()
  const { addItem } = useCart()
  const { user, vendor } = useAuth()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [pRes, rRes] = await Promise.all([
          api.get(`/api/products/${id}`),
          api.get(`/api/reviews/product/${id}`),
        ])
        if (!alive) return
        setProduct(pRes.data.product)
        setReviews(rRes.data.reviews || [])
      } catch (e) {
        if (!alive) return
        setError(e?.response?.data?.message || 'Failed to load product')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [id])

  if (loading) return <div className="text-sm text-white/70">Loading…</div>
  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
        <Link to="/" className="text-sm font-semibold text-white/70 hover:text-white">
          ← Back to shop
        </Link>
      </div>
    )
  }
  if (!product) return null

  const src = product.images?.[0] || '/placeholder.svg'

  const isOwnVendorProduct =
    user?.role === 'vendor' && vendor?.id && product.vendor?._id && String(vendor.id) === String(product.vendor._id)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white/5"
        >
          <div className="aspect-[4/3] bg-black/20">
            <img
              src={src}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg'
              }}
            />
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
            <div className="text-2xl font-black tracking-tight">{product.name}</div>
            <div className="mt-1 text-sm text-white/60">
              Sold by <span className="font-bold text-white/80">{product.vendor?.storeName || 'Vendor'}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="text-2xl font-black">${Number(product.price).toFixed(2)}</div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{product.category}</div>
              <div className="inline-flex items-center gap-2 text-xs text-white/70">
                <Star className="h-4 w-4 text-yellow-300" />
                {Number(product.ratingAvg || 0).toFixed(1)} ({product.ratingCount || 0})
              </div>
            </div>

            <div className="mt-4 text-sm text-white/70">{product.description || 'No description.'}</div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  if (isOwnVendorProduct) return
                  addItem(product, 1)
                }}
                disabled={product.stock <= 0 || isOwnVendorProduct}
                className="w-full sm:w-auto"
              >
                <ShoppingCart className="h-4 w-4" />{' '}
                {isOwnVendorProduct ? "You can't buy your own item" : 'Add to cart'}
              </Button>
              <Link to="/cart" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Go to cart
                </Button>
              </Link>
              <div className="ml-auto text-xs text-white/60">Stock: {product.stock}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
            <div className="text-sm font-black">Recent reviews</div>
            <div className="mt-3 space-y-3">
              {reviews.length === 0 ? (
                <div className="text-sm text-white/60">No reviews yet.</div>
              ) : (
                reviews.slice(0, 6).map((r) => (
                  <div key={r._id} className="rounded-2xl border border-[var(--color-border)] bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-bold">{r.buyer?.name || 'Buyer'}</div>
                      <div className="text-xs text-white/70">★ {r.rating}</div>
                    </div>
                    {r.comment ? <div className="mt-2 text-sm text-white/70">{r.comment}</div> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

