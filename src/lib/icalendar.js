function toICSDate(dateStr) {
  return dateStr.replace(/-/g, '')
}

function escapeText(text) {
  return String(text).replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n')
}

function foldLine(line) {
  if (line.length <= 75) return line
  const chunks = []
  let rest = line
  while (rest.length > 75) {
    chunks.push(rest.slice(0, 75))
    rest = ' ' + rest.slice(75)
  }
  chunks.push(rest)
  return chunks.join('\r\n')
}

function buildEvent(t) {
  const start = toICSDate(t.date)
  const endDate = new Date(t.end_date || t.date)
  endDate.setDate(endDate.getDate() + 1) // DTEND exclusif en journée entière
  const end = toICSDate(endDate.toISOString().slice(0, 10))

  const descriptionParts = []
  if (t.formats?.length) descriptionParts.push(`Formats : ${t.formats.join(', ')}`)
  if (t.website) descriptionParts.push(`Site : ${t.website}`)
  if (t.register_url) descriptionParts.push(`Inscription : ${t.register_url}`)
  if (t.comment) descriptionParts.push(t.comment)

  const lines = [
    'BEGIN:VEVENT',
    `UID:${t.id}@tri-club-psc`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeText(t.name)}`,
    `LOCATION:${escapeText(t.city)}`,
  ]
  if (descriptionParts.length) {
    lines.push(`DESCRIPTION:${escapeText(descriptionParts.join('\\n'))}`)
  }
  lines.push('END:VEVENT')
  return lines.map(foldLine).join('\r\n')
}

export function buildICS(triathlons) {
  const events = triathlons.filter(t => t.date).map(buildEvent)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tri Club PSC//Calendrier//FR',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadICS(filename, triathlons) {
  const ics = buildICS(triathlons)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
