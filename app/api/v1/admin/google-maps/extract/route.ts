import { NextRequest } from "next/server"
import { success, error } from "@/lib/api-response"
import { requirePermission } from "@/lib/permissions"
import { errors } from "@/lib/errors"

/**
 * Extract place information from Google Maps URL
 * This endpoint parses Google Maps URLs and extracts place data
 * 
 * Future implementation can use:
 * - Google Maps Places API
 * - Web scraping (with proper rate limiting)
 * - Third-party services
 */
export async function POST(req: NextRequest) {
  try {
    await requirePermission("stores", "canCreate")

    const body = await req.json()
    const { url } = body

    if (!url) {
      throw errors.badRequest("URLが必要です")
    }

    // Validate Google Maps URL
    const isValidUrl = url.includes("google.com/maps") || 
                       url.includes("goo.gl/maps") ||
                       url.includes("maps.app.goo.gl")

    if (!isValidUrl) {
      throw errors.badRequest("有効なGoogle MapsのURLを入力してください")
    }

    // Extract place ID from URL if present
    let placeId = null
    const placeIdMatch = url.match(/place\/([^\/]+)/)
    const ftidMatch = url.match(/!1s([^!]+)/)
    const cidMatch = url.match(/!3m1!1s([^!]+)/)
    
    if (placeIdMatch) {
      placeId = placeIdMatch[1]
    } else if (ftidMatch) {
      placeId = ftidMatch[1]
    } else if (cidMatch) {
      placeId = cidMatch[1]
    }

    // Extract coordinates if present
    let coordinates = null
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (coordMatch) {
      coordinates = {
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[2])
      }
    }

    // TODO: Implement actual data extraction
    // Option 1: Use Google Places API (requires API key and billing setup)
    // Option 2: Use web scraping (requires careful rate limiting)
    // Option 3: Use third-party service
    
    // For now, we'll extract what we can from the URL itself
    // and return mock data structure that frontend expects
    
    // Extract name from URL if encoded
    let name = ""
    if (placeIdMatch && placeIdMatch[1]) {
      // Decode URL-encoded name
      try {
        name = decodeURIComponent(placeIdMatch[1].replace(/\+/g, " "))
        // Remove coordinate patterns
        name = name.split("@")[0].trim()
      } catch (e) {
        // Failed to decode
      }
    }

    // Try to fetch from Google Places API if key is available
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    
    if (apiKey && placeId) {
      try {
        // Use Google Places API Place Details
        const fieldsToFetch = [
          'name',
          'formatted_address',
          'formatted_phone_number',
          'international_phone_number',
          'website',
          'opening_hours',
          'geometry',
          'rating',
          'user_ratings_total',
          'price_level'
        ].join(',')

        const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fieldsToFetch}&key=${apiKey}&language=ja`
        
        const response = await fetch(apiUrl)
        const data = await response.json()

        if (data.status === 'OK' && data.result) {
          const place = data.result
          
          // Format opening hours
          let openingHours = ""
          if (place.opening_hours?.weekday_text) {
            openingHours = place.opening_hours.weekday_text.join('\n')
          }

          // Convert price_level (0-4) to THB price range estimate
          // 0 = Free, 1 = Inexpensive (~<200THB), 2 = Moderate (~200-500THB),
          // 3 = Expensive (~500-1500THB), 4 = Very Expensive (~>1500THB)
          const priceLevelMap: Record<number, { from: number; to: number }> = {
            0: { from: 0,    to: 0    },
            1: { from: 100,  to: 200  },
            2: { from: 200,  to: 500  },
            3: { from: 500,  to: 1500 },
            4: { from: 1500, to: 5000 },
          }
          const priceLevel = typeof place.price_level === 'number' ? place.price_level : null
          const priceRange = priceLevel !== null ? priceLevelMap[priceLevel] : null

          return success({
            data: {
              name: place.name || name,
              address: place.formatted_address || "",
              phone: place.formatted_phone_number || place.international_phone_number || "",
              website: place.website || "",
              openingHours: openingHours,
              placeId,
              coordinates: place.geometry?.location || coordinates,
              rating: place.rating,
              reviewCount: place.user_ratings_total,
              priceLevel,
              priceFrom: priceRange?.from ?? null,
              priceTo:   priceRange?.to   ?? null,
            },
            message: `${place.name}の情報を取得しました`
          })
        } else if (data.status === 'INVALID_REQUEST') {
          // Place ID might be invalid, fall back to URL parsing
          throw new Error('Place IDが無効です')
        } else if (data.status === 'REQUEST_DENIED') {
          throw new Error('Google Places APIキーが無効です')
        }
      } catch (apiError: any) {
        // Log error but continue with URL parsing fallback
        console.error('Google Places API error:', apiError)
        // Don't throw, fall through to URL parsing
      }
    }

    // Fallback: Return what we extracted from URL
    const extractedData = {
      data: {
        name: name || "",
        address: "",
        phone: "",
        website: "",
        openingHours: "",
        placeId,
        coordinates,
        priceLevel: null,
        priceFrom: null,
        priceTo: null,
      },
      message: apiKey 
        ? (name 
          ? `店舗名を検出しました: ${name}。Place IDからの詳細取得は失敗しました。`
          : "URLを解析しましたが、詳細情報を取得できませんでした。")
        : (name
          ? `店舗名を検出しました: ${name}。Google Places APIキーを設定すると、住所や電話番号なども自動取得できます。`
          : "URLを解析しました。Google Places APIキー（GOOGLE_MAPS_API_KEY）を.env.localに設定すると、詳細情報を自動取得できます。")
    }

    return success(extractedData)
  } catch (err) {
    return error(err)
  }
}
