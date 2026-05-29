'use client'

import { useState } from 'react'
import type { TourFrame, TourSettings, TransitionStyle, VirtualTourManifest } from '@/types/virtual-tour'
import { SCENE_LABELS_BG } from '@/lib/virtual-tour/constants'

interface Props {
  manifest: VirtualTourManifest
  tourId: number
  onSaved: (manifest: VirtualTourManifest) => void
}

export default function VirtualTourEditor({ manifest, tourId, onSaved }: Props) {
  const [frames, setFrames] = useState(manifest.frames)
  const [settings, setSettings] = useState<TourSettings>(manifest.settings)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  function reorder(from: number, to: number) {
    const next = [...frames]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setFrames(next.map((f, i) => ({ ...f, sortOrder: i })))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/virtual-tours/${tourId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          settings,
          frames: frames.map((f, i) => ({
            imageUrl: f.imageUrl,
            sceneType: f.sceneType,
            sortOrder: i,
            durationMs: f.durationMs,
            cameraPosition: f.cameraPosition,
            cameraTarget: f.cameraTarget,
            transition: f.transition,
            stabilizedUrl: f.stabilizedUrl,
          })),
          publish: true,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      onSaved(json.tour.manifest)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Грешка')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="vt-editor">
      <h3 className="vt-editor__title">Редактор на тур</h3>

      <div className="vt-editor__settings">
        <label>
          Скорост
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={settings.autoplaySpeed}
            onChange={e => setSettings(s => ({ ...s, autoplaySpeed: Number(e.target.value) }))}
          />
        </label>
        <label>
          Преход
          <select
            value={settings.transitionStyle}
            onChange={e =>
              setSettings(s => ({ ...s, transitionStyle: e.target.value as TransitionStyle }))
            }
          >
            <option value="cinematic">Cinematic</option>
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
            <option value="crossfade">Crossfade</option>
          </select>
        </label>
        <label>
          Easing
          <select value={settings.easing} onChange={e => setSettings(s => ({ ...s, easing: e.target.value }))}>
            <option value="power2.inOut">power2.inOut</option>
            <option value="power3.out">power3.out</option>
            <option value="sine.inOut">sine.inOut</option>
          </select>
        </label>
        <label>
          Trim start (ms)
          <input
            type="number"
            min={0}
            value={settings.trimStartMs}
            onChange={e => setSettings(s => ({ ...s, trimStartMs: Number(e.target.value) }))}
          />
        </label>
        <label>
          Trim end (ms)
          <input
            type="number"
            min={0}
            value={settings.trimEndMs}
            onChange={e => setSettings(s => ({ ...s, trimEndMs: Number(e.target.value) }))}
          />
        </label>
      </div>

      <ul className="vt-editor__list">
        {frames.map((f, i) => (
          <li
            key={`${f.id}-${i}`}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (dragIdx !== null && dragIdx !== i) reorder(dragIdx, i)
              setDragIdx(null)
            }}
            className="vt-editor__item"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.imageUrl} alt="" />
            <div>
              <strong>{SCENE_LABELS_BG[f.sceneType]}</strong>
              <input
                type="number"
                min={1200}
                max={12000}
                step={100}
                value={f.durationMs}
                onChange={e => {
                  const ms = Number(e.target.value)
                  setFrames(prev => prev.map((x, j) => (j === i ? { ...x, durationMs: ms } : x)))
                }}
              />
              <span className="vt-editor__ms">ms</span>
            </div>
          </li>
        ))}
      </ul>

      <button type="button" className="btn-crimson" onClick={save} disabled={saving}>
        {saving ? 'Запис...' : 'Запази и публикувай'}
      </button>
    </div>
  )
}
