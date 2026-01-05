import { useState, useEffect } from 'react'
import { X, Upload, Eye, EyeOff, Plus, Trash2, Star } from 'lucide-react'
import MultiImageUpload from './MultiImageUpload'

const ProductForm = ({ product, categories, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    sku: '',
    brand: '',
    tags: [],
    categoryId: '',
    mainImage: '',
    images: [],
    status: 'DRAFT',
    featured: false,
    seoTitle: '',
    seoDescription: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showSeoFields, setShowSeoFields] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        discountPrice: product.discountPrice?.toString() || '',
        stock: product.stock?.toString() || '',
        sku: product.sku || '',
        brand: product.brand || '',
        tags: product.tags || [],
        categoryId: product.categoryId?.toString() || '',
        mainImage: product.mainImage || '',
        images: product.images || [],
        status: product.status || 'DRAFT',
        featured: product.featured || false,
        seoTitle: product.seoTitle || '',
        seoDescription: product.seoDescription || ''
      })
      setSlugManuallyEdited(true)
      setShowSeoFields(!!(product.seoTitle || product.seoDescription))
    }
  }, [product])

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Auto-generate slug from name if not manually edited
    if (name === 'name' && !slugManuallyEdited) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSlugChange = (e) => {
    const { value } = e.target
    setSlugManuallyEdited(true)
    setFormData(prev => ({
      ...prev,
      slug: generateSlug(value)
    }))
    
    if (errors.slug) {
      setErrors(prev => ({
        ...prev,
        slug: ''
      }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    } else if (formData.name.length > 200) {
      newErrors.name = 'Product name must be less than 200 characters'
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required'
    } else if (formData.shortDescription.length > 200) {
      newErrors.shortDescription = 'Short description must be less than 200 characters'
    }

    if (!formData.price) {
      newErrors.price = 'Price is required'
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }

    if (!formData.stock) {
      newErrors.stock = 'Stock quantity is required'
    } else if (parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock cannot be negative'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required'
    }

    // Discount price validation
    if (formData.discountPrice) {
      const price = parseFloat(formData.price)
      const discountPrice = parseFloat(formData.discountPrice)
      if (discountPrice >= price) {
        newErrors.discountPrice = 'Discount price must be less than regular price'
      }
    }

    // URL validations
    if (formData.mainImage && !isValidUrl(formData.mainImage)) {
      newErrors.mainImage = 'Please enter a valid image URL'
    }

    // SEO validations
    if (formData.seoTitle && formData.seoTitle.length > 60) {
      newErrors.seoTitle = 'SEO title must be less than 60 characters'
    }

    if (formData.seoDescription && formData.seoDescription.length > 160) {
      newErrors.seoDescription = 'SEO description must be less than 160 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId)
      }
      
      // Remove empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === null) {
          delete submitData[key]
        }
      })

      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {product ? 'Edit Product' : 'Add Product'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter product name"
                  maxLength={200}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Product Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  className={`input-field ${errors.slug ? 'border-red-500' : ''}`}
                  placeholder="product-slug"
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`input-field ${errors.categoryId ? 'border-red-500' : ''}`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.parent ? `${category.parent.name} > ${category.name}` : category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description *
              </label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                rows={2}
                className={`input-field ${errors.shortDescription ? 'border-red-500' : ''}`}
                placeholder="Brief product description"
                maxLength={200}
              />
              {errors.shortDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.shortDescription.length}/200 characters
              </p>
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="Detailed product description"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Pricing & Stock</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              {/* Discount Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Price
                </label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`input-field ${errors.discountPrice ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
                {errors.discountPrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.discountPrice}</p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className={`input-field ${errors.stock ? 'border-red-500' : ''}`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Product Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Product SKU"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Brand name"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="input-field flex-1"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-secondary"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Media */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Product Media</h4>
            
            <MultiImageUpload
              value={formData.images}
              onChange={(images) => {
                setFormData(prev => ({
                  ...prev,
                  images: images,
                  mainImage: images.length > 0 ? images[0] : ''
                }))
              }}
              folder="products"
              maxFiles={10}
            />
          </div>

          {/* Product Settings */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Product Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              {/* Featured */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Featured Product
                  </span>
                  <Star className="h-4 w-4 text-yellow-500" />
                </label>
              </div>
            </div>
          </div>

          {/* SEO Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900">SEO Settings</h4>
              <button
                type="button"
                onClick={() => setShowSeoFields(!showSeoFields)}
                className="flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                {showSeoFields ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide SEO Fields
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Show SEO Fields
                  </>
                )}
              </button>
            </div>

            {showSeoFields && (
              <>
                {/* SEO Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    className={`input-field ${errors.seoTitle ? 'border-red-500' : ''}`}
                    placeholder="SEO optimized title"
                    maxLength={60}
                  />
                  {errors.seoTitle && (
                    <p className="text-red-500 text-sm mt-1">{errors.seoTitle}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.seoTitle.length}/60 characters
                  </p>
                </div>

                {/* SEO Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    rows={2}
                    className={`input-field ${errors.seoDescription ? 'border-red-500' : ''}`}
                    placeholder="SEO meta description"
                    maxLength={160}
                  />
                  {errors.seoDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.seoDescription}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.seoDescription.length}/160 characters
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm