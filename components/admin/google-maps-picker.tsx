"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface DuplicateStore {
  id: string;
  slug: string;
  name: string;
}

interface GoogleMapsPickerProps {
  onPlaceSelect: (placeData: any) => void;
  onCheckDuplicate?: (name: string) => Promise<{ duplicate: boolean; store: DuplicateStore | null }>;
  apiKey: string;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
}

export function GoogleMapsPicker({
  onPlaceSelect,
  onCheckDuplicate,
  apiKey,
  defaultCenter = { lat: 13.7563, lng: 100.5018 }, // Bangkok center
  defaultZoom = 13,
}: GoogleMapsPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Load Google Maps script
    if (!window.google) {
      const existingScript = document.getElementById(
        "google-maps-js",
      ) as HTMLScriptElement | null;

      if (existingScript) {
        existingScript.addEventListener("load", () => {
          if (mounted) initMap();
        });
      } else {
        const script = document.createElement("script");
        script.id = "google-maps-js";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&language=ja&v=beta`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (mounted) initMap();
        };
        script.onerror = () => {
          if (mounted) setLoading(false);
        };
        document.head.appendChild(script);
      }
    } else {
      initMap();
    }

    return () => {
      mounted = false;
      // Cleanup
      if (markerRef.current) markerRef.current.map = null;
      if (infoWindowRef.current) infoWindowRef.current.close();
    };
  }, [apiKey, defaultCenter.lat, defaultCenter.lng, defaultZoom]);

  const initMap = () => {
    if (!mapRef.current) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      mapId: "DEMO_MAP_ID",
    });

    const info = new google.maps.InfoWindow();
    infoWindowRef.current = info;

    mapInstance.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        handleMapClick(event.latLng, mapInstance, info);
      }
    });

    if (searchInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          fields: ["geometry", "name", "formatted_address", "formatted_phone_number", "international_phone_number", "website", "opening_hours", "rating", "user_ratings_total", "place_id"],
          bounds: mapInstance.getBounds() ?? undefined,
          strictBounds: false,
        }
      );

      mapInstance.addListener("bounds_changed", () => {
        autocomplete.setBounds(mapInstance.getBounds() as google.maps.LatLngBounds);
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          mapInstance.setCenter(place.geometry.location);
          mapInstance.setZoom(17);
          handlePlaceSelect(place, mapInstance, info);
        }
      });
    }

    setLoading(false);
  };

  const handleMapClick = (
    location: google.maps.LatLng,
    mapInstance: google.maps.Map,
    info: google.maps.InfoWindow,
  ) => {
    // Use new Places API
    const request = {
      locationRestriction: {
        center: location,
        radius: 50,
      },
      maxResultCount: 1,
      fields: ["displayName", "formattedAddress", "nationalPhoneNumber", "internationalPhoneNumber", "websiteURI", "regularOpeningHours", "location", "rating", "userRatingCount", "id"],
    };

    // @ts-ignore — new Places API
    google.maps.places.Place.searchNearby(request).then(({ places }: { places: any[] }) => {
      if (places && places.length > 0) {
        handlePlaceSelectNew(places[0], mapInstance, info);
      } else {
        info.setContent(`
          <div style="padding: 8px;">
            <strong>クリックした位置</strong><br/>
            緯度: ${location.lat().toFixed(6)}<br/>
            経度: ${location.lng().toFixed(6)}<br/>
            <small>この位置に店舗情報が見つかりませんでした</small>
          </div>
        `);
        info.setPosition(location);
        info.open(mapInstance);
        if (markerRef.current) {
          markerRef.current.map = null;
          markerRef.current = null;
        }
      }
    }).catch(() => {
      info.setContent(`<div style="padding:8px"><small>店舗情報の取得に失敗しました</small></div>`);
      info.setPosition(location);
      info.open(mapInstance);
    });
  };

  const handlePlaceSelectNew = (
    place: any,
    mapInstance: google.maps.Map,
    info: google.maps.InfoWindow,
  ) => {
    // Normalize new Place API shape to match old shape for selectedPlace state
    const normalized: any = {
      name: place.displayName,
      formatted_address: place.formattedAddress,
      formatted_phone_number: place.nationalPhoneNumber || place.internationalPhoneNumber,
      international_phone_number: place.internationalPhoneNumber,
      website: place.websiteURI,
      opening_hours: place.regularOpeningHours
        ? { weekday_text: place.regularOpeningHours.weekdayDescriptions }
        : undefined,
      geometry: { location: place.location },
      rating: place.rating,
      user_ratings_total: place.userRatingCount,
      place_id: place.id,
    };
    handlePlaceSelect(normalized, mapInstance, info);
  };

  const handlePlaceSelect = (
    place: google.maps.places.PlaceResult,
    mapInstance: google.maps.Map,
    info: google.maps.InfoWindow,
  ) => {
    setSelectedPlace(place);

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.map = null;
    }

    // Add new marker
    if (place.geometry?.location) {
      const newMarker = new google.maps.marker.AdvancedMarkerElement({
        position: place.geometry.location,
        map: mapInstance,
        title: place.name,
      });
      markerRef.current = newMarker;

      // Show info window
      const openingHours =
        place.opening_hours?.weekday_text?.join("<br/>") || "情報なし";
      info.setContent(`
        <div style="padding: 8px; max-width: 300px;">
          <strong style="font-size: 16px;">${place.name || "名称不明"}</strong><br/>
          <div style="margin: 8px 0;">
            ${place.formatted_address || ""}
          </div>
          ${place.formatted_phone_number ? `<div>📞 ${place.formatted_phone_number}</div>` : ""}
          ${place.rating ? `<div>⭐ ${place.rating} (${place.user_ratings_total || 0}件)</div>` : ""}
          <div style="margin-top: 8px;">
            <button 
              onclick="document.dispatchEvent(new CustomEvent('useThisPlace'))"
              style="
                background: #4F46E5;
                color: white;
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
              "
            >
              この店舗を使用
            </button>
          </div>
        </div>
      `);
      info.open(mapInstance, newMarker);

      // Center map on place
      mapInstance.setCenter(place.geometry.location);
    }
  };

  useEffect(() => {
    // Listen for custom event from info window button
    const handleUsePlace = async () => {
      if (!selectedPlace) return;

      // Duplicate check before proceeding
      if (onCheckDuplicate && selectedPlace.name) {
        const result = await onCheckDuplicate(selectedPlace.name);
        if (result.duplicate && result.store) {
          // Re-render info window with duplicate warning
          const content = infoWindowRef.current?.getContent() as string || "";
          // Replace button area with warning + options
          const warningHtml = `
            <div style="padding: 8px; max-width: 320px;">
              <strong style="font-size: 15px;">${selectedPlace.name}</strong>
              <div style="margin: 10px 0; padding: 10px; background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; font-size: 13px;">
                ⚠️ <strong>重複の可能性があります</strong><br/>
                「${result.store.name}」が既に登録されています。<br/>
                <a href="/admin/stores/${result.store.id}/edit" target="_blank" style="color:#1D4ED8; text-decoration: underline;">登録済み店舗を確認する</a>
              </div>
              <div style="display:flex; gap:8px; margin-top:8px;">
                <button
                  onclick="document.dispatchEvent(new CustomEvent('useThisPlaceForce'))"
                  style="flex:1; background:#6B7280; color:white; padding:7px 10px; border:none; border-radius:6px; cursor:pointer; font-size:13px;"
                >
                  このまま登録する
                </button>
                <button
                  onclick="document.dispatchEvent(new CustomEvent('cancelUsePlace'))"
                  style="flex:1; background:#E5E7EB; color:#111; padding:7px 10px; border:none; border-radius:6px; cursor:pointer; font-size:13px;"
                >
                  キャンセル
                </button>
              </div>
            </div>
          `;
          infoWindowRef.current?.setContent(warningHtml);
          return;
        }
      }

      fireOnPlaceSelect();
    };

    const fireOnPlaceSelect = () => {
      if (!selectedPlace) return;
      let openingHours = "";
      if (selectedPlace.opening_hours?.weekday_text) {
        openingHours = selectedPlace.opening_hours.weekday_text.join("\n");
      }
      onPlaceSelect({
        name: selectedPlace.name || "",
        address: selectedPlace.formatted_address || "",
        phone:
          selectedPlace.formatted_phone_number ||
          selectedPlace.international_phone_number ||
          "",
        website: selectedPlace.website || "",
        openingHours,
        placeId: selectedPlace.place_id,
        coordinates: selectedPlace.geometry?.location
          ? {
              lat: selectedPlace.geometry.location.lat(),
              lng: selectedPlace.geometry.location.lng(),
            }
          : null,
        rating: selectedPlace.rating,
        reviewCount: selectedPlace.user_ratings_total,
      });
      if (infoWindowRef.current) infoWindowRef.current.close();
    };

    document.addEventListener("useThisPlace", handleUsePlace);
    document.addEventListener("useThisPlaceForce", fireOnPlaceSelect);
    return () => {
      document.removeEventListener("useThisPlace", handleUsePlace);
      document.removeEventListener("useThisPlaceForce", fireOnPlaceSelect);
    };
  }, [selectedPlace, onPlaceSelect, onCheckDuplicate]);

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-linear-to-r from-primary/10 to-primary/5 border-b">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-5 w-5 text-primary" />
          <Label className="text-base font-semibold">店舗を地図から選択</Label>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="店舗名や住所で検索..."
            className="pl-10"
            disabled={loading}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          地図上の任意の場所をクリックするか、検索して店舗を選択してください
        </p>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                地図を読み込んでいます...
              </span>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-125" />
      </div>

      {selectedPlace && (
        <div className="p-4 bg-muted/30 border-t">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{selectedPlace.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {selectedPlace.formatted_address}
              </p>
              {selectedPlace.rating && (
                <div className="flex items-center gap-1 mt-2 text-xs">
                  <span className="text-yellow-600">⭐</span>
                  <span className="font-medium">{selectedPlace.rating}</span>
                  <span className="text-muted-foreground">
                    ({selectedPlace.user_ratings_total || 0}件)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
