import { useEffect, useMemo, useRef, useState } from 'react';
import { geocodeZip, milesBetween, bearingDegrees } from '../lib/geocode.js';
import { HOSPITALS } from '../lib/hospitals.js';
import { TRANSPORT_RESOURCES } from '../lib/transportResources.js';

const RADIUS_MIN = 5;
const RADIUS_MAX = 100;

function directionsUrl(hospital) {
  const query = `${hospital.address}, ${hospital.city}, ${hospital.state} ${hospital.zip}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function hospitalId(h) {
  return h.zip + h.name;
}

// Subtle CSS-only "3D" tilt: rotates a couple degrees toward the cursor and
// lifts the shadow on hover, flattens back out on mouse leave. No library.
// Used for the standalone "Getting to your appointment" resource cards.
function TiltCard({ children, style, highlighted, onMouseEnter, onMouseLeave }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)');
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(800px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => { setHovering(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => {
        setHovering(false);
        setTransform('perspective(800px) rotateX(0deg) rotateY(0deg)');
        onMouseLeave?.(e);
      }}
      className="card elev-sm"
      style={{
        ...style,
        transform,
        boxShadow: highlighted ? '0 0 0 2px var(--color-accent), var(--shadow-lg)' : hovering ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transition: 'box-shadow 0.25s ease, transform 0.1s ease-out',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

// A row in the continuous hospital list — flat/divided at rest (no gap, no
// shadow, no radius), lifting into a tilted card only on hover, matching the
// reference's list behavior exactly.
function HospitalRow({ h, index, isLast, highlighted, onMouseEnter, onMouseLeave }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)');
  const [hovering, setHovering] = useState(false);
  const active = hovering || highlighted;

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(800px) rotateX(${(-py * 3).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg)`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => { setHovering(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => {
        setHovering(false);
        setTransform('perspective(800px) rotateX(0deg) rotateY(0deg)');
        onMouseLeave?.(e);
      }}
      style={{
        padding: 'var(--space-4)',
        borderBottom: isLast ? 'none' : '1px solid var(--color-divider)',
        borderRadius: active ? 'var(--radius-lg)' : 0,
        background: active ? 'var(--color-bg)' : 'transparent',
        boxShadow: highlighted ? '0 0 0 2px var(--color-accent)' : active ? 'var(--shadow-lg)' : 'none',
        transform: active ? transform : 'none',
        position: 'relative', zIndex: active ? 2 : 1,
        transition: 'box-shadow 0.2s ease, background 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="ep-iso-badge">{index + 1}</span>
          <h4 className="card-title">{h.name}</h4>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--color-accent-700)' }}>{h.distance.toFixed(1)} mi</div>
          <div className="text-muted" style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>from zip center</div>
        </div>
      </div>
      <p className="card-body" style={{ marginTop: 4 }}>{h.address}, {h.city}, {h.state} {h.zip}</p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginTop: 'var(--space-2)' }}>
        {h.phone && <span className="text-muted" style={{ fontSize: 12 }}>{h.phone}</span>}
        <div style={{ flex: 1 }} />
        <a
          href={directionsUrl(h)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ fontSize: 13, padding: '6px 14px' }}
          onClick={(e) => e.stopPropagation()}
        >
          Directions
        </a>
      </div>
    </div>
  );
}

// Lazy-loads the Three.js-based <care-globe> custom element once (a static
// asset in public/, not an npm dependency — see public/care-globe.js). Three
// itself is fetched from a free CDN at runtime by that script, not bundled.
let globeScriptPromise = null;
function loadGlobeScript() {
  if (customElements.get('care-globe')) return Promise.resolve();
  if (!globeScriptPromise) {
    globeScriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = '/care-globe.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('failed to load care-globe.js'));
      document.head.appendChild(s);
    });
  }
  return globeScriptPromise;
}

