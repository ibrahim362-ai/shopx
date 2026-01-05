import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, 
  MessageSquare, 
  TrendingUp, 
  Users,
  Eye,
  Plus,
  ShoppingCart,
  DollarSign
} from 'lucide-react'
import axios from 'axios'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalMessages: 0,
    unreadMessages: 0
  })
  const [recentProducts, setRecentProducts] = useState([])
  const [recentMessages, setRecentMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [productsRes, messagesRes] = await Promise.all([
        axios.get('/api/products/admin/all?limit=5'),
        axios.get('/api/messages?limit=5')
      ])

      setRecentProducts(productsRes.data.products)
      setRecentMessages(messagesRes.data.messages)
      
      setStats({
        totalProducts: productsRes.data.pagination.total,
        totalMessages: messagesRes.data.pagination.total,
        unreadMessages: messagesRes.data.messages.filter(m => !m.isRead).length
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/products'
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: MessageSquare,
      color: 'bg-green-500',
      link: '/admin/messages'
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: 'bg-red-500',
      link: '/admin/messages'
    },
    {
      title: 'Revenue',
      value: '$12,345',
      icon: DollarSign,
      color: 'bg-purple-500',
      link: '#'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-primary-100">Manage your store, products, and customer messages from here.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
              <Link
                to="/admin/products"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                View all
                <Plus className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products yet</p>
                <Link
                  to="/admin/products"
                  className="btn-primary mt-4 inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Product
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                    <img
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${product.price} • Stock: {product.stock}
                      </p>
                    </div>
                    <Link
                      to={`/products/${product.id}`}
                      className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
              <Link
                to="/admin/messages"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div key={message.id} className="border-l-4 border-primary-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {message.name}
                      </p>
                      {!message.isRead && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {message.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/products"
            className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
          >
            <Package className="h-8 w-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-gray-900 mb-2">Manage Products</h3>
            <p className="text-sm text-gray-600">Add, edit, or remove products from your store</p>
          </Link>
          
          <Link
            to="/admin/messages"
            className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
          >
            <MessageSquare className="h-8 w-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-gray-900 mb-2">Customer Messages</h3>
            <p className="text-sm text-gray-600">View and respond to customer inquiries</p>
          </Link>
          
          <Link
            to="/admin/settings"
            className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
          >
            <TrendingUp className="h-8 w-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-gray-900 mb-2">Store Settings</h3>
            <p className="text-sm text-gray-600">Configure your store settings and preferences</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard