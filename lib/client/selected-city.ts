export const SELECTED_CITY_COOKIE = 'imoti_selected_city'
const MAX_AGE = 60 * 60 * 24 * 30

export function setSelectedCity(slug: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${SELECTED_CITY_COOKIE}=${encodeURIComponent(slug)};path=/;max-age=${MAX_AGE};SameSite=Lax`
}

export function getSelectedCityFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${SELECTED_CITY_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
