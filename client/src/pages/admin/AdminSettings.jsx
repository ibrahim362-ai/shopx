import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const AdminSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const { changePassword } = useAuth()

  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings')
      const settings = response.data
      
      reset({
        siteName: settings.siteName,
        logo: settings.logo || '',
        favicon: settings.favicon || '',
        contactEmail: settings.contactInfo?.email || '',
        contactPhone: settings.contactInfo?.phone || '',
        contactAddress: settings.contactInfo?.address || '',
        facebook: settings.socialLinks?.facebook || '',
        twitter: settings.socialLinks?.twitter || '',
        instagram: settings.socialLinks?.instagram || '',
        linkedin: settings.socialLinks?.linkedin || ''
      })
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const onSubmitSettings = async (data) => {
    setSaving(true)
    try {
      const settingsData = {
        siteName: data.siteName,
        logo: data.logo || null,
        favicon: data.favicon || null,
        contactInfo: {
          email: data.contactEmail,
          phone: data.contactPhone,
          address: data.contactAddress
        },
        socialLinks: {
          facebook: data.facebook,
          twitter: data.twitter,
          instagram: data.instagram,
          linkedin: data.linkedin
        }
      }

      await axios.put('/api/settings', settingsData)
      toast.success('Settings updated successfully!')
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const onSubmitPassword = async (data) => {
    setSaving(true)
    try {
      const result = await changePassword(data.currentPassword, data.newPassword)
      if (result.success) {
        toast.success('Password changed successfully!')
        resetPassword()
        setShowPasswordForm(false)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
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
      {/* Settings Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Store Settings</h2>
        <p className="text-sm text-gray-600">Manage your store configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Settings */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Site Settings</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmitSettings)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                {...register('siteName', { required: 'Site name is required' })}
                className="input-field"
                placeholder="Your Store Name"
              />
              {errors.siteName && (
                <p className="mt-1 text-sm text-red-600">{errors.siteName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                {...register('logo')}
                className="input-field"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon URL
              </label>
              <input
                type="url"
                {...register('favicon')}
                className="input-field"
                placeholder="https://example.com/favicon.ico"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                {...register('contactEmail')}
                className="input-field"
                placeholder="contact@yourstore.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('contactPhone')}
                className="input-field"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                {...register('contactAddress')}
                rows={3}
                className="input-field resize-none"
                placeholder="123 Business St, City, State 12345"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Social Media</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                {...register('facebook')}
                className="input-field"
                placeholder="https://facebook.com/yourstore"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                {...register('twitter')}
                className="input-field"
                placeholder="https://twitter.com/yourstore"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="url"
                {...register('instagram')}
                className="input-field"
                placeholder="https://instagram.com/yourstore"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                {...register('linkedin')}
                className="input-field"
                placeholder="https://linkedin.com/company/yourstore"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          <div className="p-6">
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="btn-outline"
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...registerPassword('currentPassword', { 
                        required: 'Current password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      {...registerPassword('newPassword', { 
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary disabled:opacity-50"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false)
                      resetPassword()
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings