import { useState } from 'react'
import { X, Send, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'

const ReplyModal = ({ message, isOpen, onClose, onReplySuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post(`/api/messages/${message.id}/reply`, {
        replyContent: data.replyContent
      })
      
      if (response.data.emailSent) {
        toast.success('Reply sent successfully!')
      } else {
        toast.success('Reply saved successfully!')
        if (response.data.warning) {
          toast.error(`Email not sent: ${response.data.warning}`, { duration: 6000 })
        }
      }
      
      onReplySuccess(response.data.data)
      reset()
      onClose()
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reply'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !message) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Mail className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Reply to {message.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Customer Info */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Customer:</span>
              <span className="ml-2 text-gray-900">{message.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{message.email}</span>
            </div>
            {message.phone && (
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <span className="ml-2 text-gray-900">{message.phone}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Date:</span>
              <span className="ml-2 text-gray-900">
                {new Date(message.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Original Message */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Original Message:</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800 whitespace-pre-wrap">{message.message}</p>
          </div>
        </div>

        {/* Previous Reply (if exists) */}
        {message.hasReply && message.replyContent && (
          <div className="p-6 border-b bg-blue-50">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Previous Reply:</h3>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-gray-800 whitespace-pre-wrap">{message.replyContent}</p>
              <div className="mt-3 text-sm text-blue-600">
                Replied by {message.repliedByAdmin?.name || message.repliedByAdmin?.username} on{' '}
                {new Date(message.repliedAt).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Reply Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="mb-4">
            <label htmlFor="replyContent" className="block text-sm font-medium text-gray-700 mb-2">
              Your Reply:
            </label>
            <textarea
              id="replyContent"
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
                errors.replyContent ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Type your reply here..."
              {...register('replyContent', {
                required: 'Reply content is required',
                minLength: {
                  value: 10,
                  message: 'Reply must be at least 10 characters long'
                }
              })}
            />
            {errors.replyContent && (
              <p className="mt-1 text-sm text-red-600">{errors.replyContent.message}</p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Email Notification</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This reply will be sent directly to the customer's email address: {message.email}
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  Note: If email service is not configured, the reply will be saved but no email will be sent.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Reply</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReplyModal