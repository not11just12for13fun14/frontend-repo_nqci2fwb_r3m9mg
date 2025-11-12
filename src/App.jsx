import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function FutCard({ player, draggable = true, onDragStart }) {
  if (!player) return (
    <div className="aspect-[3/4] w-28 sm:w-32 md:w-36 rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-200 border border-zinc-300 flex items-center justify-center text-zinc-400 text-xs">
      Empty
    </div>
  )
  return (
    <div
      draggable={draggable}
      onDragStart={(e) => onDragStart && onDragStart(e, player)}
      className="aspect-[3/4] w-28 sm:w-32 md:w-36 rounded-xl relative cursor-grab active:cursor-grabbing select-none shadow-md bg-gradient-to-br from-yellow-100 to-amber-200 border border-amber-300"
    >
      <div className="absolute top-2 left-2 text-amber-900 text-lg font-extrabold drop-shadow">{player.rating}</div>
      <div className="absolute top-2 right-2 px-1 py-0.5 text-[10px] rounded bg-white/70 text-amber-900 font-semibold">{player.position}</div>
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <img src={player.img || 'https://static.futdb.app/players/placeholder.png'} alt={player.name} className="h-20 object-contain drop-shadow" />
      </div>
      <div className="absolute bottom-2 left-2 right-2 text-center">
        <div className="text-[11px] font-bold text-amber-900 truncate">{player.name}</div>
        <div className="flex items-center justify-center gap-2 text-[10px] text-amber-800 opacity-90">
          <span>{player.nation}</span>
          <span>•</span>
          <span className="truncate max-w-[60%]">{player.club}</span>
        </div>
      </div>
    </div>
  )
}

function usePlayers(query) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    async function run() {
      setLoading(true)
      try {
        const url = `${API_BASE}/api/players${query ? `?q=${encodeURIComponent(query)}` : ''}`
        const res = await fetch(url, { signal: ctrl.signal })
        const data = await res.json()
        setPlayers(data)
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e)
      } finally {
        setLoading(false)
      }
    }
    run()
    return () => ctrl.abort()
  }, [query])

  return { players, loading }
}

function TopBar({ stats, onSeed, name, setName, onNew, onSave, onOpenLoad, formation, setFormation }) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Squad Builder 25/26</h1>
          <p className="text-sm text-zinc-500">Drag & drop FUT-style cards to build your XI</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/60 border border-zinc-200 rounded-xl px-3 py-2">
            <span className="text-xs text-zinc-500">Players</span>
            <span className="font-bold">{stats.players || 0}/11</span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 border border-zinc-200 rounded-xl px-3 py-2">
            <span className="text-xs text-zinc-500">OVR</span>
            <span className="font-bold">{stats.avg_rating || 0}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 border border-zinc-200 rounded-xl px-3 py-2">
            <span className="text-xs text-zinc-500">Chem</span>
            <span className="font-bold">{stats.chemistry || 0}</span>
            <span className="text-[10px] text-zinc-500">/33</span>
          </div>
          <button onClick={onSeed} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 py-2 shadow">
            Load Sample Players
          </button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Squad name"
            className="w-64 max-w-full text-sm px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          />
          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl border border-zinc-300 bg-white"
          >
            <option>4-3-3</option>
            <option>4-2-3-1</option>
            <option>4-4-2</option>
            <option>3-5-2</option>
            <option>5-3-2</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onNew} className="rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-sm px-3 py-2">New</button>
          <button onClick={onSave} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 py-2 shadow">Save</button>
          <button onClick={onOpenLoad} className="rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-sm px-3 py-2">Load</button>
        </div>
      </div>
    </div>
  )
}

const DEFAULT_SLOTS = 11

