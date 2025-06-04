import { useMemo } from 'react'
import validator from 'email-validator'
import disposableDomains from 'disposable-email-domains'

const SUSPICIOUS_DOMAINS = [
  'tempmail',
  'mailinator',
  '10minutemail',
  'guerrillamail',
  'trashmail',
  'dont-reply.me',
]

const EMAIL_REGEX = /^\S+@\S+\.\S+$/
const SUSPICIOUS_PATTERNS = [
  /^[a-z]\.[a-z]+\d*@gmail\.com$/,   // e.g., m.itaxebandilis@gmail.com
  /^[a-z]{1,2}\d+@\S+$/,             // e.g., s2@dykaya.com
  /^[A-Z][a-z]+\d+@gmail\.com$/,     // e.g., Etta7Olson9739@gmail.com
  /@gmail(?!\.com)/                  // e.g., gmail.ru, gmail.org, etc.
]

export default function SuspiciousEmails({ records, onDelete, emailField }) {
  const filtered = useMemo(() => {
    return records.filter(record => {
      const email = record.fields?.[emailField]?.toLowerCase()
      if (!email || !EMAIL_REGEX.test(email)) return true
      if (!validator.validate(email)) return true

      const domain = email.split('@')[1]
      if (disposableDomains.includes(domain)) return true
      if (SUSPICIOUS_DOMAINS.some(bad => email.includes(bad))) return true
      if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(email))) return true

      return false
    })
  }, [records, emailField])

  const handleBulkDelete = () => {
    filtered.forEach(record => onDelete(record.id))
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-red-600 mb-2">Suspicious Emails</h2>
      {filtered.length > 0 && (
        <button
          onClick={handleBulkDelete}
          className="mb-4 text-sm text-white bg-green hover:bg-red-700 rounded px-3 py-1"
        >
          Delete All
        </button>
      )}
      <ul className="space-y-2">
        {filtered.map((record) => (
          <li key={record.id} className="flex justify-between items-center border p-2 rounded">
            <span>{record.fields?.[emailField] || 'N/A'}</span>
            <button
              className="text-sm text-red-500 hover:underline"
              onClick={() => onDelete(record.id)}
            >
              Delete
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-sm text-gray-500 italic">No suspicious emails found.</li>
        )}
      </ul>
    </section>
  )
}