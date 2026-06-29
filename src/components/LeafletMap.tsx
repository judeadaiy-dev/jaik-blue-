import { useEffect, useRef, useState } from "react";
import type { LatLngTuple, Map as LeafletMapType, Marker as LeafletMarker } from "leaflet";

interface Props {
  center: LatLngTuple;
  zoom?: number;
  draggable?: boolean;
  onChange?: (lat: number, lng: number) => void;
  markers?: Array<{ lat: number; lng: number; label?: string; color?: string }>;
  height?: number | string;
  className?: string;
}

// Lightweight Leaflet wrapper that loads only on the client
export function LeafletMap({ center, zoom = 14, draggable, onChange, markers = [], height = 280, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMapType | null>(null);
  const mainMarker = useRef<LeafletMarker | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === "undefined" || !ref.current) return;
      const L = await import("leaflet");
      if (cancelled || !ref.current) return;
      // Fix default icon paths (Vite)
      // @ts-expect-error private
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      const map = L.map(ref.current).setView(center, zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      const marker = L.marker(center, { draggable: !!draggable }).addTo(map);
      mainMarker.current = marker;
      if (draggable && onChange) {
        marker.on("dragend", () => {
          const ll = marker.getLatLng();
          onChange(ll.lat, ll.lng);
        });
        map.on("click", (e) => {
          marker.setLatLng(e.latlng);
          onChange(e.latlng.lat, e.latlng.lng);
        });
      }
      markers.forEach((m) => {
        L.marker([m.lat, m.lng], { title: m.label }).addTo(map).bindPopup(m.label ?? "");
      });
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center / marker when props change
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.setView(center, mapRef.current.getZoom());
    mainMarker.current?.setLatLng(center);
  }, [center[0], center[1], ready]);

  return <div ref={ref} className={className} style={{ height, width: "100%", borderRadius: 20, overflow: "hidden", zIndex: 0 }} />;
}