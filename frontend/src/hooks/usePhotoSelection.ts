import { useCallback, useEffect, useRef, useState } from 'react'
import type { SelectedPhoto } from '../types/upload'

export interface AddResult {
  added: number
  duplicates: number
  rejected: number
  tooLarge: number
  overflow: number
}

// 서버가 받는 형식과 크기
export const PHOTO_TYPES = ['image/jpeg', 'image/png']
const PHOTO_MAX_BYTES = 20 * 1024 * 1024

const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`

export function usePhotoSelection(max: number) {
  const [photos, setPhotos] = useState<SelectedPhoto[]>([])
  const photosRef = useRef<SelectedPhoto[]>([])

  useEffect(
    () => () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    },
    [],
  )

  const add = useCallback(
    (files: File[]): AddResult => {
      const current = photosRef.current
      const keys = new Set(current.map((p) => p.key))
      const result: AddResult = { added: 0, duplicates: 0, rejected: 0, tooLarge: 0, overflow: 0 }
      const next = [...current]
      for (const file of files) {
        if (!PHOTO_TYPES.includes(file.type)) {
          result.rejected += 1
          continue
        }
        if (file.size > PHOTO_MAX_BYTES) {
          result.tooLarge += 1
          continue
        }
        const key = fileKey(file)
        if (keys.has(key)) {
          result.duplicates += 1
          continue
        }
        if (next.length >= max) {
          result.overflow += 1
          continue
        }
        keys.add(key)
        next.push({ key, file, previewUrl: URL.createObjectURL(file) })
        result.added += 1
      }
      photosRef.current = next
      setPhotos(next)
      return result
    },
    [max],
  )

  const remove = useCallback((key: string) => {
    const target = photosRef.current.find((p) => p.key === key)
    if (!target) return
    URL.revokeObjectURL(target.previewUrl)
    const next = photosRef.current.filter((p) => p.key !== key)
    photosRef.current = next
    setPhotos(next)
  }, [])

  return { photos, add, remove }
}
