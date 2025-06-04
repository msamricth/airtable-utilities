import { useState } from 'react'
import AuthForm from './components/AuthForm'
import RecordsFetcher from './components/RecordsFetcher'
import RecordsPreview from './components/RecordsPreview'
import SuspiciousEmails from './components/SuspiciousEmails'

function App() {
  const [credentials, setCredentials] = useState(null)
  const [records, setRecords] = useState([])
  const [mergedRecords, setMergedRecords] = useState([])
  const [suspiciousEmails, setSuspiciousEmails] = useState([])
  const [emailField, setEmailField] = useState('Primary Email')

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Airtable Merge Tool</h1>
      <AuthForm
        onSubmit={(creds) => {
          setCredentials(creds)
          setEmailField(creds.emailField || 'Primary Email')
        }}
      />
      {credentials && (
        <RecordsFetcher
          credentials={credentials}
          onRecordsFetched={(rawRecords) => {
            const emailMap = {}
            const sus = []

            rawRecords.forEach((r) => {
              const email = r.fields[emailField]?.toLowerCase()
              if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /tempmail|mailinator|10minutemail/.test(email)) {
                sus.push(r)
                return
              }
              if (!emailMap[email]) {
                emailMap[email] = { ...r, fields: { ...r.fields } }
              } else {
                Object.entries(r.fields).forEach(([key, val]) => {
                  if (!emailMap[email].fields[key] && val) {
                    emailMap[email].fields[key] = val
                  }
                })
              }
            })

            setMergedRecords(Object.values(emailMap))
            setSuspiciousEmails(sus)
            setRecords(rawRecords)
          }}
        />
      )}
      <div className="flex gap-6">
        {mergedRecords.length > 0 && <RecordsPreview records={mergedRecords} emailField={emailField} />}
        {suspiciousEmails.length > 0 && (
          <SuspiciousEmails
            records={suspiciousEmails}
            emailField={emailField}
            onDelete={async (id) => {
              const { apiKey, baseId, tableName } = credentials

              await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                },
              })

              setSuspiciousEmails((prev) => prev.filter((r) => r.id !== id))
            }}
          />
        )}
        <RecordsPreview records={records} credentials={credentials} emailField={emailField} />
      </div>
    </main>
  )
}

export default App
