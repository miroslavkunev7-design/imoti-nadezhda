'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import type { GuidedPathSegment, VirtualTourManifest } from '@/types/virtual-tour'
import { buildGuidedPath } from '@/lib/virtual-tour/guided-path'
import type { SceneGraphResult } from '@/lib/virtual-tour/scene-graph'
import SpatialOccupancyDome from '@/components/virtual-tour/SpatialOccupancyDome'

interface Props {
  manifest: VirtualTourManifest
  onExit?: () => void
}

const HEAD_Y = 1.68

function useTextureSafe(url: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!url) return
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    let cancelled = false
    loader.load(
      url,
      t => {
        if (cancelled) return
        t.colorSpace = THREE.SRGBColorSpace
        t.minFilter = THREE.LinearFilter
        t.magFilter = THREE.LinearFilter
        setTex(t)
      },
      undefined,
      () => {
        if (!cancelled) setTex(null)
      }
    )
    return () => {
      cancelled = true
      setTex(null)
    }
  }, [url])
  return tex
}

function DoorSet({ open }: { open: number }) {
  const left = useRef<THREE.Mesh>(null)
  const right = useRef<THREE.Mesh>(null)
  useEffect(() => {
    if (left.current) left.current.position.x = -0.55 - open * 0.9
    if (right.current) right.current.position.x = 0.55 + open * 0.9
  }, [open])
  return (
    <group position={[0, HEAD_Y, -2.4]}>
      <mesh ref={left}>
        <boxGeometry args={[0.1, 2.4, 0.14]} />
        <meshStandardMaterial color="#3d2818" />
      </mesh>
      <mesh ref={right}>
        <boxGeometry args={[0.1, 2.4, 0.14]} />
        <meshStandardMaterial color="#3d2818" />
      </mesh>
    </group>
  )
}

function WalkWorld({
  segment,
  blendUrl,
  doorOpen,
  freeLook,
  onSegmentDone,
}: {
  segment: GuidedPathSegment
  blendUrl: string
  doorOpen: number
  freeLook: boolean
  onSegmentDone: () => void
}) {
  const { camera } = useThree()
  const urlA = segment.stabilizedUrl ?? segment.imageUrl
  const urlB = segment.isBridge && segment.blendToUrl ? segment.blendToUrl : blendUrl
  const texA = useTextureSafe(urlA)
  const texB = useTextureSafe(urlB !== urlA ? urlB : urlA)
  const [opacity, setOpacity] = useState(1)
  const [blend, setBlend] = useState(0)
  const doneRef = useRef(false)
  const swayRef = useRef({ t: 0 })

  useEffect(() => {
    doneRef.current = false
    setBlend(0)
    camera.position.set(segment.fromCamera.x, segment.fromCamera.y, segment.fromCamera.z)
    camera.lookAt(segment.fromTarget.x, segment.fromTarget.y, segment.fromTarget.z)

    const tl = gsap.timeline({
      onComplete: () => {
        if (!doneRef.current) {
          doneRef.current = true
          onSegmentDone()
        }
      },
    })

    if (segment.isBridge) {
      tl.to({ b: 0 }, {
        b: 1,
        duration: segment.durationMs / 1000,
        ease: 'power2.inOut',
        onUpdate() {
          setBlend((this.targets()[0] as { b: number }).b)
        },
      })
    }

    const dur = segment.durationMs / 1000
    const pos = { ...segment.fromCamera }
    const tgt = { ...segment.fromTarget }
    tl.to(
      pos,
      {
        x: segment.toCamera.x,
        y: segment.toCamera.y,
        z: segment.toCamera.z,
        duration: dur,
        ease: 'power2.inOut',
        onUpdate() {
          const s = Math.sin(swayRef.current.t * 3.2) * 0.022
          camera.position.set(pos.x, pos.y + s, pos.z)
          swayRef.current.t += 0.016
        },
      },
      0.05
    )
    tl.to(
      tgt,
      {
        x: segment.toTarget.x,
        y: segment.toTarget.y,
        z: segment.toTarget.z,
        duration: dur,
        ease: 'power2.inOut',
        onUpdate() {
          camera.lookAt(tgt.x, tgt.y, tgt.z)
        },
      },
      0.05
    )
    return () => {
      tl.kill()
    }
  }, [segment.id, camera, onSegmentDone, segment])

  const showDoor =
    segment.phase === 'door_open' ||
    segment.phase === 'door_approach' ||
    segment.phase === 'enter_hallway'

  return (
    <>
      <ambientLight intensity={0.92} />
      <directionalLight position={[5, 10, 4]} intensity={0.55} />
      <SpatialOccupancyDome textureA={texA} textureB={texB} blend={blend} opacity={opacity} />
      {showDoor && <DoorSet open={doorOpen} />}
      {freeLook ? (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={-0.38}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI - 0.25}
          enableDamping
          dampingFactor={0.07}
        />
      ) : (
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      )}
    </>
  )
}

