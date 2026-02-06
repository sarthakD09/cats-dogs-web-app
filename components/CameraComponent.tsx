'use client'

import { useEffect, useRef, useState } from 'react'
import { PREDICT_URL } from '@/lib/api'

export const CameraComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [prediction, setPrediction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [useRear, setUseRear] = useState(true)


  useEffect(() => {
    startCamera()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((t) => t.stop())
        videoRef.current.srcObject = null
      }
    }
  }, [useRear])

  const startCamera = async () => {
  try {
    // stop any existing stream before starting a new one
    if (videoRef.current && videoRef.current.srcObject) {
      const oldTracks = (videoRef.current.srcObject as MediaStream).getTracks()
      oldTracks.forEach((t) => t.stop())
      videoRef.current.srcObject = null
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
      facingMode: useRear ? { exact: 'environment' } : 'user'
      }

    })

    if (videoRef.current) {
      videoRef.current.srcObject = stream
      try {
        await videoRef.current.play()
      } catch (e) {
        // ignore play errors
      }
    }
  } catch (err) {
    console.error('Camera error:', err)

    // fallback if exact fails
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      try {
        await videoRef.current.play()
      } catch (e) {
        // ignore
      }
    }
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
        className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
      >
        Capture & Predict
      </button>
      <button type="button" onClick={() => setUseRear((prev) => !prev)} 
        className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
       Switch Camera
      </button>


      {loading && <p>Predicting...</p>}
      {prediction && <h2 className="text-xl font-bold">{prediction}</h2>}
    </div>
  )
}
