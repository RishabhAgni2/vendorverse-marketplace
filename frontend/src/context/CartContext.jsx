import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

function loadCart() {
  try {
    const raw = localStorage.getItem('cart')
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [lastAddedAt, setLastAddedAt] = useState(null)

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  function addItem(product, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((x) => x.productId === product._id)
      if (existing) {
        const next = prev.map((x) => (x.productId === product._id ? { ...x, qty: x.qty + qty } : x))
        localStorage.setItem('cart', JSON.stringify(next))
        setLastAddedAt(Date.now())
        return next
      }
      const next = [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || null,
          vendorName: product.vendor?.storeName,
          qty,
        },
      ]
      localStorage.setItem('cart', JSON.stringify(next))
      setLastAddedAt(Date.now())
      return next
    })
  }

  function removeItem(productId) {
    setItems((prev) => {
      const next = prev.filter((x) => x.productId !== productId)
      localStorage.setItem('cart', JSON.stringify(next))
      return next
    })
  }

  function setQty(productId, qty) {
    setItems((prev) => {
      const next = prev.map((x) => (x.productId === productId ? { ...x, qty: Math.max(1, qty) } : x))
      localStorage.setItem('cart', JSON.stringify(next))
      return next
    })
  }

  function clear() {
    setItems(() => {
      localStorage.setItem('cart', JSON.stringify([]))
      return []
    })
  }

  const subtotal = items.reduce((acc, x) => acc + x.price * x.qty, 0)
  const totalQty = items.reduce((acc, x) => acc + x.qty, 0)

  const value = useMemo(
    () => ({ items, subtotal, totalQty, lastAddedAt, addItem, removeItem, setQty, clear }),
    [items, subtotal, totalQty, lastAddedAt],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}

