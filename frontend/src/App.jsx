import { useState, useEffect } from 'react'
import {
  Leaf, Plus, Package, MapPin, BarChart3, Bookmark, HelpCircle,
  LogOut, Bell, ChevronRight, ChevronLeft, Check,
  AlertTriangle, Wind, Anchor, Train, Truck, Plane,
  Clock, DollarSign, Activity, Info, Navigation, Globe,
  Box, Cpu, Settings, ShoppingBag, UtensilsCrossed, MoreHorizontal,
  CheckCircle, Map
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid
} from 'recharts'

/* ── API helpers ── */
const API = {
  data:     '/api/data',
  decision: '/api/decision',
  analytics: '/api/analytics',
}
async function get(base, path) {
  try {
    const r = await fetch(base + path)
    if (!r.ok) return null
    return r.json()
  } catch { return null }
}
async function post(base, path, body) {
  try {
    const r = await fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!r.ok) return null
    return r.json()
  } catch { return null }
}

const fmtN  = (n, d = 0) => n == null ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: d })
const fmtUSD = n => n == null ? '—' : '$' + fmtN(n)

/* ═══════════════════════════════ WORLD MAP SVG ══════════════════════════════ */
// toXY: converts lon/lat to SVG coords in 900×440 viewBox
const toXY = (lon, lat) => [(lon + 180) * 2.5, (90 - lat) * 2.5]

function WorldMapSVG({ showRoutes = true }) {
  // Key cities
  const shanghai   = toXY(121.47, 31.23)   // [753,147]
  const hamburg    = toXY(9.99,  53.55)    // [475, 91]
  const alashankou = toXY(82.58, 45.18)    // [656,112]
  const cape       = toXY(18.47, -34.36)   // [496,311]
  const suez       = toXY(32.55, 30.5)     // [531,149]
  const hormuz     = toXY(56.5,  26.5)     // [591,159]

  const c = arr => arr.join(',')

  return (
    <svg viewBox="0 0 900 440" style={{ width: '100%', height: '100%' }}>
      {/* Ocean */}
      <rect width="900" height="440" fill="#c8cce8" />

      {/* ── Continent fills ── */}
      {/* North America */}
      <path d="M30,52 L105,32 L185,28 L315,88 L290,145 L275,168 L248,192 L236,212 L220,200 L210,168 L185,162 L162,188 L138,122 L80,78 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />
      {/* Greenland */}
      <path d="M308,15 L362,12 L405,68 L368,78 L322,65 L310,40 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />
      {/* South America */}
      <path d="M168,252 L245,248 L272,280 L278,332 L252,392 L205,402 L162,375 L148,330 L155,282 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />
      {/* Europe */}
      <path d="M422,62 L462,52 L488,48 L502,54 L515,68 L528,68 L530,84 L518,92 L498,90 L482,100 L465,118 L445,120 L428,108 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />
      {/* Scandinavia */}
      <path d="M458,54 L482,46 L494,66 L480,76 L462,72 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />
      {/* UK */}
      <path d="M408,72 L420,66 L426,78 L418,93 L408,88 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />
      {/* Africa */}
      <path d="M415,130 L508,122 L532,150 L540,230 L520,292 L480,320 L442,314 L408,280 L398,218 L405,162 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />
      {/* Middle East */}
      <path d="M522,122 L572,115 L610,134 L618,160 L600,170 L572,164 L538,150 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />
      {/* Asia main */}
      <path d="M512,52 L625,40 L722,38 L795,52 L820,90 L805,120 L775,134 L752,150 L722,155 L692,162 L658,162 L628,158 L610,170 L600,162 L614,152 L620,142 L600,134 L572,164 L540,150 L530,84 L528,68 L515,68 L512,52 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />
      {/* Indian subcontinent */}
      <path d="M572,148 L610,142 L622,170 L615,208 L592,224 L572,207 L562,174 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />
      {/* SE Asia */}
      <path d="M694,158 L732,150 L752,168 L746,182 L720,180 L698,168 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />
      {/* Japan */}
      <path d="M762,90 L780,84 L792,102 L780,114 L762,110 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />
      {/* Australia */}
      <path d="M668,270 L764,257 L788,284 L782,330 L748,347 L696,344 L666,320 L662,287 Z"
        fill="#d8d8e8" stroke="#b0b0c8" strokeWidth="0.8" />

      {showRoutes && <>
        {/* ── Route 1: Original via Suez (danger dashed) ── */}
        <path
          d={`M ${c(shanghai)} C 740,200 700,240 650,240 C 600,240 560,180 ${c(suez)} C 510,130 488,96 ${c(hamburg)}`}
          fill="none" stroke="rgba(220,60,60,0.85)" strokeWidth="2.2" strokeDasharray="8,5" opacity="0.85"
        />

        {/* ── Route 2: Rail + Road via Central Asia (primary solid) ── */}
        <path
          d={`M ${c(shanghai)} L ${c(alashankou)} C 590,105 540,96 ${c(hamburg)}`}
          fill="none" stroke="#2e2e42" strokeWidth="2.8" strokeDasharray="9,5"
        />

        {/* ── Route 3: Sea via Cape of Good Hope (muted dashed) ── */}
        <path
          d={`M ${c(shanghai)} C 748,250 680,305 ${c(cape)} C 360,325 275,255 205,190 C 310,115 405,92 ${c(hamburg)}`}
          fill="none" stroke="#636375" strokeWidth="2" strokeDasharray="7,5" opacity="0.8"
        />

        {/* ── Disruption markers ── */}
        {/* Hormuz - High */}
        <g transform={`translate(${hormuz[0]},${hormuz[1]})`}>
          <polygon points="0,-11 12,9 -12,9" fill="rgba(220,60,60,0.88)" opacity="0.92" />
          <text x="15" y="2" fontSize="9" fill="#7a1010" fontWeight="700">Strait of Hormuz</text>
          <text x="15" y="13" fontSize="8" fill="#a01818">High Risk</text>
        </g>
        {/* Suez - Medium */}
        <g transform={`translate(${suez[0]},${suez[1] - 10})`}>
          <polygon points="0,-10 11,8 -11,8" fill="rgba(200,140,40,0.88)" opacity="0.92" />
          <text x="-42" y="22" fontSize="9" fill="#7a4000" fontWeight="700">Suez Canal Delays</text>
          <text x="-28" y="32" fontSize="8" fill="#7a4000">Medium Risk</text>
        </g>
        {/* Shanghai Port - Low */}
        <g transform={`translate(${shanghai[0] + 14},${shanghai[1] - 12})`}>
          <polygon points="0,-9 10,7 -10,7" fill="#636375" opacity="0.88" />
          <text x="12" y="0" fontSize="8" fill="#45455a">Port Congestion</text>
          <text x="12" y="10" fontSize="8" fill="#636375">Medium Risk</text>
        </g>

        {/* ── City markers ── */}
        <circle cx={shanghai[0]} cy={shanghai[1]} r="7" fill="#1c1c2e" stroke="white" strokeWidth="2.5" />
        <rect x={shanghai[0] + 10} y={shanghai[1] - 22} width="78" height="30" rx="5" fill="white" opacity="0.92" />
        <text x={shanghai[0] + 15} y={shanghai[1] - 9} fontSize="10" fill="#0a0a14" fontWeight="700">Shanghai</text>
        <text x={shanghai[0] + 15} y={shanghai[1] + 2} fontSize="8" fill="#636375">(PVG)</text>

        <circle cx={hamburg[0]} cy={hamburg[1]} r="7" fill="#2e2e42" stroke="white" strokeWidth="2.5" />
        <rect x={hamburg[0] - 72} y={hamburg[1] - 22} width="68" height="30" rx="5" fill="white" opacity="0.92" />
        <text x={hamburg[0] - 67} y={hamburg[1] - 9} fontSize="10" fill="#0a0a14" fontWeight="700">Hamburg</text>
        <text x={hamburg[0] - 67} y={hamburg[1] + 2} fontSize="8" fill="#636375">(HAM)</text>

        <circle cx={alashankou[0]} cy={alashankou[1]} r="5" fill="#45455a" stroke="white" strokeWidth="1.5" />
        <text x={alashankou[0] + 8} y={alashankou[1] + 4} fontSize="8" fill="#2e2e42">Alashankou</text>

        {/* ── Legend ── */}
        <g transform="translate(12, 348)">
          <rect x="0" y="0" width="248" height="76" rx="7" fill="white" opacity="0.9" />
          <line x1="12" y1="18" x2="42" y2="18" stroke="rgba(220,60,60,0.85)" strokeWidth="2" strokeDasharray="5,3" />
          <text x="50" y="22" fontSize="10" fill="#636375">Original Route (Affected)</text>
          <line x1="12" y1="38" x2="42" y2="38" stroke="#2e2e42" strokeWidth="2.5" strokeDasharray="5,3" />
          <text x="50" y="42" fontSize="10" fill="#636375">Alternative Route (Central Asia)</text>
          <line x1="12" y1="58" x2="42" y2="58" stroke="#636375" strokeWidth="2" strokeDasharray="5,3" />
          <text x="50" y="62" fontSize="10" fill="#636375">Alternative Sea (via Cape)</text>
        </g>
      </>}

      {!showRoutes && <>
        {/* Simple route preview (step 1) */}
        <path
          d={`M ${c(shanghai)} C 680,200 580,150 ${c(hamburg)}`}
          fill="none" stroke="#2e2e42" strokeWidth="2.5" strokeDasharray="8,5"
        />
        <circle cx={shanghai[0]} cy={shanghai[1]} r="7" fill="#1c1c2e" stroke="white" strokeWidth="2.5" />
        <text x={shanghai[0] - 32} y={shanghai[1] - 12} fontSize="11" fill="#0a0a14" fontWeight="700">Shanghai (PVG)</text>
        <circle cx={hamburg[0]} cy={hamburg[1]} r="7" fill="#2e2e42" stroke="white" strokeWidth="2.5" />
        <text x={hamburg[0] - 20} y={hamburg[1] - 12} fontSize="11" fill="#0a0a14" fontWeight="700">Hamburg (HAM)</text>
      </>}
    </svg>
  )
}