// Real interactive 3D globe — drag to spin, scroll to zoom, hover/click a
// pin. Pins are placed using each hospital's REAL bearing/distance from the
// patient (bearingDegrees/milesBetween in geocode.js), fed in as plain data;
// the globe component itself has no knowledge of any specific hospital.
function GlobeMap({ patientCoords, hospitals, radius, hoveredId, onHover, zip }) {
  const [ready, setReady] = useState(false);
  const elRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadGlobeScript().then(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const onSelect = (e) => onHover(e.detail);
    const onHoverEvt = (e) => onHover(e.detail);
    el.addEventListener('pin-select', onSelect);
    el.addEventListener('pin-hover', onHoverEvt);
    return () => {
      el.removeEventListener('pin-select', onSelect);
      el.removeEventListener('pin-hover', onHoverEvt);
    };
  }, [ready, onHover]);

  const hospitalsJson = useMemo(() => JSON.stringify(hospitals.map((h) => {
    const bearing = bearingDegrees(patientCoords, h.coords);
    return { id: hospitalId(h), s: h.shortLabel ?? h.name, d: h.distance, dl: h.distance.toFixed(1) + ' mi', a: (bearing * Math.PI) / 180 };
  })), [hospitals, patientCoords]);

  return (
    <div className="ep-iso-card">
      <div className="ep-iso-header">
        <span className="ep-iso-title">Area map</span>
        <div className="ep-iso-legend">
          <span><span className="ep-iso-legend-dot" style={{ background: 'var(--color-accent)' }} />Hospital</span>
          <span><span className="ep-iso-legend-dot" style={{ background: 'var(--color-neutral-800)' }} />You</span>
        </div>
      </div>

      <div className="ep-iso-wrap">
        {ready && (
          <care-globe
            ref={elRef}
            zip={zip}
            radius={radius}
            highlight={hoveredId ?? ''}
            data-hospitals={hospitalsJson}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />
        )}
        <div className="ep-iso-fade" />
        <div className="ep-iso-caption">Drag to spin · scroll to zoom · hover a card or pin to highlight</div>
      </div>
    </div>
  );
}

