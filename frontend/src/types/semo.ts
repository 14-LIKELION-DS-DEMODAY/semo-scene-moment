export interface CreateSemoRequest {
  name: string
  nickname: string
  coverImage?: File | null
}

export interface Semo {
  id: string
  name: string
  nickname: string
  coverImageUrl: string | null
}
