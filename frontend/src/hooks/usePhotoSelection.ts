import { useCallback, useEffect, useRef, useState } from 'react'
import type { SelectedPhoto } from '../types/upload'

export interface AddResult {
  added: number
  duplicates: number
  rejected: number
  overflow: number
}

const HEIC_PATTERN = /\.(heic|heif)$/i

export const isHeic = (file: File) =>
  HEIC_PATTERN.test(file.name) || /^image\/hei[cf]$/i.test(file.type)

// HEIC는 브라우저에 따라 type이 비어 있어 확장자로도 판단
function isImage(file: File) {
  return file.type.startsWith('image/') || isHeic(file)
}

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
      const result: AddResult = { added: 0, duplicates: 0, rejected: 0, overflow: 0 }
      const next = [...current]
      for (const file of files) {
        if (!isImage(file)) {
          result.rejected += 1
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
