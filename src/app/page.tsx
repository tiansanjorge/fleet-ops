"use client";

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/features/vehicles/components/Map'), {
  ssr: false,
})

export default function Home() {
  return <Map />
}