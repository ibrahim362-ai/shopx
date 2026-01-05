import { useState, useRef } from 'react'
import { Upload, X, Plus, Link } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const MultiImageUpload = ({ 
  value = [], 
  onChange, 
  folder = 'general',
  maxFiles = 10,
  className = ''
}) => {
  const [loading, setLoading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState('url')
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef(null)

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return

    try {
      setLoading(true)
      const formData = new FormData()
      
      Array.from(files).forEach(file => {
        formData.append('images', file)
      })
      formData.append('folder', folder)

      const response = await axios.post('/api/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const newImages = [...value, ...response.data.images.map(img => img.url)]
      onChange(newImages.slice(0, maxFiles))
      toast.success(`${response.data.images.length} images uploaded successfully`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload images')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleUrlAdd = () => {
    if (urlInput.trim() && value.length < maxFiles) {
      const newImages = [...value, urlInput.trim()]
      onChange(newImages)
      setUrlInput('')
    }
  }

  const handleRemove = (index) => {
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex space-x-2 mb-4">
        <button
          type="button"
          onClick={() => setUploadMethod('url')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            uploadMethod === 'url'
              ? 'bg-primary-50 border-primary-200 text-primary-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Link className="h-4 w-4" />
          <span>Add URL</span>
        </button>
        <button
          type="button"
          onClick={() => setUploadMethod('upload')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            uploadMethod === 'upload'
              ? 'bg-primary-50 border-primary-200 text-primary-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Upload Files</span>
        </button>
      </div>

      {uploadMethod === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
          <button
            type="button"
            onClick={handleUrlAdd}
            disabled={!urlInput.trim() || value.length >= maxFiles}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      )}

      {uploadMethod === 'upload' && (
        <div>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            {loading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                <p className="text-gray-500">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400">PNG, JPG, GIF, WebP up to 5MB each</p>
                <p className="text-xs text-gray-400 mt-1">
                  {value.length}/{maxFiles} images
                </p>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading || value.length >= maxFiles}
          />
        </div>
      )}

      {value.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              Images ({value.length}/{maxFiles})
            </p>
            {value.length > 0 && (
              <p className="text-xs text-gray-500">
                First image will be the main product image
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {value.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-primary-500 text-white text-xs px-1 py-0.5 rounded">
                    Main
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiImageUpload