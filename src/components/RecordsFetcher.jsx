import { useEffect } from 'react'

export default function RecordsFetcher({ credentials, onRecordsFetched }) {
  useEffect(() => {
    const fetchAllRecords = async ({ apiKey, baseId, tableName, viewName }) => {
      let allRecords = []
      let offset = null

      do {
        const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableName}`)
        url.searchParams.set('pageSize', '100')
        if (viewName) url.searchParams.set('view', viewName)
        if (offset) url.searchParams.set('offset', offset)

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${apiKey}` },
        })

        const json = await res.json()
        allRecords = allRecords.concat(json.records)
        offset = json.offset
      } while (offset)

      return allRecords
    }

    const fetchData = async () => {
      const all = await fetchAllRecords(credentials)
      onRecordsFetched(all)
    }

    fetchData()
  }, [credentials])

  return null
}
