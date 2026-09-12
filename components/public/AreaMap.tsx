"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const AREAS = [
  { slug: "ekkamai",              name: "エカマイ",       lat: 13.7197, lng: 100.5853 },
  { slug: "thong-lo",             name: "トンロー",       lat: 13.7278, lng: 100.5793 },
  { slug: "phrom-phong",          name: "プロンポン",     lat: 13.7305, lng: 100.5697 },
  { slug: "asok",                 name: "アソーク",       lat: 13.7360, lng: 100.5601 },
  { slug: "nana",                 name: "ナナ",           lat: 13.7400, lng: 100.5540 },
  { slug: "phloen-chit",          name: "プルンチット",   lat: 13.7440, lng: 100.5468 },
  { slug: "chit-lom",             name: "チットロム",     lat: 13.7460, lng: 100.5400 },
  { slug: "silom",                name: "シーロム",       lat: 13.7244, lng: 100.5347 },
  { slug: "sathon",               name: "サトーン",       lat: 13.7220, lng: 100.5280 },
  { slug: "riverside",            name: "リバーサイド",   lat: 13.7200, lng: 100.5140 },
  { slug: "chinatown",            name: "チャイナタウン", lat: 13.7400, lng: 100.5100 },
  { slug: "grand-palace-khaosan", name: "王宮・カオサン", lat: 13.7540, lng: 100.4930 },
  { slug: "ratchada",             name: "ラチャダー",     lat: 13.7620, lng: 100.5680 },
  { slug: "on-nut",               name: "オンヌット",     lat: 13.7020, lng: 100.5990 },
  { slug: "phra-khanong",         name: "プラカノン",     lat: 13.7130, lng: 100.5920 },
];

export default function AreaMap({ apiKey }: { apiKey: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    const scriptId = "google-maps-area";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=ja`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else if ((window as any).google?.maps) {
      initMap();
    }

    function initMap() {
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 13.7300, lng: 100.5400 },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "simplified" }] },
        ],
      });

      AREAS.forEach((area) => {
        const marker = new (window as any).google.maps.Marker({
          position: { lat: area.lat, lng: area.lng },
          map,
          title: area.name,
          icon: {
            path: (window as any).google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#004098",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: `<div style="font-size:13px;font-weight:bold;color:#004098;cursor:pointer;padding:2px 4px">${area.name}</div>`,
        });

        marker.addListener("mouseover", () => infoWindow.open(map, marker));
        marker.addListener("mouseout", () => infoWindow.close());
        marker.addListener("click", () => router.push(`/area/${area.slug}`));
      });
    }
  }, [apiKey, router]);

  if (!apiKey) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-[#d9e1ed] shadow-sm">
      <div ref={mapRef} style={{ height: "400px", width: "100%" }} />
    </div>
  );
}
