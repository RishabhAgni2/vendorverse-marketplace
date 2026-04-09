import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Button } from '../components/Button'

export function AdminPanel() {
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [pRes, aRes, sRes] = await Promise.all([
        api.get('/api/admin/vendors', { params: { status: 'pending' } }),
        api.get('/api/admin/vendors', { params: { status: 'approved' } }),
        api.get('/api/admin/stats/revenue', { params: { days: 30 } }),
      ])
      setPending(pRes.data.vendors || [])
      setApproved(aRes.data.vendors || [])
      setStats(sRes.data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load admin panel')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function setApproval(vendorId, isApproved) {
    await api.patch(`/api/admin/vendors/${vendorId}/approval`, { isApproved })
    await load()
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black">Admin Panel</div>
            <div className="mt-1 text-sm text-white/60">Moderate vendors and view revenue analytics.</div>
          </div>
          <Button variant="secondary" onClick={load}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-white/70">Loading…</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
              <div className="text-sm font-black">Pending vendors</div>
              <div className="mt-4 space-y-3">
                {pending.length === 0 ? (
                  <div className="text-sm text-white/60">No pending vendors.</div>
                ) : (
                  pending.map((v) => (
                    <div key={v._id} className="rounded-2xl border border-[var(--color-border)] bg-black/20 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-extrabold">{v.storeName}</div>
                          <div className="truncate text-xs text-white/60">{v.user?.email || ''}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => setApproval(v._id, true)}>Approve</Button>
                          <Button variant="secondary" onClick={() => setApproval(v._id, false)}>
                            Keep pending
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
              <div className="text-sm font-black">Approved vendors</div>
              <div className="mt-4 space-y-3">
                {approved.length === 0 ? (
                  <div className="text-sm text-white/60">No approved vendors yet.</div>
                ) : (
                  approved.slice(0, 12).map((v) => (
                    <div key={v._id} className="rounded-2xl border border-[var(--color-border)] bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-extrabold">{v.storeName}</div>
                          <div className="truncate text-xs text-white/60">{v.user?.email || ''}</div>
                        </div>
                        <Button variant="danger" onClick={() => setApproval(v._id, false)}>
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="h-fit rounded-3xl border border-[var(--color-border)] bg-white/5 p-5">
            <div className="text-sm font-black">Revenue (last {stats?.days ?? 30} days)</div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              {[
                ['Orders', stats?.totals?.orders ?? 0],
                ['Gross sales', `$${Number(stats?.totals?.grossSales ?? 0).toFixed(2)}`],
                ['Commission', `$${Number(stats?.totals?.commission ?? 0).toFixed(2)}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[var(--color-border)] bg-black/20 p-4">
                  <div className="text-xs font-bold text-white/60">{label}</div>
                  <div className="mt-1 text-xl font-black">{value}</div>
                </div>
              ))}
              <div className="rounded-2xl border border-[var(--color-border)] bg-black/20 p-4 text-xs text-white/60">
                Bonus: replace this with charts (daily series) + top vendors/products.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

