'use client';

import dynamic from 'next/dynamic'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from 'react'

const DynamicHome = dynamic(() => import('@/components/Home'), {
  ssr: false,
})

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SpeedInsights />
      <DynamicHome />
    </Suspense>
  )
}

