import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function ProductCard({ p }) {
  const src = p.images?.[0] || '/placeholder.svg'
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="group rounded-2xl border border-[var(--color-border)] bg-white/5 p-4"
    >
      <Link to={`/product/${p._id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white/5">
          <img
            src={src}
            alt={p.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg'
            }}
          />
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold">{p.name}</div>
            <div className="truncate text-xs text-white/60">
              {p.vendor?.storeName ? `Sold by ${p.vendor.storeName}` : 'Marketplace'}
            </div>
          </div>
          <div className="shrink-0 text-sm font-black">${Number(p.price).toFixed(2)}</div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-white/60">
          <span className="rounded-full bg-white/10 px-2 py-1">{p.category}</span>
          <span>
            ★ {Number(p.ratingAvg || 0).toFixed(1)} ({p.ratingCount || 0})
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

