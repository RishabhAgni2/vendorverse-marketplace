import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useCart } from '../context/useCart'
import { Button } from '../components/Button'

export function Checkout() {
  const nav = useNavigate()
  const { items, subtotal, clear } = useCart()
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    country: '',
    postalCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setLoading(true)
    setError('')
    try {
      const payload = {
        items: items.map((x) => ({ productId: x.productId, qty: x.qty })),
        shippingAddress: form,
      }
      await api.post('/api/orders/checkout', payload)
      clear()
      nav('/orders')
    } catch (e) {
      setError(e?.response?.data?.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
        <div className="text-lg font-black">Checkout</div>
        <div className="mt-1 text-sm text-white/60">Enter shipping details, then place your order.</div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            ['fullName', 'Full name'],
            ['phone', 'Phone'],
            ['addressLine1', 'Address'],
            ['city', 'City'],
            ['country', 'Country'],
            ['postalCode', 'Postal code (optional)'],
          ].map(([k, label]) => (
            <label key={k} className={`space-y-1 ${k === 'addressLine1' ? 'sm:col-span-2' : ''}`}>
              <div className="text-xs font-bold text-white/70">{label}</div>
              <input
                value={form[k]}
                onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none placeholder:text-white/40"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button onClick={submit} disabled={loading || items.length === 0}>
            {loading ? 'Placing order…' : 'Place order'}
          </Button>
          <Link to="/cart" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              Back to cart
            </Button>
          </Link>
        </div>
      </div>

      <div className="h-fit rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
        <div className="text-sm font-black">Order summary</div>
        <div className="mt-3 space-y-2 text-sm text-white/70">
          <div className="flex items-center justify-between">
            <span>Items</span>
            <span className="font-black text-white">{items.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-black text-white">${subtotal.toFixed(2)}</span>
          </div>
          <div className="text-xs text-white/50">
            Commission is added by the backend (configurable via <code className="text-white/70">COMMISSION_RATE</code>).
          </div>
        </div>
      </div>
    </div>
  )
}

