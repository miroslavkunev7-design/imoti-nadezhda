import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Под наем' }

/** Rentals use the same listing grid with a rent filter when available. */
export default function RentPage() {
  redirect('/buy?listing=rent')
}
