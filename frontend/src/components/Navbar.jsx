import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/products/add': 'Add Product',
}

export default function Navbar() {
  const { pathname } = useLocation()

  // Handle dynamic edit route
  const title =
    pathname.startsWith('/products/edit/')
      ? 'Edit Product'
      : pageTitles[pathname] || 'StockEase'

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
    </header>
  )
}

