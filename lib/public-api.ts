const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

interface PaginatedData<T> {
  items: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  const json: ApiResponse<T> = await res.json()
  if (!json.success) {
    throw new Error(json.error || 'API request failed')
  }
  return json.data
}

export async function getPlaces(params?: Record<string, string>) {
  const query = new URLSearchParams(params).toString()
  return fetchApi<PaginatedData<Place>>(`/api/v1/places${query ? `?${query}` : ''}`)
}

export async function getPlace(slug: string, locale = 'ja') {
  return fetchApi<Place>(`/api/v1/places/${slug}?locale=${locale}`)
}

export async function getAreas(locale = 'ja') {
  return fetchApi<Area[]>(`/api/v1/areas?locale=${locale}`)
}

export async function getCategories(locale = 'ja') {
  return fetchApi<Category[]>(`/api/v1/categories?locale=${locale}`)
}

export async function getScenes(locale = 'ja') {
  return fetchApi<Scene[]>(`/api/v1/scenes?locale=${locale}`)
}

export async function getTags(locale = 'ja') {
  return fetchApi<Tag[]>(`/api/v1/tags?locale=${locale}`)
}

export async function getArticles(params?: Record<string, string>) {
  const query = new URLSearchParams(params).toString()
  return fetchApi<PaginatedData<Article>>(`/api/v1/articles${query ? `?${query}` : ''}`)
}

export async function getArticle(slug: string, locale = 'ja') {
  return fetchApi<Article>(`/api/v1/articles/${slug}?locale=${locale}`)
}

export async function submitInquiry(data: InquiryInput) {
  return fetchApi<{ id: string }>('/api/v1/inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Types based on Prisma schema + API response shapes
export interface Translation {
  id: string
  locale: string
  name: string
  description?: string
  excerpt?: string
  content?: string
  title?: string
  coverUrl?: string
}

export interface PlaceImage {
  id: string
  url: string
  alt: string | null
  isMain: boolean
  order: number
}

export interface Place {
  id: string
  slug: string
  type: 'NORMAL' | 'NIGHT'
  isVisible: boolean
  phone: string | null
  address: string | null
  openingHours: string | null
  nearestStation: string | null
  regularHoliday: string | null
  languages: string[]
  website: string | null
  snsInstagram: string | null
  snsX: string | null
  snsFacebook: string | null
  snsLine: string | null
  snsTiktok: string | null
  showSpotlight: boolean
  showNightNavi: boolean
  viewCount: number
  translations: Translation[]
  area: Area | null
  categories: { category: Category }[]
  scenes?: { scene: Scene }[]
  images: PlaceImage[]
  tags: { tag: Tag }[]
}

export interface Area {
  id: string
  slug: string
  displayOrder: number
  enabled: boolean
  imageUrl?: string | null
  description?: string | null
  ratingJapanese?: number
  ratingNightlife?: number
  ratingBeginner?: number
  ratingNightCaution?: number
  translations: Translation[]
  _count?: { places: number }
}

export interface Category {
  id: string
  slug: string
  displayOrder: number
  enabled: boolean
  translations: Translation[]
  _count?: { places: number }
}

export interface Scene {
  id: string
  displayOrder: number
  enabled: boolean
  translations: Translation[]
  _count?: { places: number }
}

export interface Tag {
  id: string
  slug: string
  translations: Translation[]
}

export interface Article {
  id: string
  slug: string
  type: 'NEWS' | 'GUIDE'
  published: boolean
  featured: boolean
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW' | null
  newsCategory: 'ALL' | 'LIFE' | 'TRANSPORT' | 'BUSINESS' | 'NIGHT' | 'EVENT' | 'SYSTEM' | null
  viewCount: number
  publishedAt: string | null
  translations: Translation[]
  tags: { tag: { id: string; slug: string; translations: { locale: string; name: string }[] } }[]
}

export interface InquiryInput {
  type: 'STORE_LISTING' | 'GENERAL'
  name: string
  email: string
  phone?: string
  storeName?: string
  subject: string
  message: string
}
