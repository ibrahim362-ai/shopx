import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Package, AlertTriangle, TrendingUp } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import ProductForm from '../../components/admin/ProductForm'
import BulkActions, { BulkCheckbox } from '../../components/admin/BulkActions'
import AdvancedFilters from '../../components/admin/AdvancedFilters'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [filters, setFilters] = useState({})
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState({})
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [currentPage, filters, sortBy])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sort: sortBy,
        ...filters
      })

      const response = await axios.get(`/api/products/admin/all?${params}`)
      setProducts(response.data.products)
      setPagination(response.data.pagination)
      setStats(response.data.stats || {})
    } catch (error) {
      console.error('Error fetching products:', error)
      if (error.response?.status === 401) {
        toast.error('Please log in to access admin features')
        window.location.href = '/admin/login'
      } else {
        toast.error('Failed to load products')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories/admin/all')
      setCategories(response.data.categories || response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }
  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await axios.delete(`/api/products/${productId}`)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete product'
      toast.error(message)
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, formData)
        toast.success('Product updated successfully')
      } else {
        await axios.post('/api/products', formData)
        toast.success('Product created successfully')
      }
      setShowModal(false)
      setEditingProduct(null)
      fetchProducts()
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed'
      toast.error(message)
    }
  }

  const handleBulkAction = async (action, productIds) => {
    try {
      let endpoint = ''
      let data = { productIds }

      switch (action) {
        case 'activate':
          endpoint = '/api/products/bulk/update-status'
          data.status = 'ACTIVE'
          break
        case 'deactivate':
          endpoint = '/api/products/bulk/update-status'
          data.status = 'INACTIVE'
          break
        case 'delete':
          endpoint = '/api/products/bulk/delete'
          break
        default:
          throw new Error('Unknown action')
      }

      await axios.post(endpoint, data)
      toast.success(`Bulk ${action} completed successfully`)
      fetchProducts()
    } catch (error) {
      const message = error.response?.data?.message || `Bulk ${action} failed`
      toast.error(message)
    }
  }

  const getStatusBadge = (status, stock) => {
    if (status === 'DRAFT') {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Draft</span>
    }
    if (status === 'INACTIVE') {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Inactive</span>
    }
    if (stock === 0) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Out of Stock</span>
    }
    if (stock <= 5) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Low Stock</span>
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
  }

  const getStockIcon = (stock, lowStockAlert = 5) => {
    if (stock === 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    if (stock <= lowStockAlert) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
    return <Package className="h-4 w-4 text-green-500" />
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null)
            setShowModal(true)
          }}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.status === 'ACTIVE').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockCount || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outOfStockCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        categories={categories}
        type="products"
      />

      {/* Bulk Actions */}
      <BulkActions
        items={products}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        onBulkAction={handleBulkAction}
        actions={[
          { key: 'activate', label: 'Activate', icon: Eye, color: 'text-green-600' },
          { key: 'deactivate', label: 'Deactivate', icon: Eye, color: 'text-yellow-600' },
          { key: 'delete', label: 'Delete', icon: Trash2, color: 'text-red-600', confirm: true }
        ]}
      />

      {/* Sort Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="price_asc">Price Low-High</option>
            <option value="price_desc">Price High-Low</option>
            <option value="stock_asc">Stock Low-High</option>
            <option value="stock_desc">Stock High-Low</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {products.length} of {pagination.total || 0} products
        </div>
      </div>
      {/* Products Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BulkCheckbox
                    itemId="all"
                    selectedItems={selectedItems}
                    onSelectionChange={() => {
                      if (selectedItems.length === products.length) {
                        setSelectedItems([])
                      } else {
                        setSelectedItems(products.map(p => p.id))
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <BulkCheckbox
                      itemId={product.id}
                      selectedItems={selectedItems}
                      onSelectionChange={setSelectedItems}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.mainImage || product.images?.[0] || '/placeholder-product.png'}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = '/placeholder-product.png'
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                        {product.brand && (
                          <div className="text-xs text-gray-400">Brand: {product.brand}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category?.name}</div>
                    {product.category?.parent && (
                      <div className="text-xs text-gray-500">{product.category.parent.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.discountPrice && product.discountPrice < product.price ? (
                        <div>
                          <span className="line-through text-gray-500">${product.price}</span>
                          <span className="ml-2 text-red-600 font-medium">${product.discountPrice}</span>
                          <div className="text-xs text-green-600">
                            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% off
                          </div>
                        </div>
                      ) : (
                        <span>${product.price}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStockIcon(product.stock, product.lowStockAlert)}
                      <span className="text-sm text-gray-900">{product.stock}</span>
                    </div>
                    {product.stock <= (product.lowStockAlert || 5) && product.stock > 0 && (
                      <div className="text-xs text-yellow-600">Low stock alert</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product.status, product.stock)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product)
                          setShowModal(true)
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first product.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingProduct(null)
                  setShowModal(true)
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{pagination.pages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showModal && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowModal(false)
            setEditingProduct(null)
          }}
          loading={false}
        />
      )}
    </div>
  )
}

export default AdminProducts