function pathFromManifest(manifest: VirtualTourManifest): GuidedPathSegment[] {
  if (manifest.guidedPath?.length) return manifest.guidedPath
  const graph: SceneGraphResult = {
    nodes: manifest.nodes ?? [],
    edges: manifest.edges ?? [],
    startNodeId: manifest.startNodeId ?? manifest.nodes?.[0]?.id ?? '',
  }
  return buildGuidedPath(graph, [])
}

export default function VirtualTourGuided({ manifest, onExit }: Props) {
  const segments = useMemo(() => pathFromManifest(manifest), [manifest])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [freeLook, setFreeLook] = useState(false)
  const [ready, setReady] = useState(false)
  const pausedRef = useRef(paused)
  const freeLookRef = useRef(freeLook)
  const indexRef = useRef(index)
  pausedRef.current = paused
  freeLookRef.current = freeLook
  indexRef.current = index

  const segment = segments[index]
  const nextUrl =
    segments[index + 1]?.stabilizedUrl ??
    segments[index + 1]?.imageUrl ??
    segment?.imageUrl ??
    ''

  const advance = useCallback(() => {
    setReady(false)
    setIndex(i => Math.min(i + 1, segments.length - 1))
  }, [segments.length])

  const goBack = useCallback(() => {
    setReady(false)
    setIndex(i => Math.max(0, i - 1))
  }, [])

  const jumpRoom = useCallback(
    (dir: 1 | -1) => {
      if (!segment?.nodeId) return
      const nodeIds = [...new Set(segments.map(s => s.nodeId).filter(Boolean))]
      const ci = nodeIds.indexOf(segment.nodeId!)
      const ni = ci + dir
      if (ni < 0 || ni >= nodeIds.length) return
      const target = nodeIds[ni]
      const idx = segments.findIndex(s => s.nodeId === target && !s.isBridge)
      if (idx >= 0) {
        setReady(false)
        setIndex(idx)
      }
    },
    [segment, segments]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        setPaused(p => !p)
      }
      if (e.key === 'ArrowRight') advance()
      if (e.key === 'ArrowLeft') goBack()
      if (e.key === 'Escape') onExit?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, goBack, onExit])

  if (!segment) {
    return <div className="vt-guided vt-guided--empty">Няма разходка за този имот.</div>
  }

  const doorOpen =
    segment.phase === 'door_open' ? 1 : segment.phase === 'door_approach' ? 0.4 : 0

  return (
    <div className="vt-guided">
      <div className="vt-guided__brand">ИМОТИ НАДЕЖДА</div>

      <Canvas
        className="vt-guided__canvas"
        camera={{ position: [0, HEAD_Y, 9], fov: 78, near: 0.05, far: 300 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0e080a')
        }}
      >
        <color attach="background" args={['#0e080a']} />
        <Suspense fallback={null}>
          <WalkWorld
            key={segment.id}
            segment={segment}
            blendUrl={nextUrl}
            doorOpen={doorOpen}
            freeLook={freeLook}
            onSegmentDone={() => {
              setReady(true)
              if (
                !pausedRef.current &&
                !freeLookRef.current &&
                indexRef.current < segments.length - 1
              ) {
                advance()
              }
            }}
          />
        </Suspense>
      </Canvas>

      {!ready && <div className="vt-guided__loading" aria-hidden />}

      <div className="vt-guided__room vt-guided__glass">
        <strong>{segment.label}</strong>
        <span>
          {segment.phase === 'bridge_transition'
            ? 'Преминаване…'
            : `Разходка ${index + 1} / ${segments.length}`}
        </span>
      </div>

      <nav className="vt-guided__controls vt-guided__glass" aria-label="Контроли">
        <button type="button" onClick={() => setPaused(p => !p)}>
          {paused ? 'Продължи' : 'Пауза'}
        </button>
        <button type="button" onClick={() => setFreeLook(f => !f)}>
          {freeLook ? 'Насочен режим' : 'Свободен оглед'}
        </button>
        <button type="button" onClick={() => jumpRoom(1)}>
          Следваща стая
        </button>
        <button type="button" onClick={() => jumpRoom(-1)}>
          Назад
        </button>
        <button type="button" className="vt-guided__exit" onClick={() => onExit?.()}>
          Изход
        </button>
      </nav>
    </div>
  )
}
