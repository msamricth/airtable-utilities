import { useState, useEffect } from 'react'

export default function RecordsPreview({ records, credentials, emailField}) {
  if (!credentials) return null

  const [mergedRecords, setMergedRecords] = useState([])  
  const [sentIds, setSentIds] = useState([])
  const [duplicateGroups, setDuplicateGroups] = useState([])

  const { apiKey, baseId, tableName } = credentials


  useEffect(() => {
    if (records.length > 0) handleMerge()
  }, [records])
  const emailMap = {}
  records.forEach((r) => {
    const email = r.fields?.[emailField]?.toLowerCase()
    if (!email) return
    if (!emailMap[email]) emailMap[email] = []
    emailMap[email].push(r)
  })


  
  const handleMerge = () => {
    const duplicates = Object.values(emailMap).filter(group => group.length > 1)
    setDuplicateGroups(duplicates)

    const merged = duplicates.map(group => {
        const base = { ...group[0], fields: { ...group[0].fields } }
        for (let i = 1; i < group.length; i++) {
          Object.entries(group[i].fields).forEach(([key, val]) => {
            if (!base.fields[key] && val) base.fields[key] = val
          })
        }
        return base
      })
    setMergedRecords(merged)
    console.log('🧪 Merged records:', merged)
    console.log('📛 Duplicate groups:', duplicates)
  }

  const handleSend = async () => {
    const updates = await Promise.all(
      mergedRecords.map(async (record) => {
        try {
          const res = await fetch(
            `https://api.airtable.com/v0/${baseId}/${tableName}/${record.id}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({ fields: record.fields }),
            }
          )
          const json = await res.json()
          return json.id
        } catch (e) {
          console.error('Error sending', record.id)
          return null
        }
      })
    )
    setSentIds(updates.filter(Boolean))
  }

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Merged Records Preview</h2>
      <button
        onClick={handleMerge}
        className="mb-4 text-sm bg-green text-white px-4 py-2 rounded hover:bg-yellow-600"
      >
        Merge Records
      </button>

      {duplicateGroups.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Duplicate Groups</h3>
          {duplicateGroups.map((group, gIndex) => (
            <div key={gIndex} className="mb-4 p-2 border rounded bg-red-50">
              <p className="mb-2 font-medium">Email: {group[0].fields[emailField]}</p>
              <table className="w-full table-auto border">
                <thead>
                  <tr>
                    {Object.keys(group[0].fields).map((key) => (
                      <th key={key} className="border px-2 py-1 text-left text-sm">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.map((record) => (
                    <tr key={record.id} className="border-t">
                      {Object.values(record.fields).map((val, i) => (
                        <td key={i} className="border px-2 py-1 text-sm">
                          {typeof val === 'object' && val !== null ? JSON.stringify(val) : val || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {mergedRecords.length > 0 && (
        <>
          <table className="table-auto border mb-4 w-[50vw] overflow-scroll">
            <thead>
              <tr>
                {Object.keys(mergedRecords[0].fields).map((key) => (
                  <th key={key} className="border px-2 py-1 text-left">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mergedRecords.map((record) => (
                <tr key={record.id} className="border-t">
                  {Object.values(record.fields).map((val, i) => (
                    <td key={i} className="border px-2 py-1">
                      {typeof val === 'object' && val !== null ? JSON.stringify(val) : val || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleSend}
            className="bg-green text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send it
          </button>
        </>
      )}

      {sentIds.length > 0 && (
        <p className="mt-4 text-green-600">✅ Sent {sentIds.length} records to Airtable.</p>
      )}
    </section>
  )
}
