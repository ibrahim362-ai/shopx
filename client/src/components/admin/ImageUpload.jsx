import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Link } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const ImageUpload = ({ 
  value = '', 
  onChange, 
  onRemove,
  folder = 'general',
  className = '',
  showUrlInput = true,
  placeholder = 'Upload an image or enter URL'
}) => {
  const [loading, setLoading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState('url')
  const fileInputRef = useRef(null)

  const handleFileUpload = async (file) => {
    if (!file) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', folder)

      const response = await axios.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      onChange(response.data.url)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    } else {
      onChange('')
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showUrlInput && (
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
            <span>URL</span>
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
            <span>Upload</span>
          </button>
        </div>
      )}

      {uploadMethod === 'url' && showUrlInput && (
        <div>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-gray-500 text-sm mt-1">
            Enter a direct link to your image
          </p>
        </div>
      )}

      {(uploadMethod === 'upload' || !showUrlInput) && (
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
                <p className="text-xs text-gray-400">PNG, JPG, GIF, WebP up to 5MB</p>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading}
          />
        </div>
      )}

      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageUpload