'use client'

import { useState } from 'react'
import { UploadComponent } from '@/components/UploadComponent'
import { CameraComponent } from '@/components/CameraComponent'

export default function Home() {
  const [mode, setMode] = useState<'choice' | 'upload' | 'camera'>('choice')

  if (mode === 'upload') {
    return (
      <div className="p-10 text-center">
        <button
          onClick={() => setMode('choice')}
          className="mb-6 underline text-blue-600"
        >
          ← Back
        </button>
        <UploadComponent />
      </div>
    )
  }

  if (mode === 'camera') {
    return (
      <div className="p-10 text-center">
        <button
          onClick={() => setMode('choice')}
          className="mb-6 underline text-blue-600"
        >
          ← Back
        </button>
        <CameraComponent />
      </div>
    )
  }

  // Default choice screen
  return (
    <div className="p-10 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold">Cat vs Dog Classifier</h1>

      <button
        onClick={() => setMode('camera')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        📷 Click Photo
      </button>

      <button
        onClick={() => setMode('upload')}
        className="px-6 py-3 bg-green-600 text-white rounded-lg"
      >
        🖼️ Upload from Gallery
      </button>
    </div>
  )
}