function SquadGrid({ squad, onDropToSlot, onClearSlot }) {
  const handleDragOver = (e) => {
    e.preventDefault()
  }
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200">
      {Array.from({ length: DEFAULT_SLOTS }).map((_, idx) => {
        const player = squad[idx]
        return (
          <div
            key={idx}
            onDragOver={handleDragOver}
            onDrop={(e) => {
              const data = e.dataTransfer.getData('application/player')
              if (!data) return
              const parsed = JSON.parse(data)
              onDropToSlot(idx, parsed)
            }}
            className="aspect-[3/4] w-full flex items-center justify-center"
          >
            <div className="relative">
              <FutCard player={player} draggable={false} />
              {player && (
                <button
                  onClick={() => onClearSlot(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs font-bold shadow"
                  title="Remove"
                >
                  ×
                </button>
              )}
              {!player && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="text-[10px] text-zinc-400">Drop here</div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SearchPanel({ onPick }) {
  const [q, setQ] = useState('')
  const { players, loading } = usePlayers(q)

  return (
    <div className="bg-white/60 border border-zinc-200 rounded-2xl p-3 h-full flex flex-col">
      <div className="flex gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search players (name, club, nation)"
          className="w-full text-sm px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
        />
      </div>
      <div className="mt-3 overflow-auto divide-y divide-zinc-100" style={{ maxHeight: 420 }}>
        {loading && <div className="p-3 text-sm text-zinc-500">Loading…</div>}
        {!loading && players.length === 0 && (
          <div className="p-3 text-sm text-zinc-500">No players found.</div>
        )}
        {players.map((p) => (
          <div key={p.id} className="py-2 flex items-center gap-3">
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/player', JSON.stringify(p))
              }}
            >
              <FutCard player={p} onDragStart={(e) => {
                e.dataTransfer.setData('application/player', JSON.stringify(p))
              }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{p.name}</div>
              <div className="text-xs text-zinc-500 truncate">{p.club} • {p.nation} • {p.position}</div>
            </div>
            <button
              onClick={() => onPick(p)}
              className="px-2 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function LoadPanel({ open, onClose, onLoad }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const ctrl = new AbortController()
    async function run() {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/squads`, { signal: ctrl.signal })
        const data = await res.json()
        setItems(data)
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e)
      } finally {
        setLoading(false)
      }
    }
    run()
    return () => ctrl.abort()
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-white w-full sm:max-w-lg rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold">Load Squad</div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700">✕</button>
        </div>
        <div className="max-h-[60vh] overflow-auto divide-y">
          {loading && <div className="p-4 text-sm text-zinc-500">Loading…</div>}
          {!loading && items.length === 0 && (
            <div className="p-4 text-sm text-zinc-500">No saved squads yet.</div>
          )}
          {items.map((it) => (
            <div key={it.id} className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{it.name}</div>
                <div className="text-xs text-zinc-500">{it.formation || '4-3-3'}</div>
              </div>
              <button
                onClick={() => onLoad(it)}
                className="px-2 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Load
              </button>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t text-right">
          <button onClick={onClose} className="text-sm px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200">Close</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [squad, setSquad] = useState(Array(DEFAULT_SLOTS).fill(null))
  const [stats, setStats] = useState({ players: 0, avg_rating: 0, chemistry: 0 })
  const [name, setName] = useState('My Squad')
  const [formation, setFormation] = useState('4-3-3')
  const [currentId, setCurrentId] = useState(null)
  const [showLoad, setShowLoad] = useState(false)

  const playerIds = useMemo(() => squad.map((p) => (p ? p.id : null)), [squad])

  async function recalc() {
    try {
      const res = await fetch(`${API_BASE}/api/calc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_ids: playerIds }),
      })
      const data = await res.json()
      setStats(data.stats || { players: 0, avg_rating: 0, chemistry: 0 })
      if (data.players) {
        const mapped = data.players.map((p, i) => p || squad[i] || null)
        setSquad(mapped)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    recalc()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerIds.join(',')])

  function placeToFirstEmpty(player) {
    const idx = squad.findIndex((s) => !s)
    if (idx === -1) return
    const next = [...squad]
    next[idx] = player
    setSquad(next)
  }

  function onDropToSlot(idx, player) {
    const next = [...squad]
    next[idx] = player
    setSquad(next)
  }

  function onClearSlot(idx) {
    const next = [...squad]
    next[idx] = null
    setSquad(next)
  }

  async function seed() {
    try {
      await fetch(`${API_BASE}/api/seed/players`, { method: 'POST' })
    } catch (e) {
      console.error(e)
    }
  }

  function toSquadPlayersPayload() {
    return squad
      .map((p, idx) => (p ? { slot: idx, player_id: p.id } : null))
      .filter(Boolean)
  }

  async function saveSquad() {
    const payload = { name: name || 'Untitled Squad', formation, players: toSquadPlayersPayload() }
    try {
      if (!currentId) {
        const res = await fetch(`${API_BASE}/api/squads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data && data.id) setCurrentId(data.id)
        alert('Squad saved!')
      } else {
        const res = await fetch(`${API_BASE}/api/squads/${currentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        await res.json()
        alert('Squad updated!')
      }
    } catch (e) {
      console.error(e)
      alert('Failed to save squad')
    }
  }

  function newSquad() {
    setSquad(Array(DEFAULT_SLOTS).fill(null))
    setName('My Squad')
    setFormation('4-3-3')
    setCurrentId(null)
  }

  function loadSquad(doc) {
    const next = Array(DEFAULT_SLOTS).fill(null)
    ;(doc.players || []).forEach((sp) => {
      // We'll fetch full players via recalc after setting ids
      next[sp.slot] = { id: sp.player_id }
    })
    setSquad(next)
    setName(doc.name || 'Loaded Squad')
    setFormation(doc.formation || '4-3-3')
    setCurrentId(doc.id)
    setShowLoad(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-sky-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <TopBar
          stats={stats}
          onSeed={seed}
          name={name}
          setName={setName}
          onNew={newSquad}
          onSave={saveSquad}
          onOpenLoad={() => setShowLoad(true)}
          formation={formation}
          setFormation={setFormation}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SquadGrid squad={squad} onDropToSlot={onDropToSlot} onClearSlot={onClearSlot} />
          </div>
          <div>
            <SearchPanel onPick={placeToFirstEmpty} />
          </div>
        </div>
        <div className="text-xs text-zinc-500">
          Tip: Drag a card from the list into any empty slot, or click Add. Chemistry is based on shared club, league, and nation.
        </div>
      </div>
      <LoadPanel open={showLoad} onClose={() => setShowLoad(false)} onLoad={loadSquad} />
    </div>
  )
}
