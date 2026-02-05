'use client'

import { Info, Trash } from 'phosphor-react'
import { useCallback, useState } from 'react'
import { Upload, UploadBody, UploadFooter, UploadIcon, UploadText } from 'keep-react'
import Image from 'next/image'
import { PREDICT_URL } from '@/lib/api'

type PredictionResponse = {
  prediction: string
}

export const UploadComponent = () => {
  const [files, setFiles] = useState<File[]>([])
  const [prediction, setPrediction] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return

    setFiles(acceptedFiles)
    setPrediction(null)

    const formData = new FormData()
    formData.append('image', acceptedFiles[0])

    try {
      setLoading(true)

      const res = await fetch(PREDICT_URL, {
        method: 'POST',
        body: formData,
      })

      const data: PredictionResponse = await res.json()
      setPrediction(data.prediction)
    } catch (err) {
      console.error(err)
      setPrediction('Error predicting image')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <Upload options={{ onDrop }}>
      <UploadBody>
        <UploadIcon>
          <Image src="/images/icon/folder.svg" alt="folder" height={28} width={28} />
        </UploadIcon>
        <UploadText>
          <p className="text-body-3 font-medium">Drag & Drop or Choose File</p>
          <p className="text-body-4">Upload a cat or dog image</p>
        </UploadText>
      </UploadBody>

      <UploadFooter isFileExists={files.length > 0}>
        <p className="my-2 flex items-center gap-1">
          <Info size={16} />
          Uploaded Files
        </p>

        <ul className="space-y-1">
          {files.map((file) => (
            <li
              key={file.name}
              className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded"
            >
              {file.name}
              <Trash size={16} color="red" />
            </li>
          ))}
        </ul>

        {loading && <p className="mt-4 font-semibold">Predicting...</p>}

        {prediction && !loading && (
          <div className="mt-4 text-xl font-bold">
            Prediction: {prediction}
          </div>
        )}
      </UploadFooter>
    </Upload>
  )
}
