import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, Star, Heart, Eye, Sparkles, Gift, TrendingUp } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [searchParams, setSearchParams] = useSearchParams()

  const currentPage = parseInt(searchParams.get('page')) || 1
  const currentCategory = searchParams.get('category') || ''
  const currentSearch = searchParams.get('search') || ''
  const currentSort = searchParams.get('sort') || 'newest'

  // Mock luxury beauty products for demonstration
  const mockProducts = [
    {
      id: 1,
      name: "Chanel No. 5 Eau de Parfum",
      description: "The world's most iconic fragrance. A timeless floral aldehyde.",
      price: 150.00,
      discountPrice: 135.00,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop"],
      category: "Perfumes",
      rating: 4.9,
      reviews: 1250,
      badge: "Best Seller"
    },
    {
      id: 2,
      name: "Dior Sauvage Eau de Toilette",
      description: "A radically fresh composition. Calabrian bergamot and ambroxan.",
      price: 120.00,
      stock: 18,
      images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&h=500&fit=crop"],
      category: "Perfumes",
      rating: 4.8,
      reviews: 890,
      badge: "New"
    },
    {
      id: 3,
      name: "Tom Ford Black Orchid",
      description: "A luxurious and sensual fragrance of rich dark accords.",
      price: 180.00,
      discountPrice: 162.00,
      stock: 12,
      images: ["https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500&h=500&fit=crop"],
      category: "Perfumes",
      rating: 4.7,
      reviews: 654,
      badge: "Limited"
    },
    {
      id: 4,
      name: "Charlotte Tilbury Magic Foundation",
      description: "Full coverage foundation with a natural, radiant finish.",
      price: 44.00,
      stock: 35,
      images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop"],
      category: "Cosmetics",
      rating: 4.6,
      reviews: 432,
      badge: "Trending"
    },
    {
      id: 5,
      name: "La Mer Crème de la Mer",
      description: "The legendary moisturizing cream that transforms skin.",
      price: 190.00,
      stock: 8,
      images: ["https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&h=500&fit=crop"],
      category: "Skincare",
      rating: 4.8,
      reviews: 789,
      badge: "Luxury"
    },
    {
      id: 6,
      name: "Yves Saint Laurent Rouge Pur Couture",
      description: "The ultimate luxury lipstick with intense color payoff.",
      price: 38.00,
      discountPrice: 34.20,
      stock: 42,
      images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop"],
      category: "Cosmetics",
      rating: 4.7,
      reviews: 567,
      badge: "Best Seller"
    }
  ]

  const mockCategories = [
    { id: 1, name: "Perfumes", count: 45 },
    { id: 2, name: "Cosmetics", count: 38 },
    { id: 3, name: "Skincare", count: 29 },
    { id: 4, name: "Gift Sets", count: 16 }
  ]

  useEffect(() => {
    fetchProducts()
  }, [searchParams])

  useEffect(() => {
    fetchCategories()
    // Set SEO data
    document.title = 'Luxury Beauty Products - LuxeBeauty'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover our exquisite collection of luxury perfumes, cosmetics, and skincare products from the world\'s finest beauty brands.')
    }
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', currentPage)
      params.append('limit', '12')
      if (currentCategory) params.append('category', currentCategory)
      if (currentSearch) params.append('search', currentSearch)
      if (currentSort) params.append('sort', currentSort)

      const response = await axios.get(`/api/products?${params}`)
      setProducts(response.data.products)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
      // Fallback to mock data if API fails
      setProducts(mockProducts)
      setPagination({ pages: 1, currentPage: 1, total: mockProducts.length })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback to mock categories if API fails
      setCategories(mockCategories)
    }
  }

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.delete('page') // Reset to first page
    setSearchParams(newParams)
  }

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', page)
    setSearchParams(newParams)
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-100 via-cream-100 to-primary-50 py-16">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary-200/50 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2 text-gold-600" />
              Luxury Beauty Collection
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-charcoal-900 mb-6">
              Discover Exquisite
              <span className="block bg-gradient-to-r from-primary-500 to-gold-500 bg-clip-text text-transparent">
                Beauty Products
              </span>
            </h1>
            <p className="text-xl text-charcoal-600 mb-8 leading-relaxed">
              Explore our carefully curated collection of luxury perfumes, premium cosmetics, 
              and skincare essentials from the world's finest beauty brands.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-charcoal-600">
              <div className="flex items-center">
                <Gift className="w-4 h-4 mr-2 text-gold-500" />
                Free Gift Wrapping
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-gold-500" />
                Authentic Products Only
              </div>
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-gold-500" />
                Luxury Experience
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Filters */}
        <div className="bg-cream-50 rounded-2xl shadow-soft border border-primary-100 p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gold-600 mr-2" />
            <h3 className="text-lg font-semibold text-charcoal-900">Refine Your Search</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Search Products
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search luxury beauty..."
                  value={currentSearch}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-cream-50 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                />
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-charcoal-400" />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Category
              </label>
              <select
                value={currentCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name} {category.count && `(${category.count})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Sort By
              </label>
              <select
                value={currentSort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="oldest">Classic Favorites</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setSearchParams({})}
                className="w-full bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-gold-500 mx-auto mb-4"></div>
              <p className="text-charcoal-600 font-medium">Loading luxury products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal-900 mb-2">No Products Found</h3>
              <p className="text-charcoal-600 mb-6">
                We couldn't find any products matching your criteria. Try adjusting your filters.
              </p>
              <button
                onClick={() => setSearchParams({})}
                className="bg-gold-500 hover:bg-gold-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                View All Products
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-charcoal-900">
                  {currentCategory || 'All Products'}
                </h2>
                <p className="text-charcoal-600">
                  {products.length} luxury {products.length === 1 ? 'product' : 'products'} found
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-12">
              {products.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="bg-cream-50 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-500 overflow-hidden transform group-hover:-translate-y-2 border border-primary-100">
                    {/* Product Badge */}
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 text-white text-xs font-bold rounded-full ${
                        product.featured ? 'bg-gold-500' :
                        product.discountPrice ? 'bg-accent-500' :
                        product.stock <= 5 ? 'bg-charcoal-700' :
                        'bg-primary-500'
                      }`}>
                        <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                        <span className="hidden sm:inline">
                          {product.featured ? 'Featured' : 
                           product.discountPrice ? 'Sale' :
                           product.stock <= 5 ? 'Limited' :
                           'Premium'}
                        </span>
                        <span className="sm:hidden">
                          {product.featured ? 'New' : 
                           product.discountPrice ? 'Sale' :
                           product.stock <= 5 ? 'Low' :
                           'Hot'}
                        </span>
                      </span>
                    </div>
                    
                    {/* Wishlist Button */}
                    <button className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-cream-50/90 backdrop-blur-sm rounded-full flex items-center justify-center text-charcoal-600 hover:text-primary-500 hover:bg-cream-50 transition-all duration-200 opacity-0 group-hover:opacity-100">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <Link to={`/products/${product.id}`} className="block">
                      <div className="relative overflow-hidden bg-cream-100 aspect-square">
                        <img
                          src={product.mainImage || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </Link>

                    <div className="p-3 sm:p-4 md:p-6">
                      {/* Rating */}
                      <div className="flex items-center mb-2 sm:mb-3">
                        <div className="flex text-gold-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(4.5) ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm text-charcoal-500 ml-1 sm:ml-2 font-medium">(4.5)</span>
                        <span className="text-xs text-charcoal-400 ml-1 sm:ml-2 hidden sm:inline">{product.viewCount || 0} views</span>
                      </div>

                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-charcoal-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <p className="text-charcoal-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 hidden sm:block">
                        {product.shortDescription || product.description}
                      </p>

                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="text-lg sm:text-xl md:text-2xl font-bold text-charcoal-900">
                            ${product.discountPrice || product.price}
                          </span>
                          {product.discountPrice && (
                            <span className="text-sm sm:text-base md:text-lg text-charcoal-400 line-through">
                              ${product.price}
                            </span>
                          )}
                        </div>
                        {product.discountPrice && (
                          <span className="px-1 sm:px-2 py-1 bg-accent-100 text-accent-600 text-xs font-bold rounded-full">
                            Save ${(product.price - product.discountPrice).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-center">
                        <Link
                          to={`/products/${product.id}`}
                          className="w-full bg-gold-500 hover:bg-gold-600 text-white font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 group text-xs sm:text-sm"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center">
                <nav className="flex space-x-2">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                          page === currentPage
                            ? 'bg-gold-500 text-white shadow-soft'
                            : 'bg-cream-50 text-charcoal-700 hover:bg-primary-100 border border-primary-200'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Products