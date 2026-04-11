import React, { useEffect, useRef } from 'react';

// BBD University coordinates
const BBD_CENTER = [26.8741, 81.0048];

// Named campus locations
const CAMPUS_LOCATIONS = [
  { name: 'Library', lat: 26.8745, lng: 81.0048 },
  { name: 'Main Cafeteria', lat: 26.8738, lng: 81.0045 },
  { name: 'Block A', lat: 26.8742, lng: 81.0052 },
  { name: 'Block B', lat: 26.8744, lng: 81.0055 },
  { name: 'Block C', lat: 26.8740, lng: 81.0058 },
  { name: 'Block D', lat: 26.8736, lng: 81.0054 },
  { name: 'Sports Ground', lat: 26.8732, lng: 81.0050 },
  { name: 'Main Auditorium', lat: 26.8748, lng: 81.0042 },
  { name: 'Parking Lot A', lat: 26.8743, lng: 81.0038 },
  { name: 'ATM / Bus Stop', lat: 26.8749, lng: 81.0060 },
  { name: 'Admin Block', lat: 26.8750, lng: 81.0045 },
];

const CampusMap = ({ lat, lng, onChange, readOnly = false, height = '350px' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Dynamically load Leaflet JS
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = window.L;
      const map = L.map(mapRef.current).setView(BBD_CENTER, 17);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Campus location markers (grey)
      const greyIcon = L.divIcon({
        html: '<div style="background:#4f46e5;color:white;border-radius:50% 50% 50% 0;width:20px;height:20px;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:8px;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        className: '',
      });

      CAMPUS_LOCATIONS.forEach(loc => {
        L.marker([loc.lat, loc.lng], { icon: greyIcon })
          .addTo(map)
          .bindPopup(`<b>${loc.name}</b><br>BBD University`);
      });

      // Existing pin
      const redIcon = L.divIcon({
        html: '<div style="background:#f43f5e;color:white;border-radius:50% 50% 50% 0;width:28px;height:28px;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 8px rgba(244,63,94,0.6);"></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        className: '',
      });

      if (lat && lng) {
        markerRef.current = L.marker([lat, lng], { icon: redIcon }).addTo(map).bindPopup('📍 Item Location');
        map.setView([lat, lng], 18);
      }

      // Click to place pin (only if not readOnly)
      if (!readOnly) {
        map.on('click', (e) => {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          if (markerRef.current) markerRef.current.remove();
          markerRef.current = L.marker([clickLat, clickLng], { icon: redIcon })
            .addTo(map)
            .bindPopup('📍 Item Location')
            .openPopup();
          if (onChange) onChange(clickLat, clickLng);
        });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
      <div ref={mapRef} style={{ height, width: '100%' }} />
      {!readOnly && (
        <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.4)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          🗺️ Click on the map to drop a pin at the item's exact location
        </div>
      )}
    </div>
  );
};

export { CAMPUS_LOCATIONS, BBD_CENTER };
export default CampusMap;
