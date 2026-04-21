import { motion } from 'framer-motion'

export function Button({ className = '', variant = 'primary', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-[var(--color-brand)] text-white hover:brightness-110',
    secondary: 'bg-white/10 text-white hover:bg-white/15 border border-[var(--color-border)]',
    ghost: 'bg-transparent text-white hover:bg-white/10',
    danger: 'bg-red-500/90 text-white hover:bg-red-500',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    />
  )
}