/* ═══════════════════════════════ STEP INDICATOR ════════════════════════════ */
const STEPS = [
  { label: 'Shipment Details', sub: 'Enter information' },
  { label: 'Disruption Analysis', sub: 'Check route risks' },
  { label: 'Compare Options', sub: 'View AI recommendations' },
  { label: 'Confirm Booking', sub: 'Review and book' },
  { label: 'Track Shipment', sub: 'Monitor progress' },
]

function StepIndicator({ step, onStepClick }) {
  return (
    <div className="step-bar">
      {STEPS.map((s, i) => {
        const num = i + 1
        const done = num < step
        const active = num === step
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div className="step-item"
              style={{ cursor: onStepClick ? 'pointer' : 'default' }}
              onClick={() => onStepClick && onStepClick(num)}>
              <div className={`step-circle ${done ? 'done' : active ? 'active' : 'pending'}`}>
                {done ? <Check size={12} /> : num}
              </div>
              <div className="step-label">
                <div className="step-title">{s.label}</div>
                <div className="step-sub">{s.sub}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-connector ${done ? 'done' : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════ SIDEBAR ════════════════════════════════════ */
function Sidebar({ page, onNav, onLogout }) {
  const items = [
    { id: 'new-shipment',  icon: <Plus size={16} />,       label: 'New Shipment' },
    { id: 'my-shipments', icon: <Package size={16} />,    label: 'My Shipments' },
    { id: 'tracking',     icon: <Navigation size={16} />, label: 'Tracking' },
    { id: 'saved-routes', icon: <Bookmark size={16} />,   label: 'Saved Routes' },
    { id: 'emissions',    icon: <BarChart3 size={16} />,   label: 'Emissions Insights' },
    { id: 'help',         icon: <HelpCircle size={16} />, label: 'Help & Support' },
  ]
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Leaf size={16} color="white" /></div>
          <span className="sidebar-logo-text">GreenGridAI</span>
        </div>
        <div className="sidebar-tagline">Smarter Logistics<br />Greener Tomorrow</div>
      </div>

      <nav className="sidebar-nav">
        {items.map(item => (
          <button key={item.id} className={`sidebar-item ${page === item.id ? 'active' : ''}`}
            onClick={() => onNav(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">S</div>
          <div className="user-info">
            <div className="user-name">Sid</div>
            <div className="user-role">Customer</div>
          </div>
        </div>
        <button className="sidebar-item" onClick={onLogout}>
          <span className="nav-icon"><LogOut size={16} /></span>
          Logout
        </button>
      </div>
    </aside>
  )
}

/* ═══════════════════════════════ STEP 1 — SHIPMENT DETAILS ══════════════════ */
const CARGO_TYPES = [
  { id: 'general',     icon: <Box size={18} />,             label: 'General Cargo' },
  { id: 'electronics',icon: <Cpu size={18} />,              label: 'Electronics' },
  { id: 'machinery',  icon: <Settings size={18} />,         label: 'Machinery' },
  { id: 'textiles',   icon: <ShoppingBag size={18} />,      label: 'Textiles' },
  { id: 'food',       icon: <UtensilsCrossed size={18} />,  label: 'Food' },
  { id: 'other',      icon: <MoreHorizontal size={18} />,   label: 'Other' },
]
const MODES_META = [
  { id: 'air',  icon: <Plane size={20} />,  label: 'Air Freight',  descs: ['Fastest delivery','Higher cost','Higher emissions'] },
  { id: 'sea',  icon: <Anchor size={20} />, label: 'Sea Freight',  descs: ['Lowest cost','Lowest emissions','Slower delivery'] },
  { id: 'road', icon: <Truck size={20} />,  label: 'Road Freight', descs: ['Flexible routing','Good for short/medium distances'] },
  { id: 'rail', icon: <Train size={20} />,  label: 'Rail Freight', descs: ['Reliable and efficient','Lower emissions','Suitable for long distance'] },
]

function Step1Form({ data, onChange, onNext }) {
  const set = (key, val) => onChange({ ...data, [key]: val })

  const toggleMode = id => {
    const modes = data.modes || []
    set('modes', modes.includes(id) ? modes.filter(m => m !== id) : [...modes, id])
  }
  const toggleHandling = id => {
    const h = data.handling || []
    set('handling', h.includes(id) ? h.filter(x => x !== id) : [...h, id])
  }

  const summaryRows = [
    { key: 'Shipment Name', val: data.shipmentName || '—', icon: <Package size={13} /> },
    { key: 'Category',      val: data.cargoCategory || '—', icon: <Box size={13} /> },
    { key: 'Description',   val: data.cargoDesc ? data.cargoDesc.slice(0, 40) + (data.cargoDesc.length > 40 ? '…' : '') : '—', icon: <Info size={13} /> },
    { key: 'Weight',        val: data.weight ? `${data.weight} ${data.weightUnit || 'kg'}` : '—', icon: <Activity size={13} /> },
    { key: 'Volume',        val: data.volume ? `${data.volume} m³` : '—', icon: <Box size={13} /> },
    { key: 'Preferred Modes',val: (data.modes || []).map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ') || '—', icon: <Truck size={13} /> },
    { key: 'Ready Date',    val: data.readyDate || '—', icon: <Clock size={13} /> },
    { key: 'Delivery Deadline', val: data.deadline || '—', icon: <Clock size={13} /> },
  ]

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* ── Main form ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* 1. Route Details */}
        <div className="form-section">
          <div className="form-section-header">
            <div className="section-icon green"><MapPin size={16} /></div>
            <div className="section-info">
              <h3>1. Route Details</h3>
              <p>Enter the origin and destination for your shipment.</p>
            </div>
          </div>
          <div className="form-section-body">
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--mono-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick-Select Trade Corridors:
              </div>
              <div className="quick-chips-row">
                {[
                  { o: 'Shanghai, China (PVG)', d: 'Hamburg, Germany (HAM)', label: 'Shanghai → Hamburg' },
                  { o: 'Shenzhen, China (SZX)', d: 'Rotterdam, Netherlands (RTM)', label: 'Shenzhen → Rotterdam' },
                  { o: 'Tokyo, Japan (NRT)', d: 'Los Angeles, USA (LAX)', label: 'Tokyo → Los Angeles' },
                  { o: 'Singapore (SIN)', d: 'London, UK (LHR)', label: 'Singapore → London' },
                ].map(q => (
                  <button key={q.label} type="button" className="quick-chip" onClick={() => { set('origin', q.o); set('dest', q.d); }}>
                    <Navigation size={10} /> {q.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label className="form-label">Origin <span className="req">*</span></label>
                <div className="input-with-icon">
                  <MapPin size={14} className="input-icon" />
                  <input className="form-input" placeholder="Shanghai, China (PVG)"
                    value={data.origin || ''} onChange={e => set('origin', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label">Destination <span className="req">*</span></label>
                <div className="input-with-icon">
                  <MapPin size={14} className="input-icon" />
                  <input className="form-input" placeholder="Hamburg, Germany (HAM)"
                    value={data.dest || ''} onChange={e => set('dest', e.target.value)} />
                </div>
              </div>
            </div>
            {/* Mini route map */}
            <div className="mini-map-container">
              <div className="world-map-container" style={{ height: 200 }}>
                <WorldMapSVG showRoutes={false} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Cargo Information */}
        <div className="form-section">
          <div className="form-section-header">
            <div className="section-icon orange"><Box size={16} /></div>
            <div className="section-info">
              <h3>2. Cargo Information</h3>
              <p>Provide details about your shipment.</p>
            </div>
          </div>
          <div className="form-section-body">
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-col">
                <label className="form-label">Shipment Name <span className="req">*</span></label>
                <input className="form-input" placeholder="Industrial Components"
                  value={data.shipmentName || ''} onChange={e => set('shipmentName', e.target.value)} />
              </div>
              <div className="form-col">
                <label className="form-label">Cargo Category <span className="req">*</span></label>
                <select className="form-select" value={data.cargoCategory || ''} onChange={e => set('cargoCategory', e.target.value)}>
                  <option value="">Select category</option>
                  <option>Machinery</option><option>Electronics</option>
                  <option>Textiles</option><option>Food & Beverage</option>
                  <option>Pharma</option><option>Automotive</option><option>Other</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Cargo Description <span className="req">*</span></label>
              <textarea className="form-textarea" placeholder="Mechanical and electrical components for manufacturing."
                value={data.cargoDesc || ''} onChange={e => set('cargoDesc', e.target.value)} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Cargo Type</label>
              <div className="cargo-type-grid">
                {CARGO_TYPES.map(ct => (
                  <button key={ct.id} className={`cargo-type-btn ${data.cargoType === ct.id ? 'selected' : ''}`}
                    onClick={() => set('cargoType', ct.id)}>
                    {ct.icon}
                    {ct.label}
                    {data.cargoType === ct.id && <CheckCircle size={10} className="mode-check" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <label className="form-label">Hazardous Material?</label>
                <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                  {['No', 'Yes'].map(opt => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input type="radio" name="hazardous" value={opt}
                        checked={(data.hazardous || 'No') === opt}
                        onChange={() => set('hazardous', opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-col">
                <label className="form-label">Requires Special Handling?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
                  {['Temperature Controlled', 'Fragile', 'Secure Packaging', 'Other (Specify)'].map(h => (
                    <label key={h} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.82rem' }}>
                      <input type="checkbox"
                        checked={(data.handling || []).includes(h)}
                        onChange={() => toggleHandling(h)} />
                      {h}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Shipment Specifications */}
        <div className="form-section">
          <div className="form-section-header">
            <div className="section-icon blue"><Activity size={16} /></div>
            <div className="section-info">
              <h3>3. Shipment Specifications</h3>
              <p>Enter weight, volume and package details.</p>
            </div>
          </div>
          <div className="form-section-body">
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-col">
                <label className="form-label">Total Weight <span className="req">*</span></label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="form-input" type="number" placeholder="1200"
                    value={data.weight || ''} onChange={e => set('weight', e.target.value)} />
                  <select className="form-select" style={{ width: 70 }} value={data.weightUnit || 'kg'}
                    onChange={e => set('weightUnit', e.target.value)}>
                    <option>kg</option><option>t</option><option>lbs</option>
                  </select>
                </div>
              </div>
              <div className="form-col">
                <label className="form-label">Total Volume</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="form-input" type="number" placeholder="15"
                    value={data.volume || ''} onChange={e => set('volume', e.target.value)} />
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.82rem', color: '#6b7280', whiteSpace: 'nowrap' }}>m³</span>
                </div>
              </div>
              <div className="form-col">
                <label className="form-label">Number of Packages</label>
                <input className="form-input" type="number" placeholder="12"
                  value={data.packages || ''} onChange={e => set('packages', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <label className="form-label">Package Type</label>
                <select className="form-select" value={data.packageType || ''} onChange={e => set('packageType', e.target.value)}>
                  <option value="">Select type</option>
                  <option>Pallets</option><option>Boxes</option><option>Crates</option>
                  <option>Drums</option><option>Loose</option>
                </select>
              </div>
              <div className="form-col">
                <label className="form-label">Dimensions (per package)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['L', 'W', 'H'].map(d => (
                    <div key={d} style={{ flex: 1 }}>
                      <input className="form-input" type="number" placeholder={d === 'L' ? '120' : d === 'W' ? '80' : '100'}
                        value={data[`dim${d}`] || ''} onChange={e => set(`dim${d}`, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                  {['Length (cm)', 'Width (cm)', 'Height (cm)'].map(l => (
                    <div key={l} style={{ flex: 1, fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center' }}>{l}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Timeline */}
        <div className="form-section">
          <div className="form-section-header">
            <div className="section-icon teal"><Clock size={16} /></div>
            <div className="section-info">
              <h3>4. Timeline</h3>
              <p>Specify when your shipment is ready and when it needs to arrive.</p>
            </div>
          </div>
          <div className="form-section-body">
            <div className="form-row">
              <div className="form-col">
                <label className="form-label">Ready Date <span className="req">*</span></label>
                <input className="form-input" type="date"
                  value={data.readyDate || '2025-12-01'} onChange={e => set('readyDate', e.target.value)} />
              </div>
              <div className="form-col">
                <label className="form-label">Delivery Deadline <span className="req">*</span></label>
                <input className="form-input" type="date"
                  value={data.deadline || '2025-12-28'} onChange={e => set('deadline', e.target.value)} />
              </div>
              <div className="form-col">
                <label className="form-label">Flexibility <Info size={12} /></label>
                <select className="form-select" value={data.flexibility || 'Standard'} onChange={e => set('flexibility', e.target.value)}>
                  <option>Standard</option><option>Flexible</option><option>Urgent</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Preferred Transport Modes */}
        <div className="form-section">
          <div className="form-section-header">
            <div className="section-icon green"><Truck size={16} /></div>
            <div className="section-info">
              <h3>5. Preferred Transport Modes</h3>
              <p>Select the modes you want to consider.</p>
            </div>
          </div>
          <div className="form-section-body">
            <div className="mode-select-grid">
              {MODES_META.map(m => {
                const sel = (data.modes || []).includes(m.id)
                return (
                  <div key={m.id} className={`mode-select-card ${sel ? 'selected' : ''}`}
                    onClick={() => toggleMode(m.id)}>
                    <div style={{ color: sel ? 'var(--mono-700)' : 'var(--mono-400)', marginBottom: 4 }}>{m.icon}</div>
                    <div className="mode-name">{m.label}</div>
                    {m.descs.map(d => <div key={d} className="mode-desc">{d}</div>)}
                    {sel && <CheckCircle size={14} className="mode-check" style={{ marginTop: 4 }} />}
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 14 }}>
              <label className="form-label">Additional Requirements (Optional)</label>
              <textarea className="form-textarea" placeholder="Handle with care, avoid high temperature, ensure secure packaging."
                value={data.additionalReqs || ''} onChange={e => set('additionalReqs', e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-primary btn-lg" onClick={() => {
            if (!data.origin || !data.dest) { alert('Please enter Origin and Destination.'); return; }
            if (!data.shipmentName) { alert('Please enter a Shipment Name.'); return; }
            if (!data.weight) { alert('Please enter the cargo Weight.'); return; }
            onNext();
          }}>
            Next: Analyse Disruptions <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Right summary panel ── */}
      <div className="right-panel">
        {/* Reduce Emissions badge */}
        <div style={{
          background: 'linear-gradient(135deg, #1c1c2e, #2e2e42)',
          borderRadius: 14, padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.10)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}>
          <Leaf size={20} color="rgba(255,255,255,0.85)" />
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '-0.02em' }}>Reduce Emissions</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>Choose Smarter Logistics</div>
          </div>
        </div>

        {/* Estimated Route Preview */}
        <div className="route-preview-card">
          <div className="route-preview-header">
            <Globe size={15} style={{ color: 'var(--mono-600)' }} /> Estimated Route Preview
          </div>
          <div className="route-preview-body">
            <div className="route-point">
              <div className="route-point-icon origin"><MapPin size={13} /></div>
              <div>
                <div className="route-point-label">Origin</div>
                <div className="route-point-val">{data.origin || 'Shanghai, China (PVG)'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 14px' }}>
              <div style={{ flex: 1, height: 1, borderTop: '2px dashed #d1d5db' }} />
            </div>
            <div className="route-point">
              <div className="route-point-icon dest"><MapPin size={13} /></div>
              <div>
                <div className="route-point-label">Destination</div>
                <div className="route-point-val">{data.dest || 'Hamburg, Germany (HAM)'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '8px 0 0', borderTop: '1px solid #e5e7eb' }}>
              <Navigation size={13} color="#6b7280" />
              <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 600 }}>Approx. Distance</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--mono-700)', fontWeight: 700, marginLeft: 'auto' }}>~19,800 km</span>
            </div>
          </div>
        </div>

        {/* Shipment Summary */}
        <div className="route-preview-card">
          <div className="route-preview-header">
            <Package size={15} style={{ color: 'var(--mono-600)' }} /> Shipment Summary
          </div>
          <div className="route-preview-body" style={{ padding: '12px 16px' }}>
            <div className="summary-list">
              {summaryRows.map(row => (
                <div key={row.key} className="summary-list-row">
                  <span className="s-key">{row.icon} {row.key}</span>
                  <span className="s-val" style={{ maxWidth: 130, textAlign: 'right', fontSize: '0.78rem' }}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════ STEP 2 — DISRUPTION ANALYSIS ══════════════ */
function Step2Disruptions({ formData, disruptions, onBack, onNext }) {
  const impactRows = [
    { metric: 'Transit Time',  normal: '28 days', disrupted: '35–42 days', change: '+7–14 days', up: true },
    { metric: 'Total Cost',    normal: '$3,200',   disrupted: '$4,000–$4,500', change: '+25–40%', up: true },
    { metric: 'CO₂e Emissions',normal: '650 kg',   disrupted: '720–850 kg', change: '+10–30%', up: true },
  ]
  const altRoutes = [
    { label: 'Route 1: Via Central Asia (Rail + Road)', time: '32 days', cost: '$4,100', emissions: '520 kg', recommended: true, tags: ['Avoids Suez Canal and Strait of Hormuz','Lower emissions than air','Reliable for most cargo'] },
    { label: 'Route 2: Via Cape of Good Hope (Sea)',    time: '38 days', cost: '$3,800', emissions: '680 kg', recommended: false, tags: ['Lowest cost option','Avoids Suez Canal and Hormuz','Suitable for non-urgent shipments'] },
    { label: 'Route 3: Air Freight (Direct)',           time: '5 days',  cost: '$12,500',emissions: '1,850 kg',recommended: false, tags: ['Fastest option','Best for time-sensitive','Highest cost and emissions'] },
  ]

  const severityList = ['high', 'medium', 'low', 'medium', 'high']
  const liveDisruptions = disruptions.length > 0
    ? disruptions.map((d, i) => ({ ...d, severity: severityList[i % severityList.length] }))
    : [
        { disruption_id: 'DIS-01', title: 'Red Sea & Bab-el-Mandeb Maritime Closure', type: 'Geopolitical / Chokepoint', geographic_corridor: 'Asia / Middle East → Europe', delay_impact_days: '13.5', cost_surcharge_usd: '145000', severity: 'high', status: 'Simulated Active Scenario' },
        { disruption_id: 'DIS-02', title: 'Suez Canal Congestion', type: 'Port Congestion', geographic_corridor: 'Asia → Europe (Sea)', delay_impact_days: '5', cost_surcharge_usd: '40000', severity: 'medium', status: 'Simulated Active Scenario' },
        { disruption_id: 'DIS-03', title: 'Shanghai Port Delays', type: 'Port Congestion', geographic_corridor: 'Origin (Shanghai)', delay_impact_days: '2', cost_surcharge_usd: '8000', severity: 'low', status: 'Simulated Active Scenario' },
      ]

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Alert */}
        <div className="alert-bar amber">
          <AlertTriangle size={18} />
          <div>
            <div>{liveDisruptions.length} active disruptions detected on or near your route.</div>
            <div className="alert-bar-desc">These disruptions may affect transit time, cost and emissions. Alternative routes and transport options have been considered.</div>
          </div>
        </div>

        {/* World Map */}
        <div className="world-map-container" style={{ height: 340, marginBottom: 20 }}>
          <WorldMapSVG showRoutes={true} />
        </div>

        {/* 3-column grid below map */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.2fr', gap: 16, marginBottom: 20 }}>
          {/* Route Impact Analysis */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><BarChart3 size={15} /> Route Impact Analysis</div>
            </div>
            <div style={{ padding: '0 0 12px' }}>
              <p style={{ fontSize: '0.72rem', color: '#6b7280', padding: '6px 14px 10px' }}>
                Estimated impact on your selected route due to current disruptions.
              </p>
              <table className="impact-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Normal Route<br />(Shanghai→Hamburg)</th>
                    <th>With Disruptions</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {impactRows.map(r => (
                    <tr key={r.metric}>
                      <td>{r.metric}</td>
                      <td style={{ fontWeight: 600 }}>{r.normal}</td>
                      <td className="impact-val-up">{r.disrupted}</td>
                      <td><span className="impact-val-up">↑ {r.change}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alternative Routes */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><Map size={15} /> Alternative Routes Analysis</div>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: 4 }}>
                We identify safer alternative routes based on current disruptions.
              </p>
              {altRoutes.map((r, i) => (
                <div key={i} style={{
                  padding: '10px 12px',
                  background: r.recommended ? 'rgba(30,30,50,0.07)' : 'rgba(255,255,255,0.45)',
                  border: `1px solid ${r.recommended ? 'var(--mono-600)' : 'var(--panel-border)'}`,
                  borderRadius: 10,
                  backdropFilter: 'blur(8px)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mono-900)' }}>{r.label}</span>
                    {r.recommended && <span style={{ background: 'var(--mono-800)', color: 'white', fontSize: '0.63rem', fontWeight: 800, padding: '2px 8px', borderRadius: 100, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Best Option</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--mono-600)', marginBottom: 6, fontWeight: 600 }}>
                    <span><Clock size={10} style={{ marginRight: 3 }} />{r.time}</span>
                    <span><DollarSign size={10} style={{ marginRight: 3 }} />{r.cost}</span>
                    <span><Wind size={10} style={{ marginRight: 3 }} />{r.emissions}</span>
                  </div>
                  {r.tags.map(t => (
                    <div key={t} style={{ fontSize: '0.7rem', color: 'var(--mono-500)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      <Check size={9} style={{ color: 'var(--mono-600)', flexShrink: 0 }} /> {t}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><Leaf size={15} style={{ color: 'var(--mono-600)' }} /> AI Insights &amp; Recommendation</div>
            </div>
            <div style={{ padding: '10px 14px' }}>
              <div className="ai-insight-box" style={{ marginBottom: 12 }}>
                <div className="ai-insight-title"><CheckCircle size={14} /> Recommended Option</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--mono-800)', marginBottom: 6 }}>
                  Route 1: Via Central Asia (Rail + Road)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--mono-600)', marginBottom: 8 }}>
                  Best balance of cost, time and emissions considering current disruptions.
                </div>
                <ul className="ai-insight-list">
                  {['Avoids high-risk regions (Strait of Hormuz, Suez Canal)', 'Lower emissions than air freight', 'Delivers within your deadline', 'Estimated 32 days transit time'].map(item => (
                    <li key={item}><Check size={11} style={{ color: 'var(--mono-600)', flexShrink: 0 }} />{item}</li>
                  ))}
                </ul>
              </div>
              <div className="note-box">
                <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>The original sea route is affected by high-risk disruptions. The Central Asia route is the most reliable and sustainable option that meets your delivery deadline.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <button className="btn btn-outline" onClick={onBack}><ChevronLeft size={16} /> Back to Shipment Details</button>
          <button className="btn btn-primary btn-lg" onClick={onNext}>Next: Compare Transport Options <ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Right panel — detected disruptions */}
      <div className="right-panel">
        <div className="route-preview-card" style={{ marginBottom: 16 }}>
          <div className="route-preview-header"><Navigation size={14} /> Shipment Route</div>
          <div className="route-preview-body" style={{ padding: '10px 14px', gap: 6 }}>
            <div className="summary-list-row">
              <span className="s-key"><MapPin size={11} /> Origin</span>
              <span className="s-val" style={{ fontSize: '0.78rem' }}>{formData.origin || 'Shanghai (PVG)'}</span>
            </div>
            <div className="summary-list-row">
              <span className="s-key"><MapPin size={11} /> Destination</span>
              <span className="s-val" style={{ fontSize: '0.78rem' }}>{formData.dest || 'Hamburg (HAM)'}</span>
            </div>
            <div className="summary-list-row">
              <span className="s-key"><Navigation size={11} /> Distance</span>
              <span className="s-val">~19,800 km</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><AlertTriangle size={15} style={{ color: 'var(--danger)' }} /> Detected Disruptions</div>
            <span className="chip chip-red" style={{ fontSize: '0.65rem' }}>{liveDisruptions.length} Active</span>
          </div>
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {liveDisruptions.map(d => (
              <div key={d.disruption_id} className="disruption-list-item">
                <div className={`dis-icon ${d.severity}`}>
                  <AlertTriangle size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span className="dis-title" style={{ fontSize: '0.8rem' }}>{d.title}</span>
                    <span className={`severity-badge ${d.severity}`}>{d.severity.charAt(0).toUpperCase() + d.severity.slice(1)}</span>
                  </div>
                  <div className="dis-meta">
                    <span>Type: {d.type}</span><br />
                    <span>Corridor: {d.geographic_corridor}</span><br />
                    <span>Delay: +{d.delay_impact_days} days</span><br />
                    <span style={{ color: 'var(--danger)' }}>Status: {d.status || 'Active'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════ STEP 3 — COMPARE OPTIONS ══════════════════ */
function Step3Compare({ formData, options, onBack, onNext, selected, setSelected, setSelectedOption }) {
  const [chartTab, setChartTab] = useState('transit')
  const [sortBy, setSortBy] = useState('recommended')

  const transportOpts = [
    {
      id: 'rail-road', recommended: true,
      name: 'Rail + Road (via Central Asia)',
      route: 'Shanghai (PVG) → Alashankou → Europe → Hamburg (Germany)',
      modeClass: 'rail',
      modeIcon: <><Train size={16} /><span style={{ fontSize: 9 }}>+</span><Truck size={14} /></>,
      tags: [{ label: 'Avoids High-Risk Regions', color: '' }, { label: 'Lower Emissions', color: '' }],
      waypoints: ['Shanghai\n(China)', 'Alashankou\n(China/Kazakhstan)', 'Rail (Central Asia)', 'Road (Europe)', 'Hamburg\n(Germany)'],
      pros: ['Avoids Suez Canal and Strait of Hormuz', 'Lower emissions than air freight', 'Reliable for most cargo'],
      cons: ['Longer transit time than air', 'Dependent on rail network availability'],
      transit: '32 days', cost: '$4,100', emissions: '520 kg',
    },
    {
      id: 'sea-cape', recommended: false,
      name: 'Sea Freight (via Cape of Good Hope)',
      route: 'Shanghai (PVG) → Cape of Good Hope → Hamburg (HAM)',
      modeClass: 'sea',
      modeIcon: <Anchor size={18} />,
      tags: [{ label: 'Avoids Suez Canal', color: '' }, { label: 'Cost Effective', color: 'blue' }],
      waypoints: ['Shanghai\n(China)', 'Indian Ocean', 'Atlantic Ocean', 'Hamburg\n(Germany)'],
      pros: ['Lowest cost option', 'Avoids Suez Canal and Hormuz', 'Suitable for non-urgent shipments'],
      cons: ['Longest transit time', 'Higher emissions than rail', 'Weather-related delays possible'],
      transit: '38 days', cost: '$3,800', emissions: '680 kg',
    },
    {
      id: 'air', recommended: false,
      name: 'Air Freight (Direct)',
      route: 'Shanghai (PVG) → Hamburg (HAM)',
      modeClass: 'air',
      modeIcon: <Plane size={18} />,
      tags: [{ label: 'Fastest Option', color: 'amber' }, { label: 'Reliable', color: '' }],
      waypoints: ['Shanghai\n(China)', 'Hamburg\n(Germany)'],
      pros: ['Fastest delivery', 'Best for time-sensitive shipments', 'Less affected by port disruptions'],
      cons: ['Highest cost', 'Highest emissions', 'Limited capacity for large shipments'],
      transit: '5 days', cost: '$12,500', emissions: '1,850 kg',
    },
  ]

  // Use backend options if available
  const displayOpts = options.length > 0
    ? options.filter(o => o.feasibility_status === 'Feasible' && String(o.meets_deadline).toLowerCase() === 'true')
        .map((o) => {
          const modeKey = (o.mode || '').toLowerCase()
          const base = transportOpts.find(t => t.modeClass === modeKey) || transportOpts[0]
          const isRec = o.computed_recommended === true || String(o.is_recommended).toLowerCase() === 'true'
          return {
            ...base,
            id: o.option_id || base.id,
            modeClass: modeKey || base.modeClass,
            name: modeKey === 'rail' ? 'Rail Express (China-Europe Link)'
                : modeKey === 'sea' ? 'Maritime Container Freight'
                : modeKey === 'air' ? 'Air Freight Cargo (Direct)'
                : modeKey === 'road' ? 'Overland Highway Corridor'
                : base.name,
            route: o.feasibility_reason || base.route,
            transit: o.transit_time_days ? o.transit_time_days + ' days' : base.transit,
            cost: o.total_cost_usd ? fmtUSD(o.total_cost_usd) : base.cost,
            emissions: o.total_emissions_tco2e ? fmtN(o.total_emissions_tco2e, 1) + ' t CO₂e' : base.emissions,
            recommended: isRec,
            compositeScore: o.composite_score || o.computed_score,
            rawOption: o,
          }
        })
    : transportOpts

  const sortedOpts = [...displayOpts].sort((a, b) => {
    if (sortBy === 'cost') {
      const ca = parseInt(String(a.cost).replace(/[^0-9]/g, '')) || 0
      const cb = parseInt(String(b.cost).replace(/[^0-9]/g, '')) || 0
      return ca - cb
    }
    if (sortBy === 'emissions') {
      const ea = parseInt(String(a.emissions).replace(/[^0-9]/g, '')) || 0
      const eb = parseInt(String(b.emissions).replace(/[^0-9]/g, '')) || 0
      return ea - eb
    }
    if (sortBy === 'fastest') {
      const ta = parseInt(String(a.transit).replace(/[^0-9]/g, '')) || 0
      const tb = parseInt(String(b.transit).replace(/[^0-9]/g, '')) || 0
      return ta - tb
    }
    return (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0)
  })

  const handleNext = () => {
    const chosen = sortedOpts.find(o => o.id === selected) || sortedOpts.find(o => o.recommended) || sortedOpts[0]
    if (setSelectedOption && chosen) {
      setSelectedOption(chosen)
    }
    onNext()
  }

  const chartData = {
    transit: sortedOpts.map((o, i) => ({
      name: (o.modeClass || 'OPT').toUpperCase(),
      val: parseInt(String(o.transit).replace(/[^0-9]/g, '')) || 0,
      fill: ['#2e2e42', '#45455a', '#636375'][i % 3]
    })),
    cost: sortedOpts.map((o, i) => ({
      name: (o.modeClass || 'OPT').toUpperCase(),
      val: parseInt(String(o.cost).replace(/[^0-9]/g, '')) || 0,
      fill: ['#2e2e42', '#45455a', '#636375'][i % 3]
    })),
    emissions: sortedOpts.map((o, i) => ({
      name: (o.modeClass || 'OPT').toUpperCase(),
      val: parseInt(String(o.emissions).replace(/[^0-9]/g, '')) || 0,
      fill: ['#2e2e42', '#45455a', '#636375'][i % 3]
    })),
  }

  const compareRows = [
    { metric: 'Transit Time',    air: '5 days',    rail: '32 days',  sea: '38 days',  airC: '', railC: 'green', seaC: '' },
    { metric: 'Estimated Cost',  air: '$12,500',   rail: '$4,100',   sea: '$3,800',   airC: '', railC: '', seaC: 'green' },
    { metric: 'CO₂e Emissions',  air: '1,850 kg',  rail: '520 kg',   sea: '680 kg',   airC: '', railC: 'green', seaC: '' },
    { metric: 'Reliability',     air: 'High',      rail: 'Medium',   sea: 'Medium',   airC: 'green', railC: 'amber', seaC: 'amber' },
    { metric: 'Disruption Risk', air: 'Low',       rail: 'Low',      sea: 'Medium',   airC: 'green', railC: 'green', seaC: 'amber' },
    { metric: 'Suitable For',    air: 'Urgent cargo', rail: 'General cargo', sea: 'Non-urgent cargo', airC: '', railC: '', seaC: '' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Summary bar */}
      <div className="summary-bar">
        <div className="summary-bar-item">
          <div className="sb-label"><CheckCircle size={11} style={{ display: 'inline', marginRight: 3 }} /> Feasible Options</div>
          <div className="sb-val" style={{ fontSize: '1.4rem' }}>{sortedOpts.length}</div>
          <div className="sb-sub">after disruption analysis</div>
        </div>
        <div className="summary-bar-item">
          <div className="sb-label"><Clock size={11} style={{ display: 'inline', marginRight: 3 }} /> Your Delivery Deadline</div>
          <div className="sb-val">{formData.deadline || '28 Dec 2025'}</div>
          <div className="sb-sub">27 days remaining</div>
        </div>
        <div className="summary-bar-item">
          <div className="sb-label"><Package size={11} style={{ display: 'inline', marginRight: 3 }} /> Shipment Details</div>
          <div className="sb-val">{formData.weight || '1,200'} {formData.weightUnit || 'kg'} | {formData.volume || '15'} m³</div>
          <div className="sb-sub">{formData.shipmentName || 'Industrial Components'}</div>
        </div>
        <div className="summary-bar-item">
          <div className="sb-label"><Navigation size={11} style={{ display: 'inline', marginRight: 3 }} /> Route</div>
          <div className="sb-val" style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>{formData.origin || 'Shanghai (PVG)'} → {formData.dest || 'Hamburg (HAM)'}</div>
          <div className="sb-sub">19,800 km (approx.)</div>
        </div>
        <div className="summary-bar-item ai-rec">
          <div className="sb-label"><Leaf size={11} style={{ display: 'inline', marginRight: 3 }} /> AI Recommendation</div>
          <div className="sb-val">{sortedOpts.find(o => o.recommended)?.name || sortedOpts[0]?.name || 'Rail + Road'}</div>
          <div className="sb-sub">Best balance of cost, emissions and transit time.</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Left: transport options */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Transport Options</h2>
              <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>Compare the available options and choose the one that best fits your priorities.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#6b7280' }}>
              Sort by:
              <select className="form-select" style={{ width: 140, padding: '5px 10px', fontSize: '0.8rem' }}
                value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="cost">Lowest Cost</option>
                <option value="emissions">Lowest Emissions</option>
                <option value="fastest">Fastest</option>
              </select>
            </div>
          </div>

          {sortedOpts.map(opt => (
            <div key={opt.id}
              className={`transport-option-card ${selected === opt.id ? 'selected' : ''}`}
              onClick={() => {
                setSelected(opt.id)
                if (setSelectedOption) setSelectedOption(opt)
              }}>
              {opt.recommended && <div className="recommended-badge">Recommended</div>}

              <div className="option-header">
                <input type="radio" name="transport-option" checked={selected === opt.id}
                  onChange={() => {
                    setSelected(opt.id)
                    if (setSelectedOption) setSelectedOption(opt)
                  }} onClick={e => e.stopPropagation()} />
                <div className={`option-mode-icon ${opt.modeClass}`}>{opt.modeIcon}</div>
                <div>
                  <div className="option-name">{opt.name}</div>
                  <div className="option-route">{opt.route}</div>
                </div>
              </div>

              <div className="option-tags">
                {opt.tags.map(t => (
                  <span key={t.label} className={`option-tag ${t.color}`}>{t.label}</span>
                ))}
              </div>

              {/* Route waypoints */}
              <div className="route-viz">
                {opt.waypoints.map((wp, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < opt.waypoints.length - 1 ? 'none' : 'none' }}>
                    <div className="route-city">
                      <div className={`route-dot ${i === 0 || i === opt.waypoints.length - 1 ? 'filled' : ''}`} />
                      {wp.split('\n').map((line, j) => (
                        <div key={j} className={j === 0 ? 'route-city-name' : 'route-city-sub'}>{line}</div>
                      ))}
                    </div>
                    {i < opt.waypoints.length - 1 && <div className="route-line" />}
                  </div>
                ))}
              </div>

              <div className="option-body">
                <div className="option-pros-cons" style={{ flex: 1 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div className="pros-cons-title">Pros</div>
                      {opt.pros.map(p => (
                        <div key={p} className="pro-item">
                          <div className="pro-dot"><Check size={8} /></div>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="pros-cons-title">Cons</div>
                      {opt.cons.map(c => (
                        <div key={c} className="con-item">
                          <div className="con-dot">●</div>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="option-metrics">
                  <div className="metric-item">
                    <div className="metric-val">{opt.transit}</div>
                    <div className="metric-label">Transit Time</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-val">{opt.cost}</div>
                    <div className="metric-label">Estimated Cost</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-val" style={{ color: 'var(--mono-600)' }}>{opt.emissions}</div>
                    <div className="metric-label">CO₂e Emissions</div>
                  </div>
                </div>
              </div>

              <div className="option-footer">
                <button className="btn btn-primary" style={{ padding: '7px 16px' }}
                  onClick={e => {
                    e.stopPropagation()
                    setSelected(opt.id)
                    if (setSelectedOption) setSelectedOption(opt)
                  }}>
                  Select Option <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <button className="btn btn-outline" onClick={onBack}><ChevronLeft size={16} /> Back to Disruption Analysis</button>
            <button className="btn btn-primary btn-lg" onClick={handleNext} disabled={!selected}
              style={{ opacity: selected ? 1 : 0.5 }}>
              Next: Confirm Booking <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: comparison */}
        <div className="right-panel">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title"><BarChart3 size={15} /> Comparison Chart</div>
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div className="tab-group">
                {[['transit','Transit Time'],['cost','Cost'],['emissions','CO₂ Emissions']].map(([id, label]) => (
                  <button key={id} className={`tab-btn ${chartTab === id ? 'active' : ''}`}
                    onClick={() => setChartTab(id)}>{label}</button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData[chartTab]} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                    formatter={v => [chartTab === 'transit' ? v + ' days' : chartTab === 'cost' ? '$' + fmtN(v) : v + ' kg', chartTab === 'transit' ? 'Days' : chartTab === 'cost' ? 'USD' : 'kg CO₂e']}
                  />
                  <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                    {chartData[chartTab].map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title"><Activity size={15} /> Detailed Comparison</div>
            </div>
            <div style={{ padding: '0 0 12px', overflowX: 'auto' }}>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Air (Direct)</th>
                    <th>Rail + Road</th>
                    <th>Sea (Cape)</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map(row => (
                    <tr key={row.metric} className={row.metric === 'Reliability' || row.metric === 'Disruption Risk' ? 'highlighted' : ''}>
                      <td>{row.metric}</td>
                      {[['air', row.air, row.airC], ['rail', row.rail, row.railC], ['sea', row.sea, row.seaC]].map(([k, val, cls]) => (
                        <td key={k}>
                          {cls ? <span className={`cell-badge ${cls}`}>{val}</span> : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="note-box" style={{ margin: '10px 12px 0' }}>
                <Info size={13} style={{ flexShrink: 0 }} />
                <span>The options and estimates are generated using our logistics model and current disruption data. This is a prototype booking system and does not include real-time carrier reservations.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════ STEP 4 — CONFIRM BOOKING ══════════════════ */
function Step4Confirm({ formData, selected, selectedOption, onBack, onConfirm }) {
  const selOpt = { 'rail-road': { name: 'Rail + Road (via Central Asia)', transit: '32 days', cost: '$4,100', emissions: '520 kg CO₂e' }, 'sea-cape': { name: 'Sea Freight (via Cape of Good Hope)', transit: '38 days', cost: '$3,800', emissions: '680 kg CO₂e' }, 'air': { name: 'Air Freight (Direct)', transit: '5 days', cost: '$12,500', emissions: '1,850 kg CO₂e' } }
  const opt = selectedOption || selOpt[selected] || selOpt['rail-road']

  return (
    <div style={{ maxWidth: 780 }}>
      <div className="alert-bar green" style={{ marginBottom: 20 }}>
        <CheckCircle size={18} />
        <div>Please review your booking details below and confirm.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header"><div className="card-title"><MapPin size={14} /> Route Details</div></div>
          <div className="card-body">
            {[['Origin', formData.origin || 'Shanghai, China (PVG)'], ['Destination', formData.dest || 'Hamburg, Germany (HAM)'], ['Distance', '~19,800 km']].map(([k, v]) => (
              <div key={k} className="confirm-row"><span className="c-label">{k}</span><span className="c-val">{v}</span></div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title"><Package size={14} /> Shipment Details</div></div>
          <div className="card-body">
            {[['Name', formData.shipmentName || 'Industrial Components'], ['Weight', `${formData.weight || '1,200'} ${formData.weightUnit || 'kg'}`], ['Volume', `${formData.volume || '15'} m³`], ['Packages', formData.packages || '12']].map(([k, v]) => (
              <div key={k} className="confirm-row"><span className="c-label">{k}</span><span className="c-val">{v}</span></div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title"><Truck size={14} /> Selected Transport</div></div>
          <div className="card-body">
            {[['Mode', opt.name], ['Transit Time', opt.transit], ['Estimated Cost', opt.cost], ['CO₂e Emissions', opt.emissions]].map(([k, v]) => (
              <div key={k} className="confirm-row"><span className="c-label">{k}</span><span className="c-val" style={{ color: k === 'Estimated Cost' ? 'var(--mono-900)' : k === 'CO₂e Emissions' ? 'var(--mono-700)' : 'var(--mono-800)' }}>{v}</span></div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title"><Clock size={14} /> Timeline</div></div>
          <div className="card-body">
            {[['Ready Date', formData.readyDate || '01 Dec 2025'], ['Delivery Deadline', formData.deadline || '28 Dec 2025'], ['Flexibility', formData.flexibility || 'Standard']].map(([k, v]) => (
              <div key={k} className="confirm-row"><span className="c-label">{k}</span><span className="c-val">{v}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn-outline" onClick={onBack}><ChevronLeft size={16} /> Back to Compare Options</button>
        <button className="btn btn-primary btn-lg" onClick={onConfirm}>
          <CheckCircle size={16} /> Confirm Booking
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════ STEP 5 — TRACK SHIPMENT ════════════════════ */
function Step5Track({ formData, selectedOption, onNewShipment, onGoToTracking }) {
  const optName = selectedOption?.name || 'Rail + Road (via Central Asia)'
  const trackSteps = [
    { label: 'Booking Confirmed', time: 'Just now', done: true, active: false },
    { label: `Shipment Pickup: ${formData.origin || 'Origin'}`, time: formData.readyDate || '01 Dec 2025', done: false, active: true },
    { label: `In Transit — ${optName}`, time: 'Telemetry GPS Link Initialized', done: false, active: false },
    { label: 'Customs Clearance & Transit Checkpoint', time: `Est. transit ${selectedOption?.transit || '32 days'}`, done: false, active: false },
    { label: `Final Delivery: ${formData.dest || 'Destination'}`, time: formData.deadline || '28 Dec 2025', done: false, active: false },
  ]
  return (
    <div style={{ maxWidth: 680 }}>
      <div className="alert-bar green" style={{ marginBottom: 16 }}>
        <CheckCircle size={18} />
        <div>
          <div>Booking confirmed! Tracking Reference: <strong>GG-2025-99824</strong></div>
          <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: 2 }}>Real-time telemetry and dispatch updates active.</div>
        </div>
      </div>
      {selectedOption && (
        <div className="card" style={{ padding: '12px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--mono-500)', fontWeight: 700, textTransform: 'uppercase' }}>Booked Option</div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--mono-900)' }}>{optName}</div>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: '0.8rem', color: 'var(--mono-700)', fontWeight: 600 }}>
            <span><Clock size={12} style={{ marginRight: 3, verticalAlign: -1 }} />{selectedOption.transit}</span>
            <span><DollarSign size={12} style={{ marginRight: 3, verticalAlign: -1 }} />{selectedOption.cost}</span>
            <span><Wind size={12} style={{ marginRight: 3, verticalAlign: -1 }} />{selectedOption.emissions}</span>
          </div>
        </div>
      )}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 22, fontSize: '1rem' }}><Navigation size={16} style={{ color: 'var(--mono-600)' }} /> Shipment Tracking</div>
        <div className="track-timeline">
          {trackSteps.map((s, i) => (
            <div key={i} className={`track-step-item ${s.done ? 'done' : ''}`} style={{ marginBottom: 8 }}>
              <div className={`track-dot ${s.done ? 'done' : s.active ? 'active' : 'pending'}`}>
                {s.done ? <Check size={14} /> : i + 1}
              </div>
              <div className="track-content">
                <div className="track-title">{s.label}</div>
                <div className="track-time">{s.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={onNewShipment}>
          <Plus size={15} /> Book Another Shipment
        </button>
        {onGoToTracking && (
          <button className="btn btn-outline" onClick={onGoToTracking}>
            <Navigation size={15} /> View in Live Tracking
          </button>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════ MY SHIPMENTS VIEW ══════════════════════════ */
function MyShipmentsView({ onTrackShipment }) {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState('All')

  useEffect(() => {
    get(API.analytics, '/analytics/shipments').then(d => {
      if (d?.shipments) setShipments(d.shipments)
      setLoading(false)
    })
  }, [])

  const modeChip = mode => {
    const map = { Air: 'chip chip-blue', Sea: 'chip chip-blue', Rail: 'chip chip-teal', Road: 'chip chip-green' }
    return <span className={map[mode] || 'chip chip-gray'}>{mode}</span>
  }

  const filtered = shipments.filter(s => {
    const matchesSearch = !search ||
      s.shipment_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.origin?.toLowerCase().includes(search.toLowerCase()) ||
      s.destination?.toLowerCase().includes(search.toLowerCase())
    const matchesMode = modeFilter === 'All' ||
      (modeFilter === 'F1' ? s.use_case_type === 'F1_Demonstration' : s.recommended_mode === modeFilter)
    return matchesSearch && matchesMode
  })

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div className="page-title">My Shipments</div>
          <div className="page-sub">All 27 shipments from the GreenGrid dataset</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            className="form-input"
            style={{ width: 260, background: 'rgba(255,255,255,0.7)' }}
            placeholder="Search by ID, Origin, Destination…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-pills-row">
        {['All', 'Rail', 'Sea', 'Air', 'Road', 'F1'].map(m => (
          <button
            key={m}
            className={`filter-pill ${modeFilter === m ? 'active' : ''}`}
            onClick={() => setModeFilter(m)}
          >
            {m === 'F1' ? 'F1 Demo' : m}
          </button>
        ))}
        <span style={{ fontSize: '0.78rem', color: 'var(--mono-500)', marginLeft: 'auto', fontWeight: 600 }}>
          Showing {filtered.length} of {shipments.length} shipments
        </span>
      </div>

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading…</div> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Route</th><th>Type</th><th>Weight</th>
                  <th>Window</th><th>Mode</th><th>Transit</th><th>Cost</th><th>CO₂e</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.shipment_id} onClick={() => onTrackShipment && onTrackShipment(s.shipment_id)}>
                    <td style={{ color: 'var(--mono-900)', fontWeight: 800 }}>{s.shipment_id}</td>
                    <td style={{ fontSize: '0.8rem' }}>{s.origin} → {s.destination}</td>
                    <td><span className={s.use_case_type === 'F1_Demonstration' ? 'chip chip-amber' : 'chip chip-teal'}>{s.use_case_type === 'F1_Demonstration' ? 'F1' : 'Commercial'}</span></td>
                    <td>{fmtN(s.cargo_weight_tonnes)} t</td>
                    <td>{s.available_window_days}d</td>
                    <td>{s.recommended_mode ? modeChip(s.recommended_mode) : '—'}</td>
                    <td>{s.recommended_transit_days != null ? s.recommended_transit_days + 'd' : '—'}</td>
                    <td style={{ color: 'var(--mono-900)', fontWeight: 700 }}>{fmtUSD(s.recommended_cost_usd)}</td>
                    <td style={{ color: 'var(--mono-600)', fontWeight: 700 }}>{s.recommended_emissions_tco2e != null ? fmtN(s.recommended_emissions_tco2e, 1) + ' t' : '—'}</td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: '0.73rem' }}
                        onClick={e => {
                          e.stopPropagation()
                          if (onTrackShipment) onTrackShipment(s.shipment_id)
                        }}
                      >
                        Track <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════ EMISSIONS INSIGHTS ════════════════════════ */
function EmissionsView() {
  const [summary, setSummary] = useState(null)
  const [byMode, setByMode] = useState({})
  useEffect(() => {
    Promise.all([
      get(API.analytics, '/analytics/summary'),
      get(API.analytics, '/analytics/emissions_by_mode'),
    ]).then(([s, e]) => {
      if (s) setSummary(s)
      if (e?.emissions_by_mode) setByMode(e.emissions_by_mode)
    })
  }, [])

  const modeData = Object.entries(byMode).map(([mode, d], i) => ({
    name: mode, emissions: d.total_emissions_tco2e, cost: Math.round(d.total_cost_usd / 1000), transit: d.avg_transit_days,
    fill: ['#2e2e42', '#45455a', '#636375', '#8a8a9a'][i % 4],
  }))

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Emissions Insights</div>
        <div className="page-sub">Aggregate CO₂e and cost metrics across all recommended shipments</div>
      </div>

      {summary && (
        <div className="stats-grid">
          {[
            { label: 'Total CO₂e (Recommended)', value: fmtN(summary.total_recommended_emissions_tco2e, 0) + ' t' },
            { label: 'Emissions Saved', value: summary.estimated_emissions_savings_pct_vs_all_feasible + '%' },
            { label: 'Total Shipments', value: summary.total_shipments },
            { label: 'Recommendations Made', value: summary.recommendations_made },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {modeData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="card-header"><div className="card-title"><Wind size={15} /> Total CO₂e by Mode (tCO₂e)</div></div>
            <div style={{ padding: '12px 14px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={modeData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                    formatter={v => [fmtN(v, 1) + ' t', 'CO₂e']} />
                  <Bar dataKey="emissions" radius={[4, 4, 0, 0]}>
                    {modeData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title"><DollarSign size={15} /> Total Cost by Mode (USD '000)</div></div>
            <div style={{ padding: '12px 14px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={modeData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                    formatter={v => ['$' + v + 'k', 'Cost']} />
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                    {modeData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


/* ═══════════════════════════════ TRACKING VIEW ══════════════════════════════ */
function TrackingView({ initialId }) {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(initialId || null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    get(API.analytics, '/analytics/shipments').then(d => {
      if (d?.shipments) {
        setShipments(d.shipments)
        setSelectedId(prev => prev || initialId || d.shipments[0]?.shipment_id || null)
      }
      setLoading(false)
    })
  }, [initialId])

  const filtered = shipments.filter(s =>
    !search ||
    s.shipment_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.origin?.toLowerCase().includes(search.toLowerCase()) ||
    s.destination?.toLowerCase().includes(search.toLowerCase())
  )

  const sel = shipments.find(s => s.shipment_id === selectedId) || shipments[0]
  const trackSteps = sel ? [
    { label: 'Booking Confirmed', time: 'Completed · 2 days ago', done: true, active: false },
    { label: `Pickup: ${sel.origin}`, time: 'Completed · Yesterday 14:30', done: true, active: false },
    { label: `In Transit — ${sel.recommended_mode || 'Rail'} corridor`, time: `Active · Day 4 of ${sel.recommended_transit_days || 30}`, done: false, active: true },
    { label: 'Customs Clearance Point', time: 'Est. in 12 days', done: false, active: false },
    { label: `Final Delivery: ${sel.destination}`, time: `Est. arrival in ${sel.recommended_transit_days || 30} days`, done: false, active: false },
  ] : []

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div className="page-title">Live Tracking & Telemetry</div>
          <div className="page-sub">Real-time GPS telemetry and milestone monitoring across global corridors</div>
        </div>
        {sel && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="chip chip-green" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>
              ● Live In-Transit (On Schedule)
            </span>
          </div>
        )}
      </div>

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--mono-400)' }}>Loading shipments…</div> : (
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ width: 260, flexShrink: 0 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--mono-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Shipment Fleet ({filtered.length})
                </div>
                <input
                  className="form-input"
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.78rem' }}
                  placeholder="Filter shipments…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                {filtered.map(s => (
                  <button key={s.shipment_id}
                    onClick={() => setSelectedId(s.shipment_id)}
                    style={{
                      display: 'block', width: '100%', padding: '12px 14px', textAlign: 'left',
                      background: selectedId === s.shipment_id ? 'rgba(30,30,50,0.08)' : 'transparent',
                      border: 'none', borderBottom: '1px solid var(--panel-border)', cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--mono-900)' }}>{s.shipment_id}</span>
                      <span className="chip chip-gray" style={{ fontSize: '0.65rem' }}>{s.recommended_mode || 'Rail'}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--mono-500)' }}>{s.origin} → {s.destination}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {sel ? (
              <>
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16 }}>
                  {[
                    { label: 'Mode', value: sel.recommended_mode || 'Rail' },
                    { label: 'Transit Days', value: sel.recommended_transit_days ? sel.recommended_transit_days + 'd' : '—' },
                    { label: 'Cost', value: fmtUSD(sel.recommended_cost_usd) },
                    { label: 'CO₂e', value: sel.recommended_emissions_tco2e ? fmtN(sel.recommended_emissions_tco2e, 1) + ' t' : '—' },
                  ].map((m, i) => (
                    <div key={i} className="stat-card">
                      <div className="stat-value" style={{ fontSize: '1.35rem' }}>{m.value}</div>
                      <div className="stat-label">{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className="card-title" style={{ fontSize: '0.98rem' }}>
                      <Navigation size={17} style={{ color: 'var(--mono-700)' }} />
                      Shipment Route & Telemetry — {sel.shipment_id}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--mono-500)', fontWeight: 600 }}>
                      Carrier: EuroAsia Intermodal Link · GPS Signal Active
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--mono-700)', fontWeight: 700, marginBottom: 6 }}>
                      <span>Journey Progress: 42%</span>
                      <span>Next Checkpoint: Alashankou Border (China / Kazakhstan)</span>
                    </div>
                    <div style={{ width: '100%', height: 7, background: 'rgba(160,160,192,0.25)', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ width: '42%', height: '100%', background: 'linear-gradient(90deg, var(--mono-700), var(--mono-900))', borderRadius: 10 }} />
                    </div>
                  </div>

                  <div className="track-timeline">
                    {trackSteps.map((s, i) => (
                      <div key={i} className={`track-step-item ${s.done ? 'done' : ''}`} style={{ marginBottom: 10 }}>
                        <div className={`track-dot ${s.done ? 'done' : s.active ? 'active' : 'pending'}`}>
                          {s.done ? <Check size={14} /> : i + 1}
                        </div>
                        <div className="track-content">
                          <div className="track-title" style={{ fontWeight: s.active ? 800 : 600 }}>{s.label}</div>
                          <div className="track-time">{s.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : <div style={{ padding: 40, textAlign: 'center', color: 'var(--mono-400)' }}>Select a shipment from the left list.</div>}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════ SAVED ROUTES VIEW ══════════════════════════ */
function SavedRoutesView({ onBookRoute }) {
  const [opts, setOpts] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    get(API.analytics, '/analytics/shipments').then(d => {
      if (d?.shipments) setOpts(d.shipments.slice(0, 8))
      setLoading(false)
    })
  }, [])
  return (
    <div>
      <div className="page-header">
        <div className="page-title">Saved Routes & Corridors</div>
        <div className="page-sub">Pre-evaluated trade lanes and optimized transport configurations</div>
      </div>
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--mono-400)' }}>Loading saved routes…</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {opts.map(s => (
            <div key={s.shipment_id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--mono-900)', letterSpacing: '-0.02em' }}>{s.shipment_id}</div>
                {s.recommended_mode && <span className="chip chip-gray">{s.recommended_mode}</span>}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--mono-800)', fontWeight: 700, marginBottom: 8 }}>{s.origin} → {s.destination}</div>
              <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', color: 'var(--mono-600)', marginBottom: 16 }}>
                <span><Clock size={12} style={{ marginRight: 3, verticalAlign: -1 }} />{s.recommended_transit_days ? s.recommended_transit_days + 'd' : '—'}</span>
                <span><DollarSign size={12} style={{ marginRight: 3, verticalAlign: -1 }} />{s.recommended_cost_usd ? fmtUSD(s.recommended_cost_usd) : '—'}</span>
                <span><Wind size={12} style={{ marginRight: 3, verticalAlign: -1 }} />{s.recommended_emissions_tco2e ? fmtN(s.recommended_emissions_tco2e, 1) + ' t' : '—'}</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 'auto', padding: '8px 14px', fontSize: '0.78rem', width: '100%' }}
                onClick={() => onBookRoute && onBookRoute(s)}
              >
                Plan Shipment with this Route <ChevronRight size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════ HELP VIEW ══════════════════════════════════ */
function HelpView() {
  const [search, setSearch] = useState('')
  const [openIdx, setOpenIdx] = useState(0)
  const [supportMessage, setSupportMessage] = useState('')

  const faqs = [
    { q: 'How are transport options evaluated?', a: 'Our AI engine scores options using a weighted multi-criteria decision model: Emissions 40%, Cost 35%, Transit Time 25%. The highest-scoring feasible option that strictly satisfies your delivery window is prioritized and recommended.' },
    { q: 'What disruptions are tracked?', a: 'We monitor geopolitical events, chokepoint blockades (such as Bab-el-Mandeb and Suez), port congestion indexes, extreme weather disruptions, and rail corridor availability across all major global corridors.' },
    { q: 'How are emissions calculated?', a: 'Emissions are calculated using GLEC framework emission factors (kg CO₂e per tonne-km) specific to each transport mode and vessel/train type, multiplied by actual cargo weight and route distance.' },
    { q: 'Can I use real shipment data?', a: 'Yes. The system natively supports the GreenGrid V2.1.1 dataset containing 27 benchmark trade lane scenarios. You can extend it by providing custom shipments via our decision API.' },
    { q: 'What transport modes are supported?', a: 'Air, Sea, Road, and Rail freight modes are fully supported. Intermodal combinations (such as Rail + Road via Central Asia) are automatically generated and ranked.' },
  ]

  const filtered = faqs.filter(f => !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ maxWidth: 740 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div className="page-title">Help & Documentation</div>
          <div className="page-sub">Frequently asked questions, decision engine documentation, and support</div>
        </div>
        <input
          className="form-input"
          style={{ width: 240, background: 'rgba(255,255,255,0.7)' }}
          placeholder="Search FAQs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((f, i) => {
          const isOpen = openIdx === i
          return (
            <div key={i} className="card" style={{ overflow: 'hidden' }}>
              <div
                className="card-header"
                style={{ cursor: 'pointer', borderBottom: isOpen ? '1px solid rgba(160,160,192,0.15)' : 'none', padding: '14px 20px' }}
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
              >
                <div className="card-title" style={{ fontSize: '0.88rem' }}>
                  <HelpCircle size={15} style={{ color: 'var(--mono-600)' }} /> {f.q}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--mono-500)', fontWeight: 700 }}>
                  {isOpen ? '−' : '+'}
                </span>
              </div>
              {isOpen && (
                <div style={{ padding: '14px 20px 18px', fontSize: '0.84rem', color: 'var(--mono-700)', lineHeight: 1.6, background: 'rgba(255,255,255,0.25)' }}>
                  {f.a}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="card" style={{ marginTop: 24, padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--mono-900)', marginBottom: 6 }}>
          Need specialized assistance?
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--mono-600)', marginBottom: 12 }}>
          Our logistics algorithms team can assist with custom route optimization or fleet integration.
        </div>
        {supportMessage ? (
          <div className="alert-bar green" style={{ padding: '8px 14px' }}>
            <CheckCircle size={15} />
            <div>{supportMessage}</div>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={() => setSupportMessage('Support request received. A green logistics specialist will connect shortly.')}>
            Contact Logistics Support
          </button>
        )}
      </div>

      <div className="note-box" style={{ marginTop: 18 }}>
        <Info size={14} style={{ flexShrink: 0 }} />
        <span>GreenGridAI is built on the GreenGrid V2.1.1 Logistics & Emissions benchmark dataset. All cost and emissions calculations follow standard international logistics models.</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════ TOPBAR COMPONENT ══════════════════════════ */
function TopBar({ title, onLogout }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [unread, setUnread] = useState(3)
  const [notifs, setNotifs] = useState([
    { id: 1, title: 'Bab-el-Mandeb Maritime Alert', time: '10m ago', text: 'Simulated high-risk disruption active on Southern Red Sea corridor (+13.5d risk).' },
    { id: 2, title: 'AI Route Optimization Ready', time: '25m ago', text: 'Optimal Rail+Road corridor recommended for COMM-01 saving 58% CO₂e.' },
    { id: 3, title: 'Scope 3 Target Milestone', time: '1h ago', text: 'Average corporate carbon intensity reduced by 32% vs conventional freight.' },
  ])
  const [backendHealth, setBackendHealth] = useState({ online: 0, total: 3, checked: false })

  useEffect(() => {
    let mounted = true
    const checkHealth = () => {
      Promise.allSettled([
        fetch(API.data + '/health').then(r => r.ok),
        fetch(API.decision + '/health').then(r => r.ok),
        fetch(API.analytics + '/health').then(r => r.ok),
      ]).then(results => {
        if (!mounted) return
        const count = results.filter(r => r.status === 'fulfilled' && r.value).length
        setBackendHealth({ online: count, total: 3, checked: true })
      }).catch(() => {
        if (!mounted) return
        setBackendHealth({ online: 0, total: 3, checked: true })
      })
    }
    checkHealth()
    const timer = setInterval(checkHealth, 15000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--mono-900)', letterSpacing: '-0.02em' }}>
          {title}
        </span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.72rem',
          color: backendHealth.online === 3 ? 'var(--mono-800)' : backendHealth.online > 0 ? '#b45309' : '#dc2626',
          background: 'rgba(255,255,255,0.7)',
          padding: '3px 10px',
          borderRadius: 100,
          border: '1px solid var(--panel-border)',
          fontWeight: 600
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: backendHealth.online === 3 ? '#22c55e' : backendHealth.online > 0 ? '#f59e0b' : '#ef4444'
          }} />
          {backendHealth.checked
            ? backendHealth.online === 3
              ? 'Backend Live · 3/3 Services Online'
              : backendHealth.online > 0
              ? `Backend · ${backendHealth.online}/3 Online`
              : 'Backend Offline (Run run_all.py)'
            : 'Checking Services…'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        <button
          className="topbar-icon-btn"
          style={{ position: 'relative' }}
          onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
        >
          <Bell size={16} />
          {unread > 0 && (
            <span style={{ position: 'absolute', top: -2, right: -2, background: 'var(--mono-800)', color: 'white', fontSize: '0.62rem', fontWeight: 800, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unread}
            </span>
          )}
        </button>

        <div
          className="topbar-avatar"
          onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
        >
          S
        </div>

        {/* Notifications Popover */}
        {notifOpen && (
          <div className="popover-menu" style={{ width: 330 }}>
            <div className="popover-header">
              <span>Notifications ({notifs.length})</span>
              {unread > 0 && (
                <button
                  style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: 'var(--mono-600)', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => { setUnread(0); setNotifs([]); }}
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              {notifs.map(n => (
                <div key={n.id} className="popover-item" onClick={() => {
                  setUnread(prev => Math.max(0, prev - 1))
                  setNotifs(prev => prev.filter(x => x.id !== n.id))
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--mono-900)' }}>{n.title}</span>
                    <span style={{ fontSize: '0.66rem', color: 'var(--mono-400)' }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--mono-600)', lineHeight: 1.4 }}>{n.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Profile Popover */}
        {userOpen && (
          <div className="popover-menu" style={{ width: 250 }}>
            <div style={{ padding: '8px 10px 12px', borderBottom: '1px solid rgba(160,160,192,0.18)' }}>
              <div style={{ fontWeight: 800, color: 'var(--mono-900)', fontSize: '0.88rem' }}>Sid</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--mono-500)' }}>sid@greengrid.ai · Customer</div>
              <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(30,30,50,0.06)', borderRadius: 8, fontSize: '0.72rem', color: 'var(--mono-700)', fontWeight: 600 }}>
                🌱 142.8 tCO₂e Avoided in 2025
              </div>
            </div>
            <div style={{ padding: '6px 0' }}>
              <button
                className="sidebar-item"
                style={{ padding: '7px 10px', color: 'var(--mono-700)', fontSize: '0.78rem' }}
                onClick={() => { alert('Account preferences verified for Sid.'); setUserOpen(false); }}
              >
                <Settings size={14} /> Account Settings
              </button>
              <button
                className="sidebar-item"
                style={{ padding: '7px 10px', color: 'var(--danger)', fontSize: '0.78rem' }}
                onClick={() => { setUserOpen(false); if (onLogout) onLogout(); }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════ NEW SHIPMENT WIZARD ════════════════════════ */
function NewShipmentWizard({ presetData, onGoToTracking }) {
  const [step, setStep] = useState(1)
  const defaultFormData = {
    origin: 'Shanghai, China (PVG)', dest: 'Hamburg, Germany (HAM)',
    shipmentName: 'Industrial Components', cargoCategory: 'Machinery',
    cargoDesc: 'Mechanical and electrical components for manufacturing.',
    cargoType: 'machinery', hazardous: 'No', handling: ['Fragile'],
    weight: '1200', weightUnit: 'kg', volume: '15', packages: '12',
    packageType: 'Pallets', dimL: '120', dimW: '80', dimH: '100',
    readyDate: '2025-12-01', deadline: '2025-12-28', flexibility: 'Standard',
    modes: ['sea', 'rail', 'road'], additionalReqs: 'Handle with care, avoid high temperature, ensure secure packaging.',
  }
  const [formData, setFormData] = useState(() => (presetData ? { ...defaultFormData, ...presetData } : defaultFormData))
  const [disruptions, setDisruptions] = useState([])
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState('rail-road')
  const [selectedOption, setSelectedOption] = useState(null)

  useEffect(() => {
    if (step === 2) {
      get(API.data, '/disruptions').then(d => { if (d?.disruptions) setDisruptions(d.disruptions) })
    }
    if (step === 3) {
      const sid = formData.shipmentId || 'COMM-01'
      post(API.decision, '/api/v1/evaluate', { shipment_id: sid }).then(d => {
        if (d?.all_options) setOptions(d.all_options.filter(o => o.feasibility_status === 'Feasible'))
      })
    }
  }, [step, formData.shipmentId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StepIndicator step={step} onStepClick={setStep} />
      <div className="page-content">
        {step === 1 && (
          <>
            <div className="page-header">
              <div className="page-title">Create New Shipment</div>
              <div className="page-sub">Provide your shipment details to get the best transport options.</div>
            </div>
            <Step1Form data={formData} onChange={setFormData} onNext={() => setStep(2)} />
          </>
        )}
        {step === 2 && (
          <>
            <div className="page-header">
              <div className="page-title">Disruption Analysis</div>
              <div className="page-sub">We analyse global disruptions that may affect your shipment and identify the best available routes.</div>
            </div>
            <Step2Disruptions formData={formData} disruptions={disruptions} onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </>
        )}
        {step === 3 && (
          <>
            <div className="page-header">
              <div className="page-title">Compare Transport Options</div>
              <div className="page-sub">Here are the best available transport options based on your requirements and current disruptions.</div>
            </div>
            <Step3Compare formData={formData} options={options} onBack={() => setStep(2)} onNext={() => setStep(4)} selected={selected} setSelected={setSelected} setSelectedOption={setSelectedOption} />
          </>
        )}
        {step === 4 && (
          <>
            <div className="page-header">
              <div className="page-title">Confirm Booking</div>
              <div className="page-sub">Review your shipment and transport details before confirming.</div>
            </div>
            <Step4Confirm formData={formData} selected={selected} selectedOption={selectedOption} onBack={() => setStep(3)} onConfirm={() => setStep(5)} />
          </>
        )}
        {step === 5 && (
          <>
            <div className="page-header">
              <div className="page-title">Track Shipment</div>
              <div className="page-sub">Monitor your shipment progress in real time.</div>
            </div>
            <Step5Track
              formData={formData}
              selectedOption={selectedOption}
              onNewShipment={() => {
                setFormData(defaultFormData)
                setSelectedOption(null)
                setStep(1)
              }}
              onGoToTracking={onGoToTracking}
            />
          </>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════ MAIN APP ════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState('new-shipment')
  const [trackingShipmentId, setTrackingShipmentId] = useState(null)
  const [presetData, setPresetData] = useState(null)

  const handleTrackShipment = (shipmentId) => {
    setTrackingShipmentId(shipmentId)
    setPage('tracking')
  }

  const handleBookRoute = (route) => {
    setPresetData({
      origin: route.origin,
      dest: route.destination,
      shipmentName: `Shipment for ${route.shipment_id}`,
      shipmentId: route.shipment_id,
    })
    setPage('new-shipment')
  }

  const handleLogout = () => {
    alert('Session successfully ended. Demo session refreshed.')
  }

  const pageTitles = {
    'new-shipment': 'New Shipment Planning',
    'my-shipments': 'Fleet Shipments Directory',
    'tracking': 'Live Telemetry & Tracking',
    'saved-routes': 'Global Trade Lanes',
    'emissions': 'Scope 3 Emissions Intelligence',
    'help': 'Help & Support Documentation',
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} onNav={setPage} onLogout={handleLogout} />
      <div className="main-area">
        <TopBar title={pageTitles[page]} onLogout={handleLogout} />

        {page === 'new-shipment'  && (
          <NewShipmentWizard
            key={presetData ? presetData.shipmentId || presetData.origin : 'default'}
            presetData={presetData}
            onGoToTracking={() => setPage('tracking')}
          />
        )}
        {page === 'my-shipments'  && (
          <div className="page-content">
            <MyShipmentsView onTrackShipment={handleTrackShipment} />
          </div>
        )}
        {page === 'tracking'      && (
          <div className="page-content">
            <TrackingView initialId={trackingShipmentId} />
          </div>
        )}
        {page === 'saved-routes'  && (
          <div className="page-content">
            <SavedRoutesView onBookRoute={handleBookRoute} />
          </div>
        )}
        {page === 'emissions'     && (
          <div className="page-content">
            <EmissionsView />
          </div>
        )}
        {page === 'help'          && (
          <div className="page-content">
            <HelpView />
          </div>
        )}
      </div>
    </div>
  )
}
