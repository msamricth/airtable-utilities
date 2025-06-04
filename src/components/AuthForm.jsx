// src/components/AuthForm.jsx
import { useState, useEffect } from 'react'

export default function AuthForm({ onSubmit }) {
  const [apiKey, setApiKey] = useState('')
  const [baseId, setBaseId] = useState('')
  const [tableName, setTableName] = useState('')
  const [viewName, setViewName] = useState('')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('airtableConfig')
    if (saved) {
      const { apiKey, baseId, tableName, viewName } = JSON.parse(saved)
      setApiKey(apiKey)
      setBaseId(baseId)
      setTableName(tableName)
      setViewName(viewName)
      onSubmit({ apiKey, baseId, tableName, viewName })
    } else {
      setEditing(true)
    }
  }, [onSubmit])

  const handleSubmit = (e) => {
    e.preventDefault()
    const config = { apiKey, baseId, tableName, viewName }
    localStorage.setItem('airtableConfig', JSON.stringify(config))
    onSubmit(config)
    setEditing(false)
  }

  const handleEdit = () => setEditing(true)

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-green-700">Connected to Airtable</p>
        <button
          onClick={handleEdit}
          className="hover:text-blue-600 transition"
          title="Edit settings"
        >✏️
        </button>
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <p className="py-2 italic">
        Create new Personal access token{' '}
        <a
          href="https://airtable.com/create/tokens"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          here
        </a>. For Scopes you will need Read and Write on your Records and Schema Bases read and add the base that you wish to edit. Then enter the token below, along with your Base ID (Look at your table its in the url right after https://airtable.com/ and before the next /), Table and View Name. 
      </p>
      <input className="input" placeholder="API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} required />
      <input className="input" placeholder="Base ID" value={baseId} onChange={e => setBaseId(e.target.value)} required />
      <input className="input" placeholder="Table Name" value={tableName} onChange={e => setTableName(e.target.value)} required />
      <input className="input" placeholder="View Name" value={viewName} onChange={e => setViewName(e.target.value)} required />
      <button type="submit" className="btn">Connect</button>
    </form>
  )
}
