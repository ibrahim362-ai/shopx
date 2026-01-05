import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Phone, MapPin, Clock, Send, Sparkles, Heart, MessageCircle, HeadphonesIcon } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { usePageContent } from '../hooks/usePageContent'

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  
  // Use dynamic page content
  const { getSection, getSectionData, loading } = usePageContent('contact')

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await axios.post('/api/messages', data)
      toast.success('Message sent successfully! Our beauty consultants will get back to you soon.')
      reset()
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'hello@luxebeauty.com',
      description: 'Beauty consultations & product inquiries',
      color: 'text-gold-600',
      bgColor: 'bg-gold-100'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+1 (555) LUXE-BEAUTY',
      description: 'Mon-Fri: 9am-7pm, Sat: 10am-5pm',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      icon: MapPin,
      title: 'Visit Our Boutique',
      details: '123 Beauty Boulevard',
      description: 'Luxury District, LD 12345',
      color: 'text-gold-600',
      bgColor: 'bg-gold-100'
    },
    {
      icon: HeadphonesIcon,
      title: 'Beauty Concierge',
      details: '24/7 Premium Support',
      description: 'Personalized beauty assistance',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    }
  ]

  const services = [
    {
      icon: Heart,
      title: 'Personal Beauty Consultation',
      description: 'One-on-one sessions with our beauty experts'
    },
    {
      icon: Sparkles,
      title: 'Fragrance Profiling',
      description: 'Find your perfect signature scent'
    },
    {
      icon: MessageCircle,
      title: 'Product Recommendations',
      description: 'Curated suggestions based on your preferences'
    }
  ]

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-100 via-cream-100 to-primary-50 py-20">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary-200/50 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4 mr-2 text-gold-600" />
              Beauty Consultation & Support
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-charcoal-900 mb-6">
              {getSection('hero')?.title || 'Connect with Our'}
              <span className="block bg-gradient-to-r from-primary-500 to-gold-500 bg-clip-text text-transparent">
                {getSection('hero')?.subtitle || 'Beauty Experts'}
              </span>
            </h1>
            <p className="text-xl text-charcoal-600 mb-8 leading-relaxed">
              {getSection('hero')?.description || 'Have questions about our luxury products? Need personalized beauty advice? Our team of beauty consultants is here to help you discover your perfect beauty routine.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-charcoal-600">
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-2 text-gold-500" />
                Personal Consultations
              </div>
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-gold-500" />
                Expert Recommendations
              </div>
              <div className="flex items-center">
                <HeadphonesIcon className="w-4 h-4 mr-2 text-gold-500" />
                Premium Support
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="bg-cream-50 rounded-2xl shadow-soft border border-primary-100 p-8">
            <div className="mb-8">
              <div className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
                <Send className="w-4 h-4 mr-2" />
                Get in Touch
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-charcoal-900 mb-4">
                Send us a Message
              </h2>
              <p className="text-charcoal-600">
                Our beauty consultants are ready to assist you with product recommendations, 
                skincare advice, or any questions about our luxury collection.
              </p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-charcoal-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-3 bg-cream-50 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-accent-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-4 py-3 bg-cream-50 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-accent-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-charcoal-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone', {
                    pattern: {
                      value: /^[\+]?[1-9][\d]{0,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  className="w-full px-4 py-3 bg-cream-50 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-accent-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-charcoal-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={6}
                  {...register('message', { 
                    required: 'Message is required',
                    minLength: {
                      value: 10,
                      message: 'Message must be at least 10 characters'
                    }
                  })}
                  className="w-full px-4 py-3 bg-cream-50 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us about your beauty needs, product questions, or how we can assist you..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-accent-600">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold-500 hover:bg-gold-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
                <HeadphonesIcon className="w-4 h-4 mr-2" />
                Contact Information
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-charcoal-900 mb-4">
                Get in Touch with LuxeBeauty
              </h2>
              <p className="text-charcoal-600 mb-8 leading-relaxed">
                Our beauty experts are here to provide personalized assistance and answer 
                any questions about our luxury collection. Experience the LuxeBeauty difference 
                with our premium customer service.
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="group">
                  <div className="bg-cream-50 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-6 border border-primary-100 group-hover:-translate-y-1">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${info.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <info.icon className={`h-6 w-6 ${info.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-charcoal-900 mb-1">
                          {info.title}
                        </h3>
                        <p className="text-charcoal-900 font-semibold mb-1">
                          {info.details}
                        </p>
                        <p className="text-charcoal-600 text-sm">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Services */}
            <div className="bg-gradient-to-br from-primary-50 to-cream-100 rounded-2xl p-6 border border-primary-100">
              <h3 className="text-lg font-bold text-charcoal-900 mb-4">
                Our Beauty Services
              </h3>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <service.icon className="w-4 h-4 text-gold-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal-900 text-sm">
                        {service.title}
                      </h4>
                      <p className="text-charcoal-600 text-sm">
                        {service.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gradient-to-br from-primary-100 to-cream-100 rounded-2xl h-64 flex items-center justify-center border border-primary-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gold-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-gold-600" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 mb-2">Visit Our Luxury Boutique</h3>
                <p className="text-charcoal-600 text-sm mb-2">
                  Experience our products in person at our flagship location
                </p>
                <p className="text-xs text-charcoal-500">
                  Interactive map integration available
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gradient-to-br from-charcoal-800 to-charcoal-900 text-cream-50 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-20 h-20 bg-gold-400/10 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4">
                  Follow LuxeBeauty
                </h3>
                <p className="text-cream-200 text-sm mb-4">
                  Stay updated with the latest beauty trends and exclusive offers
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="#" className="px-4 py-2 bg-primary-400/20 hover:bg-primary-400/30 text-cream-50 rounded-lg transition-colors text-sm font-medium">
                    Instagram
                  </a>
                  <a href="#" className="px-4 py-2 bg-primary-400/20 hover:bg-primary-400/30 text-cream-50 rounded-lg transition-colors text-sm font-medium">
                    Facebook
                  </a>
                  <a href="#" className="px-4 py-2 bg-primary-400/20 hover:bg-primary-400/30 text-cream-50 rounded-lg transition-colors text-sm font-medium">
                    YouTube
                  </a>
                  <a href="#" className="px-4 py-2 bg-primary-400/20 hover:bg-primary-400/30 text-cream-50 rounded-lg transition-colors text-sm font-medium">
                    TikTok
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact