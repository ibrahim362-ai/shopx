import { useState, useEffect } from 'react'
import { Mail, MailOpen, Trash2, Search, CheckCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AdminMessages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchMessages()
  }, [currentPage])

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages?page=${currentPage}&limit=10`)
      setMessages(response.data.messages)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (messageId) => {
    try {
      await axios.put(`/api/messages/${messageId}/read`)
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ))
      toast.success('Message marked as read')
    } catch (error) {
      toast.error('Failed to mark message as read')
    }
  }

  const handleDelete = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      await axios.delete(`/api/messages/${messageId}`)
      setMessages(messages.filter(msg => msg.id !== messageId))
      toast.success('Message deleted successfully')
    } catch (error) {
      toast.error('Failed to delete message')
    }
  }

  const filteredMessages = messages.filter(message =>
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (message.phone && message.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Customer Messages</h2>
          <span className="text-sm text-gray-500">
            {messages.length} total messages
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {messages.filter(m => !m.isRead).length} unread messages
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !message.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {message.isRead ? (
                          <MailOpen className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Mail className="h-5 w-5 text-blue-500" />
                        )}
                        <h3 className="text-lg font-medium text-gray-900">
                          {message.name}
                        </h3>
                      </div>
                      {!message.isRead && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Email:</strong> {message.email}
                      </p>
                      {message.phone && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Phone:</strong> {message.phone}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <strong>Date:</strong> {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    {!message.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100"
                        title="Mark as read"
                      >
                        <MailOpen className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {!message.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(message.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
                        >
                          <MailOpen className="h-4 w-4 mr-1" />
                          Mark as Read
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        page === currentPage
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminMessages