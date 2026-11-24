import type { Moment } from './moment'

export interface MatchingResult {
  moments: Moment[]
  totalPhotos: number
  unclassifiedCount: number
}

export interface UnclassifiedPhoto {
  id: string
  url?: string
}

export interface PhotoAssignment {
  photoId: string
  momentId: string
}
