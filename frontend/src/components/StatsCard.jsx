const bgMap = {
  'text-indigo-600': 'bg-indigo-100',
  'text-blue-600':   'bg-blue-100',
  'text-yellow-600': 'bg-yellow-100',
  'text-red-600':    'bg-red-100',
  'text-green-600':  'bg-green-100',
}

export default function StatsCard({ title, value, icon: Icon, color }) {
  const bg = bgMap[color] || 'bg-gray-100'
  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
      <div className={`p-3 rounded-full ${bg} flex-shrink-0`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  )
}
