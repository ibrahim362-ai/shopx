import { Users, Award, Truck, Shield, Sparkles, Heart, Star, Crown, Gift, Globe } from 'lucide-react'
import { usePageContent } from '../hooks/usePageContent'

const About = () => {
  // Use dynamic page content
  const { getSection, getSectionData, loading } = usePageContent('about')
  const features = [
    {
      icon: Crown,
      title: 'Luxury Expertise',
      description: 'Our beauty experts curate only the finest luxury products from world-renowned brands.',
      color: 'text-gold-600',
      bgColor: 'bg-gold-100'
    },
    {
      icon: Award,
      title: 'Authenticity Guaranteed',
      description: 'Every product is 100% authentic, sourced directly from authorized distributors.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      icon: Gift,
      title: 'Premium Experience',
      description: 'Elegant packaging, personalized service, and complimentary gift wrapping.',
      color: 'text-gold-600',
      bgColor: 'bg-gold-100'
    },
    {
      icon: Shield,
      title: 'Trusted & Secure',
      description: 'Your privacy and security are protected with enterprise-grade encryption.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    }
  ]

  const team = [
    {
      name: 'Isabella Laurent',
      role: 'Founder & Beauty Director',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      description: 'Former Chanel beauty consultant with 15 years in luxury cosmetics'
    },
    {
      name: 'Sophia Chen',
      role: 'Head of Fragrance Curation',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      description: 'Certified perfumer and fragrance expert from Grasse, France'
    },
    {
      name: 'Alexandre Dubois',
      role: 'Luxury Brand Relations',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      description: 'Former luxury retail executive with partnerships at LVMH and L\'Oréal'
    }
  ]

  const stats = [
    { icon: Users, value: "50K+", label: "Beauty Enthusiasts", color: "text-gold-500" },
    { icon: Star, value: "500+", label: "Luxury Products", color: "text-primary-500" },
    { icon: Globe, value: "25+", label: "Premium Brands", color: "text-gold-500" },
    { icon: Heart, value: "99.8%", label: "Satisfaction Rate", color: "text-primary-500" }
  ]

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-100 via-cream-100 to-primary-50 py-20">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary-200/50 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2 text-gold-600" />
              Our Luxury Beauty Story
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-charcoal-900 mb-6">
              {getSection('hero')?.title || 'Crafting Beauty'}
              <span className="block bg-gradient-to-r from-primary-500 to-gold-500 bg-clip-text text-transparent">
                {getSection('hero')?.subtitle || 'Experiences Since 2020'}
              </span>
            </h1>
            <p className="text-xl text-charcoal-600 mb-8 leading-relaxed">
              {getSection('hero')?.description || 'We are passionate about bringing you the world\'s finest luxury beauty products. From iconic perfumes to premium cosmetics, every item in our collection is carefully selected to elevate your beauty routine and celebrate your unique elegance.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-charcoal-600">
              <div className="flex items-center">
                <Crown className="w-4 h-4 mr-2 text-gold-500" />
                Luxury Curated
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-2 text-gold-500" />
                100% Authentic
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-2 text-gold-500" />
                Beauty Experts
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-16">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <div>
            <div className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Our Journey
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal-900 mb-6">The LuxeBeauty Story</h2>
            <div className="space-y-6 text-charcoal-600 leading-relaxed">
              <p>
                Founded in 2020 by beauty industry veterans, LuxeBeauty began with a vision to make 
                luxury beauty accessible to discerning customers worldwide. What started as a boutique 
                collection of rare perfumes has blossomed into a comprehensive luxury beauty destination.
              </p>
              <p>
                We believe that true beauty lies in the details – from the exquisite craftsmanship of 
                a Tom Ford fragrance to the innovative formulations of La Mer skincare. Our team of 
                beauty experts travels the world to discover and curate only the most exceptional products.
              </p>
              <p>
                Today, we're proud to partner with over 25 prestigious beauty houses, offering our 
                customers an unparalleled selection of luxury perfumes, premium cosmetics, and 
                advanced skincare solutions, all backed by our commitment to authenticity and excellence.
              </p>
            </div>
          </div>
          <div className="lg:pl-8">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=500&fit=crop"
                alt="Luxury beauty products"
                className="rounded-2xl shadow-soft w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-cream-50/90 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-charcoal-800 font-medium text-sm">
                    "Every product tells a story of craftsmanship, luxury, and timeless elegance."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="bg-gradient-to-br from-primary-50 to-cream-100 rounded-2xl p-8 lg:p-12 mb-20 border border-primary-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-charcoal-900 mb-4">Our Mission</h3>
              <p className="text-charcoal-600 leading-relaxed">
                To curate and deliver the world's finest luxury beauty products while providing 
                personalized experiences that celebrate each customer's unique beauty journey. 
                We're committed to authenticity, excellence, and building lasting relationships 
                with beauty enthusiasts worldwide.
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-6">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-charcoal-900 mb-4">Our Vision</h3>
              <p className="text-charcoal-600 leading-relaxed">
                To become the world's most trusted luxury beauty destination, known for our 
                uncompromising commitment to quality, innovation, and sustainable luxury practices 
                that honor both beauty and the environment.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              <Award className="w-4 h-4 mr-2" />
              The LuxeBeauty Difference
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal-900 mb-6">
              Why Beauty Connoisseurs Choose Us
            </h2>
            <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
              Experience the pinnacle of luxury beauty shopping with our curated selection and premium service
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-charcoal-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              <Users className="w-4 h-4 mr-2" />
              Our Beauty Experts
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal-900 mb-6">
              Meet the Curators Behind LuxeBeauty
            </h2>
            <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
              Our team of beauty industry veterans brings decades of luxury experience to every product selection
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group">
                <div className="bg-cream-50 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-500 overflow-hidden transform group-hover:-translate-y-2 border border-primary-100">
                  <div className="relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-gold-600 font-semibold mb-3">
                      {member.role}
                    </p>
                    <p className="text-charcoal-600 text-sm leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-charcoal-900 text-cream-50 rounded-2xl p-8 lg:p-12 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-40 h-40 bg-primary-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-gold-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-primary-400/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                <Star className="w-4 h-4 mr-2" />
                Our Achievements
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Trusted by Beauty Enthusiasts Worldwide
              </h2>
              <p className="text-cream-200 text-lg">
                Numbers that reflect our commitment to luxury beauty excellence
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="group">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-400/20 backdrop-blur-sm rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-cream-200 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About