'use client'

import { useEffect, useRef, useState } from 'react'
import { PREDICT_URL } from '@/lib/api'

export const CameraComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [prediction, setPrediction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    startCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Camera error:', err)
    }
  }

  const captureAndPredict = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg')
    )

    if (!blob) return

    const formData = new FormData()
    formData.append('image', blob)

    try {
      setLoading(true)

      const res = await fetch(PREDICT_URL, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      setPrediction(data.prediction)
    } catch (err) {
      console.error(err)
      setPrediction('Error predicting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <video ref={videoRef} autoPlay playsInline className="w-80 rounded-lg border" />
      <canvas ref={canvasRef} hidden />

      <button
        onClick={captureAndPredict}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Capture & Predict
      </button>

      {loading && <p>Predicting...</p>}
      {prediction && <h2 className="text-xl font-bold">{prediction}</h2>}
    </div>
  )
}
