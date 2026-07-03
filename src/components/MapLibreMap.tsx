import { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MLMap, Marker as MLMarker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MarkerInput {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
}

interface Props {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  draggable?: boolean;
  onChange?: (lat: number, lng: number) => void;
  markers?: MarkerInput[];
  height?: number | string;
  className?: string;
}

// Free MapLibre style — CARTO Voyager (no API key). Looks close to Google Maps.
const STYLE_URL = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

export function MapLibreMap({
  center,
  zoom = 14,
  draggable,
  onChange,
  markers = [],
  height = 280,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const mainMarker = useRef<MLMarker | null>(null);
  const extraMarkers = useRef<MLMarker[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: STYLE_URL,
      center: [center[1], center[0]],
      zoom,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");

    const marker = new maplibregl.Marker({ color: "#0EA5E9", draggable: !!draggable })
      .setLngLat([center[1], center[0]])
      .addTo(map);
    mainMarker.current = marker;

    if (draggable && onChange) {
      marker.on("dragend", () => {
        const ll = marker.getLngLat();
        onChange(ll.lat, ll.lng);
      });
      map.on("click", (e) => {
        marker.setLngLat(e.lngLat);
        onChange(e.lngLat.lat, e.lngLat.lng);
      });
    }

    mapRef.current = map;
    map.on("load", () => setReady(true));
    return () => {
      extraMarkers.current.forEach((m) => m.remove());
      extraMarkers.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center / main marker on prop change
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.easeTo({ center: [center[1], center[0]], duration: 500 });
    mainMarker.current?.setLngLat([center[1], center[0]]);
  }, [center[0], center[1], ready]);

  // Sync extra markers
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    extraMarkers.current.forEach((m) => m.remove());
    extraMarkers.current = markers.map((m) => {
      const mk = new maplibregl.Marker({ color: m.color ?? "#EF4444" })
        .setLngLat([m.lng, m.lat])
        .addTo(mapRef.current!);
      if (m.label) mk.setPopup(new maplibregl.Popup({ offset: 24 }).setText(m.label));
      return mk;
    });
  }, [markers, ready]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ height, width: "100%", borderRadius: 20, overflow: "hidden" }}
    />
  );
}