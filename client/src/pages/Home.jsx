import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShoppingCart, 
  ArrowRight, 
  Star, 
  Heart, 
  Eye,
  TrendingUp,
  Sparkles,
  CheckCircle,
  Gift,
  ChevronRight,
  Users,
  Globe,
  HeadphonesIcon,
  Play,
  Clock,
  Zap,
  Shield,
  Award,
  Truck,
  MousePointer,
  Layers,
  Palette,
  Wand2,
  Crown,
  Gem,
  Infinity,
  Lightbulb,
  Target,
  Feather
} from 'lucide-react'
import axios from 'axios'
import { useCart } from '../contexts/CartContext'
import { usePageContent } from '../hooks/usePageContent'
import toast from 'react-hot-toast'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState({})
  const heroRef = useRef(null)
  const { addToCart } = useCart()
  
  // Use dynamic page content
  const { getSection, getSectionData, loading: contentLoading } = usePageContent('home')

  // Advanced mouse tracking for interactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }))
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    const elements = document.querySelectorAll('[data-animate]')
    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [loading])

  // Mock data for public display when API is not available
  const mockProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299.99,
      discountPrice: 249.99,
      description: "High-quality wireless headphones with noise cancellation",
      mainImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      rating: 4.8,
      badge: "Best Seller"
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199.99,
      discountPrice: 149.99,
      description: "Track your fitness goals with this advanced smartwatch",
      mainImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
      rating: 4.6,
      badge: "New"
    },
    {
      id: 3,
      name: "Professional Camera",
      price: 899.99,
      description: "Capture stunning photos with this professional-grade camera",
      mainImage: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=500&fit=crop",
      rating: 4.9,
      badge: "Limited"
    }
  ]

  const mockCategories = [
    { id: 1, name: "Electronics", description: "Latest gadgets and devices", icon: Gift },
    { id: 2, name: "Fashion", description: "Trendy clothing and accessories", icon: Gift },
    { id: 3, name: "Home & Garden", description: "Everything for your home", icon: Gift },
    { id: 4, name: "Sports", description: "Fitness and outdoor gear", icon: Gift }
  ]

  const mockTestimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Verified Customer",
      content: "Amazing quality products and fast shipping. Highly recommended!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Regular Customer",
      content: "Great customer service and excellent product selection.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "Happy Customer",
      content: "Best online shopping experience I've ever had!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ]

  const stats = [
    { icon: Users, value: "500K+", label: "Beauty Enthusiasts", gradient: "from-primary-400 to-gold-500" },
    { icon: Gem, value: "25K+", label: "Luxury Products", gradient: "from-gold-400 to-primary-500" },
    { icon: Globe, value: "150+", label: "Countries Served", gradient: "from-primary-500 to-charcoal-600" },
    { icon: Crown, value: "99.9%", label: "Satisfaction Rate", gradient: "from-gold-500 to-primary-400" }
  ]

  const features = [
    {
      icon: Zap,
      title: "Instant Beauty",
      description: "Transform your look with premium products delivered in hours",
      color: "text-gold-600",
      bgColor: "bg-gradient-to-br from-gold-50 to-primary-50",
      delay: "0ms"
    },
    {
      icon: Shield,
      title: "Authenticity Guaranteed",
      description: "100% genuine luxury brands with certificate of authenticity",
      color: "text-primary-600",
      bgColor: "bg-gradient-to-br from-primary-50 to-gold-50",
      delay: "100ms"
    },
    {
      icon: Award,
      title: "Expert Curation",
      description: "Hand-picked by beauty professionals and industry experts",
      color: "text-charcoal-600",
      bgColor: "bg-gradient-to-br from-charcoal-50 to-primary-50",
      delay: "200ms"
    },
    {
      icon: Infinity,
      title: "Endless Possibilities",
      description: "Discover new beauty trends and timeless classics",
      color: "text-gold-600",
      bgColor: "bg-gradient-to-br from-gold-50 to-charcoal-50",
      delay: "300ms"
    }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Set default SEO data
      document.title = 'Home - ModernStore'
      
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Welcome to ModernStore - Your premier destination for quality products')
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = 'Welcome to ModernStore - Your premier destination for quality products'
        document.head.appendChild(meta)
      }

      // Fetch products and categories
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/api/products?limit=6').catch(() => ({ data: { products: mockProducts } })),
        axios.get('/api/categories').catch(() => ({ data: mockCategories }))
      ])
      
      setFeaturedProducts(productsRes.data.products || mockProducts)
      setCategories(categoriesRes.data || mockCategories)
      setTestimonials(mockTestimonials)
    } catch (error) {
      console.error('Error fetching data:', error)
      setFeaturedProducts(mockProducts)
      setCategories(mockCategories)
      setTestimonials(mockTestimonials)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cream-50 via-primary-50 to-gold-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-charcoal-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="text-center relative z-10">
          {/* Modern Loading Animation */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-primary-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-primary-500 animate-spin animate-reverse"></div>
              <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-charcoal-500 animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gold-500 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 via-gold-600 to-charcoal-600 bg-clip-text text-transparent mb-4">
            Crafting Your Beauty Experience
          </h2>
          <p className="text-charcoal-600 font-medium text-lg">
            Preparing luxury beauty products just for you...
          </p>
          
          {/* Loading Progress Dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-primary-400 to-gold-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 200}ms` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Ultra-Modern Hero Section 2026 */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-cream-50 via-primary-50 to-gold-50"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(246, 193, 204, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(28, 28, 28, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #fff6f0 0%, #f6c1cc 50%, #d4af37 100%)
          `
        }}
      >
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Geometric Shapes */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-primary-400/20 to-gold-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-gold-400/10 to-primary-400/10 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-charcoal-400/5 to-primary-400/5 rounded-full blur-3xl animate-pulse-slow"></div>
          
          {/* Modern Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="grid grid-cols-12 gap-4 h-full">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="bg-charcoal-900 rounded-sm"></div>
              ))}
            </div>
          </div>
          
          {/* Interactive Mouse Follower */}
          <div 
            className="absolute w-96 h-96 bg-gradient-to-br from-gold-400/10 to-primary-400/10 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out"
            style={{
              left: mousePosition.x - 192,
              top: mousePosition.y - 192,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 w-full">
          <div className="max-w-5xl mx-auto text-center">
            
            {/* Premium Badge with Animation */}
            <div 
              className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-xl rounded-full text-sm font-medium mb-12 animate-fade-in-up border border-white/30 shadow-2xl"
              data-animate
              id="hero-badge"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Crown className="w-5 h-5 text-gold-500" />
                  <div className="absolute inset-0 animate-ping">
                    <Crown className="w-5 h-5 text-gold-400 opacity-75" />
                  </div>
                </div>
                <span className="bg-gradient-to-r from-charcoal-800 to-gold-600 bg-clip-text text-transparent font-semibold">
                  Welcome to Luxury Beauty Revolution 2026
                </span>
                <Sparkles className="w-4 h-4 text-primary-500 animate-pulse" />
              </div>
            </div>

            {/* Revolutionary Heading with Text Effects */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tight">
              <span className="block relative">
                <span className="bg-gradient-to-r from-charcoal-900 via-primary-600 to-gold-600 bg-clip-text text-transparent animate-gradient-x">
                  {getSection('hero')?.title || 'Discover'}
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-400/20 to-gold-400/20 blur-xl -z-10 animate-pulse"></div>
              </span>
              <span className="block mt-4 relative">
                <span className="bg-gradient-to-r from-gold-500 via-primary-500 to-charcoal-700 bg-clip-text text-transparent animate-gradient-x-reverse">
                  {getSection('hero')?.subtitle || 'Exquisite Beauty'}
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-gold-400/20 to-primary-400/20 blur-xl -z-10 animate-pulse delay-500"></div>
              </span>
            </h1>

            {/* Modern Subtitle with Typewriter Effect */}
            <p className="text-xl md:text-2xl lg:text-3xl text-charcoal-700 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
              {getSection('hero')?.description || 'Experience the future of luxury cosmetics with AI-curated beauty and premium ingredients that transform your natural elegance.'}
            </p>

            {/* Next-Gen CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <Link
                to="/products"
                className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-gold-500/25 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <ShoppingCart className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Explore Collection</span>
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold-400 to-gold-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Link>
              
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="group inline-flex items-center px-10 py-5 border-2 border-primary-400/50 text-charcoal-800 font-semibold rounded-2xl hover:bg-primary-400/10 backdrop-blur-xl transition-all duration-300 hover:border-primary-500 hover:shadow-xl"
              >
                <div className="relative mr-3">
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-primary-400 rounded-full opacity-0 group-hover:opacity-20 animate-ping"></div>
                </div>
                <span>Discover Magic</span>
              </button>
            </div>

            {/* Advanced Stats with Hover Effects */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="group text-center cursor-pointer"
                  data-animate
                  id={`stat-${index}`}
                >
                  <div className={`relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl mb-6 group-hover:scale-125 transition-all duration-500 shadow-lg group-hover:shadow-2xl`}>
                    <stat.icon className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-white/40 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  </div>
                  <div className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-charcoal-900 to-gold-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-charcoal-600 text-sm font-medium group-hover:text-primary-600 transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modern Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-12 border-2 border-primary-400/50 rounded-full flex justify-center backdrop-blur-sm">
              <div className="w-1.5 h-4 bg-gradient-to-b from-primary-500 to-gold-500 rounded-full mt-2 animate-scroll"></div>
            </div>
            <span className="text-xs text-charcoal-500 font-medium">Scroll to explore</span>
          </div>
        </div>
      </section>

      {/* Revolutionary Features Section 2026 */}
      <section 
        id="features" 
        className="py-32 relative overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, #fff6f0 0%, rgba(246, 193, 204, 0.1) 50%, #fff6f0 100%),
            radial-gradient(circle at 30% 70%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)
          `
        }}
      >
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="grid grid-cols-8 gap-px h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div 
                key={i} 
                className="bg-charcoal-900 animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              ></div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header with Modern Typography */}
          <div className="text-center mb-20" data-animate id="features-header">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-100 to-gold-100 rounded-full text-sm font-semibold mb-6 shadow-lg backdrop-blur-sm border border-primary-200/50">
              <Lightbulb className="w-5 h-5 mr-2 text-gold-600" />
              <span className="bg-gradient-to-r from-primary-700 to-gold-700 bg-clip-text text-transparent">
                Why Choose LuxeBeauty
              </span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl xl:text-7xl font-black text-charcoal-900 mb-8 leading-tight">
              <span className="block">Luxury Beauty</span>
              <span className="block bg-gradient-to-r from-primary-600 via-gold-500 to-charcoal-700 bg-clip-text text-transparent">
                Redefined
              </span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed font-light">
              We're pioneering the future of beauty with cutting-edge technology, 
              <span className="font-semibold text-primary-600"> sustainable luxury</span>, and 
              personalized experiences that celebrate your unique beauty.
            </p>
          </div>

          {/* Modern Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative"
                data-animate
                id={`feature-${index}`}
                style={{ animationDelay: feature.delay }}
              >
                {/* Card with Advanced Hover Effects */}
                <div className={`relative h-full p-8 ${feature.bgColor} rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 backdrop-blur-sm overflow-hidden`}>
                  
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="grid grid-cols-6 gap-1 h-full">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-charcoal-900 rounded-sm transform rotate-45 group-hover:rotate-90 transition-transform duration-700"
                          style={{ transitionDelay: `${i * 20}ms` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon with Advanced Animation */}
                    <div className="relative mb-8">
                      <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-white to-white/80 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 border border-white/50`}>
                        <feature.icon className={`w-10 h-10 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                      
                      {/* Floating Particles Effect */}
                      <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1 h-1 bg-gold-400 rounded-full animate-float-particle"
                            style={{
                              left: `${20 + i * 15}%`,
                              top: `${20 + (i % 2) * 40}%`,
                              animationDelay: `${i * 200}ms`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-charcoal-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-charcoal-600 leading-relaxed group-hover:text-charcoal-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                    
                    {/* Hover Arrow */}
                    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="inline-flex items-center text-primary-600 font-semibold">
                        <span className="mr-2">Learn More</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bottom CTA with Modern Design */}
          <div className="text-center mt-20" data-animate id="features-cta">
            <div className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-charcoal-900 to-charcoal-800 text-white rounded-2xl shadow-2xl hover:shadow-charcoal-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer group">
              <Target className="w-6 h-6 text-gold-400 group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-semibold">Experience the Future of Beauty</span>
              <Sparkles className="w-5 h-5 text-primary-400 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Next-Gen Categories Section */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-br from-primary-50 via-cream-50 to-gold-50">
        {/* Dynamic Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]">
            <div className="grid grid-cols-12 gap-2 h-full">
              {Array.from({ length: 144 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-gradient-to-br from-primary-400 to-gold-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-gold-400/10 to-primary-400/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-primary-400/10 to-charcoal-400/5 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center mb-20" data-animate id="categories-header">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gold-100 to-primary-100 rounded-full text-sm font-semibold mb-6 shadow-lg backdrop-blur-sm border border-gold-200/50">
              <Palette className="w-5 h-5 mr-2 text-primary-600" />
              <span className="bg-gradient-to-r from-gold-700 to-primary-700 bg-clip-text text-transparent">
                Curated Collections
              </span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl xl:text-7xl font-black text-charcoal-900 mb-8 leading-tight">
              <span className="block">Beauty</span>
              <span className="block bg-gradient-to-r from-gold-600 via-primary-500 to-charcoal-700 bg-clip-text text-transparent">
                Collections
              </span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed font-light">
              Discover our meticulously curated beauty categories, each designed to enhance your 
              <span className="font-semibold text-gold-600"> natural elegance </span>
              and celebrate your unique style.
            </p>
          </div>
          
          {/* Modern Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => {
              const IconComponent = category.icon || Gem
              return (
                <Link
                  key={category.id}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group relative interactive-card"
                  data-animate
                  id={`category-${index}`}
                >
                  {/* Main Card */}
                  <div className="relative h-80 bg-gradient-to-br from-cream-50 to-primary-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/50 backdrop-blur-sm">
                    
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="grid grid-cols-8 gap-1 h-full">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="bg-gradient-to-br from-primary-400 to-gold-400 rounded-sm transform group-hover:rotate-45 transition-transform duration-700"
                            style={{ transitionDelay: `${i * 15}ms` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-gold-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 p-8 h-full flex flex-col justify-center items-center text-center">
                      
                      {/* Icon with Advanced Effects */}
                      <div className="relative mb-8">
                        <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-400 to-gold-500 rounded-3xl shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                          <IconComponent className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl"></div>
                        </div>
                        
                        {/* Floating Ring Effect */}
                        <div className="absolute inset-0 rounded-3xl border-2 border-gold-400/30 scale-150 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500"></div>
                        
                        {/* Particle Effects */}
                        <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-2 h-2 bg-gradient-to-r from-primary-400 to-gold-400 rounded-full animate-float-particle"
                              style={{
                                left: `${10 + i * 10}%`,
                                top: `${10 + (i % 3) * 30}%`,
                                animationDelay: `${i * 150}ms`
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-charcoal-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">
                        {category.name}
                      </h3>
                      
                      <p className="text-charcoal-600 text-sm mb-6 line-clamp-2 group-hover:text-charcoal-700 transition-colors duration-300">
                        {category.description}
                      </p>
                      
                      {category.count && (
                        <p className="text-gold-600 text-sm font-semibold mb-6 px-3 py-1 bg-gold-100 rounded-full">
                          {category.count} Products
                        </p>
                      )}
                      
                      {/* Modern CTA */}
                      <div className="inline-flex items-center text-gold-600 font-semibold group-hover:text-gold-700 transition-colors duration-300">
                        <span className="mr-2">Explore Collection</span>
                        <div className="relative">
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gold-400 rounded-full opacity-0 group-hover:opacity-20 animate-ping"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
                  </div>
                  
                  {/* Floating Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-gold-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10 transform translate-y-4"></div>
                </Link>
              )
            })}
          </div>
          
          {/* Bottom Enhancement */}
          <div className="text-center mt-20" data-animate id="categories-bottom">
            <div className="inline-flex items-center space-x-6 px-10 py-5 bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-charcoal-900 text-white rounded-3xl shadow-2xl hover:shadow-charcoal-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer group">
              <Wand2 className="w-7 h-7 text-gold-400 group-hover:rotate-180 transition-transform duration-500" />
              <div className="text-center">
                <div className="font-bold text-lg">Discover Your Perfect Match</div>
                <div className="text-sm text-cream-300">AI-powered beauty recommendations</div>
              </div>
              <Sparkles className="w-6 h-6 text-primary-400 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending Now
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-charcoal-900 mb-6">
              Featured Products
            </h2>
            <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
              Discover our most popular and highly-rated beauty products loved by customers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.slice(0, 6).map((product, index) => (
              <div key={product.id} className="group relative">
                <div className="bg-cream-50 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-500 overflow-hidden transform group-hover:-translate-y-2 border border-primary-100">
                  {/* Product Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`inline-flex items-center px-3 py-1 text-white text-xs font-bold rounded-full ${
                      product.badge === 'Best Seller' ? 'bg-gold-500' :
                      product.badge === 'New' ? 'bg-primary-500' :
                      product.badge === 'Limited' ? 'bg-charcoal-700' :
                      product.badge === 'Deal' ? 'bg-accent-500' :
                      'bg-primary-400'
                    }`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {product.badge || 'Featured'}
                    </span>
                  </div>
                  
                  {/* Wishlist Button */}
                  <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-cream-50/90 backdrop-blur-sm rounded-full flex items-center justify-center text-charcoal-600 hover:text-primary-500 hover:bg-cream-50 transition-all duration-200 opacity-0 group-hover:opacity-100">
                    <Heart className="w-5 h-5" />
                  </button>

                  <Link to={`/products/${product.id}`} className="block">
                    <div className="relative overflow-hidden bg-cream-100 aspect-square">
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </Link>

                  <div className="p-6">
                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex text-gold-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating || 4.5) ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <span className="text-sm text-charcoal-500 ml-2 font-medium">({product.rating || 4.5})</span>
                      <span className="text-xs text-charcoal-400 ml-2">{product.reviews || 0} reviews</span>
                    </div>

                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-lg font-bold text-charcoal-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-charcoal-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-charcoal-900">
                          ${product.discountPrice || product.price}
                        </span>
                        {product.discountPrice && (
                          <span className="text-lg text-charcoal-400 line-through">
                            ${product.price}
                          </span>
                        )}
                      </div>
                      {product.discountPrice && (
                        <span className="px-2 py-1 bg-accent-100 text-accent-600 text-xs font-bold rounded-full">
                          Save ${(product.price - product.discountPrice).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 group/btn"
                      >
                        <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span>Add to Cart</span>
                      </button>
                      <Link
                        to={`/products/${product.id}`}
                        className="w-12 h-12 bg-primary-100 hover:bg-primary-200 text-primary-600 hover:text-primary-700 rounded-xl flex items-center justify-center transition-all duration-200"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link 
              to="/products" 
              className="inline-flex items-center px-8 py-4 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-soft-lg group"
            >
              <span>View All Products</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              <Users className="w-4 h-4 mr-2" />
              Customer Reviews
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-charcoal-900 mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-cream-50 rounded-2xl shadow-soft p-8 hover:shadow-soft-lg transition-all duration-300 border border-primary-100">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
                    }}
                  />
                  <div>
                    <h4 className="font-semibold text-charcoal-900">{testimonial.name}</h4>
                    <p className="text-sm text-charcoal-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex text-gold-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-charcoal-700 leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-charcoal-900 text-cream-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-primary-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-gold-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary-400/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
              <Globe className="w-4 h-4 mr-2" />
              Join Our Beauty Community
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Elevate Your Beauty?
            </h2>
            <p className="text-xl text-cream-200 mb-12 leading-relaxed">
              Become part of our growing family of satisfied customers. Experience premium quality, 
              exceptional service, and exclusive beauty deals available only to our community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-gold-500 hover:bg-gold-600 text-white font-bold rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-soft-lg group"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Shop Beauty Collection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-primary-400/30 text-cream-50 font-semibold rounded-2xl hover:bg-primary-400/10 backdrop-blur-sm transition-all duration-200 group"
              >
                <HeadphonesIcon className="w-5 h-5 mr-2" />
                Beauty Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home