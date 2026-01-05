import { useState, useEffect } from 'react'
import axios from 'axios'

export const usePageContent = (page) => {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/pages/${page}`)
        setContent(response.data)
        setError(null)
      } catch (err) {
        console.error(`Error fetching ${page} content:`, err)
        setError(err)
        // Keep content empty on error - pages will use fallback content
        setContent([])
      } finally {
        setLoading(false)
      }
    }

    if (page) {
      fetchContent()
    }
  }, [page])

  const getSection = (sectionName) => {
    return content.find(section => section.section === sectionName)
  }

  const getSectionData = (sectionName) => {
    const section = getSection(sectionName)
    if (section?.data) {
      try {
        return JSON.parse(section.data)
      } catch (e) {
        console.error('Error parsing section data:', e)
        return null
      }
    }
    return null
  }

  return {
    content,
    loading,
    error,
    getSection,
    getSectionData
  }
}