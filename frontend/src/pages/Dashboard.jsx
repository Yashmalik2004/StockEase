import { useEffect, useState } from 'react'
import {
  Package,
  Archive,
  AlertTriangle,
  XCircle,
  DollarSign,
  Loader2,
} from 'lucide-react'
import api from '../api/axios'
import StatsCard from '../components/StatsCard'

function StatusBadge({ status }) {
  const styles = {
    'In Stock': 'bg-green-100 text-green-700',
    'Low Stock': 'bg-yellow-100 text-yellow-700',
    'Out of Stock': 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/dashboard/stats')
        setStats(data.stats || data)
      } catch (err) {
        setError('Failed to load dashboard data.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        {error}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: 'text-indigo-600',
    },
    {
      title: 'Total Stock',
      value: stats?.totalQuantity ?? 0,
      icon: Archive,
      color: 'text-blue-600',
    },
    {
      title: 'Low Stock',
      value: stats?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-600',
    },
    {
      title: 'Out of Stock',
      value: stats?.outOfStockCount ?? 0,
      icon: XCircle,
      color: 'text-red-600',
    },
    {
      title: 'Total Inventory Value',
      value: `₹${Number(stats?.totalValue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-600',
    },
  ]

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Recent Products</h2>
          <p className="text-sm text-gray-500">Last 5 added products</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(stats?.recentProducts || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                    No products yet.
                  </td>
                </tr>
              ) : (
                (stats?.recentProducts || []).map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-800">{p.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{p.category}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{p.quantity}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={p.stockStatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

