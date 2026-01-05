import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  X, 
  Search, 
  Store, 
  Home,
  Package,
  Info,
  Mail,
  ArrowRight,
  Sparkles
} from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Handle scroll effect for header transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchFocused(false)
      setShowSearchSuggestions(false)
    }
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home, description: 'Discover trending products' },
    { name: 'Products', href: '/products', icon: Package, description: 'Browse our collection' },
    { name: 'About', href: '/about', icon: Info, description: 'Our story & mission' },
    { name: 'Contact', href: '/contact', icon: Mail, description: 'Get in touch with us' },
  ]

  const searchSuggestions = [
    'Wireless Headphones',
    'Smart Watch',
    'Gaming Laptop',
    'Bluetooth Speaker'
  ]

  const isActiveRoute = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-cream-50/90 backdrop-blur-xl shadow-soft border-b border-primary-200/50' 
          : 'bg-cream-50/95 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0">
              <Link 
                to="/" 
                className="flex items-center space-x-3 group"
              >
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-400 via-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-soft-lg transition-all duration-300 group-hover:scale-105">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <Sparkles className="absolute -top-0.5 -right-0.5 w-3 h-3 text-gold-400 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold bg-gradient-to-r from-charcoal-900 to-charcoal-700 bg-clip-text text-transparent">
                    LuxeBeauty
                  </span>
                  <div className="text-xs text-primary-600 font-medium -mt-0.5">Premium Beauty Collection</div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center justify-center flex-1 max-w-md mx-8">
              <div className="flex items-center space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveRoute(item.href)
                  return (
                    <div key={item.name} className="relative group">
                      <Link
                        to={item.href}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                          isActive
                            ? 'text-primary-600 bg-primary-100'
                            : 'text-charcoal-700 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></div>
                      )}
                      
                      {/* Hover tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-charcoal-900 text-cream-50 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.description}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-charcoal-900 rotate-45"></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </nav>

            {/* Search Bar - Right Side */}
            <div className="hidden md:flex items-center flex-shrink-0 w-80">
              <form onSubmit={handleSearch} className="w-full relative">
                <div className={`relative transition-all duration-200 ${
                  isSearchFocused ? 'transform scale-105' : ''
                }`}>
                  <input
                    type="text"
                    placeholder="Search for anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      setIsSearchFocused(true)
                      setShowSearchSuggestions(true)
                    }}
                    onBlur={() => {
                      setIsSearchFocused(false)
                      setTimeout(() => setShowSearchSuggestions(false), 150)
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 bg-primary-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-cream-50 transition-all duration-200 placeholder-charcoal-400 ${
                      isSearchFocused ? 'shadow-lg' : 'shadow-sm'
                    }`}
                  />
                  <Search className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-200 ${
                    isSearchFocused ? 'text-gold-500' : 'text-charcoal-400'
                  }`} />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-charcoal-400 hover:text-charcoal-600 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Search Suggestions */}
                {showSearchSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-cream-50 rounded-lg shadow-xl border border-primary-100 overflow-hidden z-50">
                    <div className="p-3">
                      <h4 className="text-xs font-semibold text-charcoal-900 mb-2 uppercase tracking-wide">Popular Searches</h4>
                      <div className="space-y-1">
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchQuery(suggestion)
                              navigate(`/products?search=${encodeURIComponent(suggestion)}`)
                              setShowSearchSuggestions(false)
                            }}
                            className="flex items-center justify-between w-full px-2 py-1.5 text-left text-charcoal-700 hover:bg-primary-50 rounded text-sm transition-colors duration-150"
                          >
                            <span>{suggestion}</span>
                            <ArrowRight className="w-3 h-3 text-charcoal-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-charcoal-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                <div className="relative w-5 h-5">
                  <span className={`absolute top-1 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}></span>
                  <span className={`absolute top-2.5 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0' : ''
                  }`}></span>
                  <span className={`absolute top-4 left-0 w-5 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden border-t border-primary-100 transition-all duration-300 ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="bg-cream-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search beauty products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-cream-50 transition-all duration-200"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-charcoal-400" />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveRoute(item.href)
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-primary-600 bg-primary-100'
                          : 'text-charcoal-700 hover:text-primary-600 hover:bg-primary-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <div>
                          <span className="block">{item.name}</span>
                          <span className="text-xs text-charcoal-500">{item.description}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-charcoal-400" />
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16"></div>
    </>
  )
}

export default Header