# Google Maps Integration Guide

## Current Implementation ✅

The Google Maps integration is **fully functional** with an **interactive map interface**!

### Features

✅ **Interactive Map Component**
- Full Google Maps interface embedded in the UI
- Click anywhere on the map to select a place
- Search box for finding specific locations
- Auto-detects nearby businesses when you click

✅ **Automatic Data Extraction**
- Store name (店舗名)
- Full address (住所)
- Phone number (電話番号)
- Website (WEBサイト)
- Opening hours (営業時間)
- Rating & review count (評価)
- GPS coordinates (座標)

✅ **Smart User Experience**
- Visual place selection with markers
- Info windows showing place details
- One-click to use selected place
- Auto-fills all form fields
- No need to paste URLs!

## Setup

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select existing
3. Enable these APIs:
   - **Maps JavaScript API** (for the map display)
   - **Places API** (for place details)
4. Create API key
5. **Important**: Restrict your API key for security:
   - Set application restrictions (HTTP referrers)
   - Add your domain: `localhost:3000/*`, `yourdomain.com/*`
   - Restrict API key to: Maps JavaScript API, Places API

### 2. Add API Keys to Environment

Add to your `.env` or `.env.local` file:

```env
# Server-side key (for backend extraction)
GOOGLE_MAPS_API_KEY=your_api_key_here

# Client-side key (for interactive map)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Note**: You can use the same key for both, but make sure it has proper restrictions set in Google Cloud Console.

### 3. Restart Development Server

```bash
npm run dev
```

## How to Use

### For Store Creation/Edit:

1. Navigate to the Google Maps section in the form
2. Click "地図を開く" (Open Map) button
3. The interactive map will appear
4. **Option 1**: Click directly on any business location on the map
5. **Option 2**: Use the search box to find a specific place
6. An info window will show the place details
7. Click "この店舗を使用" (Use This Store) in the info window
8. All form fields are automatically filled!
9. Review the data and save

## Architecture

### Components

**Frontend:**
- `components/admin/google-maps-picker.tsx` - Interactive map component
- `app/admin/(authenticated)/stores/new/page.tsx` - Store creation with map
- `app/admin/(authenticated)/stores/[id]/edit/page.tsx` - Store edit with map

**Backend:**
- `app/api/v1/admin/google-maps/extract/route.ts` - URL extraction endpoint (legacy support)

### Data Flow

1. User opens interactive map
2. Google Maps JavaScript API loads the map
3. User clicks on a location or searches
4. Places API finds nearby businesses
5. User selects a place
6. Component extracts place details from Places API
7. Data is passed to parent component
8. Form fields are auto-filled
9. User reviews and saves

## API Usage & Costs

### Free Tier
Google Maps provides $200 free credit per month, which includes:
- **Maps JavaScript API**: $7 per 1000 loads
- **Places API - Place Details**: $17 per 1000 requests
- **Places API - Nearby Search**: $32 per 1000 requests

### Typical Monthly Usage for Small Site
- 100 store creations/edits per month
- Each requires: 1 map load + 1-2 API calls
- Estimated cost: $3-5/month (well within free tier)

### Cost Optimization Tips
1. Set daily quota limits in Google Cloud Console
2. Enable billing alerts
3. Restrict API key to prevent abuse
4. Cache place data when possible

## Features in Detail

### Interactive Map
- **Default center**: Bangkok (13.7563, 100.5018)
- **Default zoom**: 13
- **Controls**: Zoom, Street View, Map Type, Fullscreen

### Place Search
- Search by name, address, or category
- Results biased to current map view
- Auto-complete suggestions
- Jump to selected place

## Security Considerations

When implementing Google Places API:

1. **Store API key in environment variables** (never in code)
2. **Restrict API key** to specific APIs and domains
3. **Implement rate limiting** to prevent abuse
4. **Monitor API usage** in Google Cloud Console
5. **Set up billing alerts** to avoid unexpected charges

## Future Enhancements

Possible improvements:

- [ ] Support multiple languages for extraction
- [ ] Extract and save photos automatically
- [ ] Show Google Maps preview in the form
- [ ] Validate extracted data before auto-fill
- [ ] Allow user to select which fields to auto-fill
- [ ] Cache extracted data to reduce API calls
- [ ] Batch processing for multiple stores
- [ ] Integration with other map services (Apple Maps, Bing Maps)

## Support

For questions or issues:
1. Check the API route comments for implementation hints
2. Review Google Places API documentation
3. Test with various URL formats
4. Monitor browser console for errors
