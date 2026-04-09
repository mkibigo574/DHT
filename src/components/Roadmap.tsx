'use client'

import { useEffect, useRef } from 'react'

const stops = [
  {
    city: 'Alice Springs',
    region: 'Red Centre',
    tag: 'Opening Heat',
    desc: "Where the journey begins. The ancient heart of Australia holds stories and sounds the world hasn't heard yet.",
    lat: -23.698,
    lng: 133.8807,
    isFinal: false,
    color: '#ff4d94',
  },
  {
    city: 'Tennant Creek',
    region: 'Barkly Region',
    tag: 'Regional Heat',
    desc: 'The crossroads of the Territory. Where the highway meets heritage, voices that deserve to be heard.',
    lat: -19.6479,
    lng: 133.4085,
    isFinal: false,
    color: '#ff4d94',
  },
  {
    city: 'Katherine',
    region: 'Big Rivers Region',
    tag: 'Regional Heat',
    desc: 'Gorge country sets the scene for raw, unfiltered Territory talent. Known for resilience — and now, music.',
    lat: -14.4652,
    lng: 132.2635,
    isFinal: false,
    color: '#ff4d94',
  },
  {
    city: 'Darwin',
    region: 'Top End',
    tag: 'Grand Finale ★',
    desc: "The journey ends where the Territory's heart beats strongest. 3,000 km of music. One electrifying night.",
    lat: -12.4634,
    lng: 130.8456,
    isFinal: true,
    color: '#ffd700',
  },
]

export default function Roadmap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return

    import('leaflet').then((L) => {
      // Fix missing default marker icons in Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Centre on NT with zoom to fit all 4 cities
      const map = L.map(mapRef.current!, {
        center: [-18, 133],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      })

      mapInstanceRef.current = map

      // CartoDB Dark Matter tiles — matches the dark section design
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      // Draw route polyline
      const routeCoords = stops.map((s) => [s.lat, s.lng] as [number, number])
      L.polyline(routeCoords, {
        color: '#ff4d94',
        weight: 3,
        opacity: 0.85,
        dashArray: '10 6',
      }).addTo(map)

      // Custom markers
      stops.forEach((stop) => {
        const size = stop.isFinal ? 18 : 14
        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              width:${size}px;height:${size}px;
              background:${stop.color};
              border:3px solid #fff;
              border-radius:50%;
              box-shadow:0 0 ${stop.isFinal ? 18 : 10}px ${stop.color};
            "></div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })

        const marker = L.marker([stop.lat, stop.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:180px;padding:4px 2px">
              <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${stop.color};margin-bottom:4px">${stop.tag}</div>
              <div style="font-size:1rem;font-weight:800;color:#fff;margin-bottom:2px">${stop.city}</div>
              <div style="font-size:0.75rem;color:rgba(255,255,255,0.5);margin-bottom:8px">${stop.region}</div>
              <div style="font-size:0.8rem;color:rgba(255,255,255,0.75);line-height:1.55">${stop.desc}</div>
            </div>
          `, {
            maxWidth: 240,
            className: 'rm-popup',
          })

        // Open Darwin popup by default
        if (stop.isFinal) marker.openPopup()
      })

      // Fit map to show all markers with padding
      map.fitBounds(
        stops.map((s) => [s.lat, s.lng] as [number, number]),
        { padding: [40, 40] },
      )
    })

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <section className="section roadmap section--dark" id="roadmap">
      <div className="roadmap-bg-glow" />

      <div className="container">
        <div className="section-header on-dark">
          <p className="section-tag">The Journey</p>
          <h2 className="section-title" style={{ color: '#fff' }}>
            4 Regions. 3,000 Kilometres.
            <br />
            <span className="gradient-text">One Grand Finale.</span>
          </h2>
          <p className="section-subtitle" style={{ color: 'var(--text-muted-dark)' }}>
            From the Red Centre to the Top End — we&apos;re bringing the stage to every corner of
            the Territory.
          </p>
        </div>

        {/* Real map */}
        <div className="rm-map-wrap">
          <div ref={mapRef} className="rm-real-map" />
        </div>

        {/* Description cards */}
        <div className="rm-cards-scroll">
          <div className="rm-cards">
            {stops.map((s) => (
              <div key={s.city} className={`rm-card${s.isFinal ? ' rm-card--final' : ''}`}>
                <div className="rm-card-city">{s.city}</div>
                <span className={`tc-tag${s.isFinal ? ' final-tag' : ''}`}>{s.tag}</span>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
