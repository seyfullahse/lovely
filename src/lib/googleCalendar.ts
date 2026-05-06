// Planora – Google Calendar URL oluşturucu
// Tek tıkla etkinliği Google Calendar'a eklemek için URL üretir

import { format } from 'date-fns'

interface GoogleCalendarEventParams {
  title: string
  description?: string
  startDate: string       // ISO string
  endDate?: string        // ISO string (opsiyonel, yoksa startDate + 1 saat)
  location?: string
}

/**
 * Google Calendar'a etkinlik eklemek için URL oluşturur.
 * Yeni sekmede açıldığında Google Calendar "Etkinlik Ekle" sayfası açılır.
 */
export function buildGoogleCalendarUrl(params: GoogleCalendarEventParams): string {
  const { title, description, startDate, endDate } = params

  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 60 * 60 * 1000) // varsayılan 1 saat

  // Google Calendar tarih formatı: YYYYMMDDTHHmmssZ
  const formatGCal = (d: Date) => format(d, "yyyyMMdd'T'HHmmss")

  const url = new URL('https://calendar.google.com/calendar/render')
  url.searchParams.set('action', 'TEMPLATE')
  url.searchParams.set('text', title)
  url.searchParams.set('dates', `${formatGCal(start)}/${formatGCal(end)}`)

  if (description) {
    url.searchParams.set('details', description)
  }

  if (params.location) {
    url.searchParams.set('location', params.location)
  }

  return url.toString()
}

/**
 * Verilen etkinliği Google Calendar'da açar (yeni sekme).
 */
export function openInGoogleCalendar(params: GoogleCalendarEventParams): void {
  const url = buildGoogleCalendarUrl(params)
  window.open(url, '_blank', 'noopener,noreferrer')
}