// Shared hospital-search UI — rendered both inside the patient dashboard
// (Transportation.jsx, wrapped in Sidebar) and on the public, no-login
// Hospital Finder page (pages/HospitalFinder.jsx, wrapped in Navbar/Footer).
// One implementation, two shells, so a fix here applies everywhere.
export default function HospitalFinderPanel({ title = 'Hospital Finder' }) {
  const [zip, setZip] = useState('');
  const [radius, setRadius] = useState(75);
  const [allNearby, setAllNearby] = useState(null); // unfiltered, sorted by distance
  const [searchedZip, setSearchedZip] = useState('');
  const [patientCoords, setPatientCoords] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const hospitalCoordsRef = useRef(null);

  // Radius is applied client-side against the already-geocoded list, so
  // dragging the slider updates results live without a new search.
  const results = allNearby ? allNearby.filter((h) => h.distance <= radius) : null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(zip)) {
      setError('Enter a valid 5-digit zip code.');
      setAllNearby(null);
      return;
    }
    setSearching(true);
    setError('');
    try {
      const coords = await geocodeZip(zip);
      if (!coords) {
        setError("We couldn't find that zip code — please check it and try again.");
        setAllNearby(null);
        setPatientCoords(null);
        return;
      }
      setPatientCoords(coords);
      setSearchedZip(zip);

      if (!hospitalCoordsRef.current) {
        hospitalCoordsRef.current = await Promise.all(
          HOSPITALS.map(async (h) => ({ ...h, coords: await geocodeZip(h.zip) }))
        );
      }

      const withDistance = hospitalCoordsRef.current
        .filter((h) => h.coords)
        .map((h) => ({ ...h, distance: milesBetween(coords, h.coords) }))
        .sort((a, b) => a.distance - b.distance);

      setAllNearby(withDistance);
    } catch {
      setError('Something went wrong looking that up — please try again.');
      setAllNearby(null);
    } finally {
      setSearching(false);
    }
  };

  const changeZip = () => {
    setAllNearby(null);
    setPatientCoords(null);
    setSearchedZip('');
  };

  return (
    <>
      <div className="card elev-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', padding: 'var(--space-3) var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{title}</h1>

        {!allNearby ? (
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="input"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="Zip code, e.g. 70115"
              inputMode="numeric"
              maxLength={5}
              style={{ width: 160 }}
            />
            <button type="submit" className="btn btn-primary" disabled={searching}>
              {searching ? 'Searching…' : 'Find hospitals →'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            <span className="tag tag-outline">
              ZIP {searchedZip}
              <span onClick={changeZip} style={{ marginLeft: 8, cursor: 'pointer', textDecoration: 'underline dashed', textUnderlineOffset: 3 }}>change</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="text-muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Radius</span>
              <input
                type="range"
                className="ep-slider"
                min={RADIUS_MIN}
                max={RADIUS_MAX}
                step={5}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                style={{ width: 160 }}
              />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, color: 'var(--color-accent-700)', minWidth: 52 }}>{radius} mi</span>
            </div>
          </div>
        )}
      </div>
      {error && <div className="ep-err" style={{ marginTop: -12, marginBottom: 'var(--space-4)' }}>{error}</div>}

      {!allNearby && (
        <div className="ep-hope-empty" style={{ marginBottom: 'var(--space-8)' }}>
          <svg viewBox="0 0 96 96" width="72" height="72" fill="none">
            <circle cx="48" cy="48" r="46" fill="var(--color-accent-100)" />
            <path d="M48 70s20-19.9 20-34a20 20 0 1 0-40 0c0 14.1 20 34 20 34z" stroke="var(--color-accent-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="48" cy="36" r="7" stroke="var(--color-accent-500)" strokeWidth="2" />
          </svg>
          <h3>Find a hospital near you</h3>
          <p className="text-muted" style={{ fontSize: 14, margin: 0, maxWidth: 360 }}>
            Enter your zip code above to see nearby hospitals and cancer treatment centers on a map, sorted by distance.
          </p>
        </div>
      )}

      {results && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{results.length} hospital{results.length !== 1 ? 's' : ''} found</h2>
            <span className="text-muted" style={{ fontSize: 13 }}>within {radius} miles · sorted by distance</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: results.length > 0 && patientCoords ? 'minmax(0, 440px) 1fr' : '1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
            {results.length === 0 ? (
              <p className="text-muted" style={{ fontSize: 13 }}>No hospitals within {radius} miles — try a larger radius.</p>
            ) : (
              <div className="card elev-sm" style={{ padding: '0 var(--space-4)' }}>
                {results.map((h, i) => {
                  const id = hospitalId(h);
                  return (
                    <HospitalRow
                      key={id}
                      h={h}
                      index={i}
                      isLast={i === results.length - 1}
                      highlighted={hoveredId === id}
                      onMouseEnter={() => setHoveredId(id)}
                      onMouseLeave={() => setHoveredId(null)}
                    />
                  );
                })}
              </div>
            )}

            {results.length > 0 && patientCoords && (
              <div style={{ position: 'sticky', top: 'var(--space-6)' }}>
                <GlobeMap key={searchedZip} patientCoords={patientCoords} hospitals={results} radius={radius} hoveredId={hoveredId} onHover={setHoveredId} zip={searchedZip} />
              </div>
            )}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Getting to your appointment</h2>
      <div className="ep-resource-grid">
        {TRANSPORT_RESOURCES.map((r) => (
          <TiltCard key={r.name}>
            <span className="card-kicker">{r.scope}</span>
            <h4 className="card-title" style={{ marginTop: 4 }}>{r.name}</h4>
            <p className="card-body">{r.description}</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 13 }}>
              {r.phone && <span>{r.phone}</span>}
              {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer">More info →</a>}
            </div>
          </TiltCard>
        ))}
      </div>
    </>
  );
}
