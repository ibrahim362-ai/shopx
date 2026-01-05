import { useState, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Code
} from 'lucide-react'

const RichTextEditor = ({ value, onChange, placeholder = "Enter text..." }) => {
  const editorRef = useRef(null)
  const [isActive, setIsActive] = useState({})

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current.focus()
    updateActiveStates()
    handleContentChange()
  }

  const updateActiveStates = () => {
    const newActiveStates = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    }
    setIsActive(newActiveStates)
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }

  const handleKeyDown = (e) => {
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      execCommand('indent')
    }
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      execCommand('insertImage', url)
    }
  }

  const toolbarButtons = [
    { command: 'bold', icon: Bold, title: 'Bold' },
    { command: 'italic', icon: Italic, title: 'Italic' },
    { command: 'underline', icon: Underline, title: 'Underline' },
    { command: 'separator' },
    { command: 'insertUnorderedList', icon: List, title: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, title: 'Numbered List' },
    { command: 'separator' },
    { command: 'justifyLeft', icon: AlignLeft, title: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, title: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, title: 'Align Right' },
    { command: 'separator' },
    { command: 'link', icon: Link, title: 'Insert Link', action: insertLink },
    { command: 'image', icon: Image, title: 'Insert Image', action: insertImage },
    { command: 'separator' },
    { command: 'removeFormat', icon: Code, title: 'Remove Formatting' },
  ]

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((button, index) => {
          if (button.command === 'separator') {
            return (
              <div key={index} className="w-px bg-gray-300 mx-1 self-stretch" />
            )
          }

          const Icon = button.icon
          const isActiveButton = isActive[button.command]

          return (
            <button
              key={button.command}
              type="button"
              onClick={button.action || (() => execCommand(button.command))}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                isActiveButton ? 'bg-gray-200 text-primary-600' : 'text-gray-600'
              }`}
              title={button.title}
            >
              <Icon className="w-4 h-4" />
            </button>
          )
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[200px] focus:outline-none"
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onMouseUp={updateActiveStates}
        onKeyUp={updateActiveStates}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  )
}

export default RichTextEditor