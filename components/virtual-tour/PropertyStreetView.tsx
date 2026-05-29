'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { TourNode, VirtualTourManifest } from '@/types/virtual-tour'
import { shouldRenderPanoramaSphere } from '@/lib/virtual-tour/panorama-view'
import SpatialOccupancyDome from '@/components/virtual-tour/SpatialOccupancyDome'
import TourFloorNav from '@/components/virtual-tour/TourFloorNav'

interface Props {
  manifest: VirtualTourManifest
  onExit?: () => void
}

const HEAD_Y = 1.68

function useTexture(url: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!url) return
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    let cancelled = false
    const hiRes = url.includes('res.cloudinary.com')
      ? url.replace('/upload/', '/upload/q_auto:best,f_auto,w_4096/')
      : url
    loader.load(
      hiRes,
      t => {
        if (cancelled) return
        t.colorSpace = THREE.SRGBColorSpace
        t.minFilter = THREE.LinearFilter
        t.magFilter = THREE.LinearFilter
        t.anisotropy = 16
        setTex(t)
      },
      undefined,
      () => {
        if (!cancelled) setTex(null)
      }
    )
    return () => {
      cancelled = true
    }
  }, [url])
  return tex
}

function PanoramaSphere({ url }: { url: string }) {
  const tex = useTexture(url)
  if (!tex) return null
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 128, 64]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  )
}

function ViewpointScene({
  imageUrl,
  isPanorama,
  blendUrl,
  blending,
}: {
  imageUrl: string
  isPanorama: boolean
  blendUrl: string
  blending: boolean
}) {
  const texA = useTexture(imageUrl)
  const texB = useTexture(blending && blendUrl !== imageUrl ? blendUrl : imageUrl)

  if (isPanorama) {
    return (
      <>
        <PanoramaSphere url={imageUrl} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={-0.32}
          enableDamping
          dampingFactor={0.08}
        />
      </>
    )
  }

  return (
    <>
      <ambientLight intensity={0.95} />
      <SpatialOccupancyDome
        textureA={texA}
        textureB={blending ? texB : null}
        blend={blending ? 0.5 : 0}
        opacity={1}
      />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        rotateSpeed={-0.38}
        minAzimuthAngle={-0.85}
        maxAzimuthAngle={0.85}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI - 0.35}
        enableDamping
        dampingFactor={0.07}
      />
    </>
  )
}

export default function PropertyStreetView({ manifest, onExit }: Props) {
  const nodes = useMemo(() => manifest.nodes ?? [], [manifest.nodes])
  const edges = useMemo(() => manifest.edges ?? [], [manifest.edges])
  const startId = manifest.startNodeId ?? nodes[0]?.id ?? ''

  const [nodeId, setNodeId] = useState(startId)
  const [stepIndex, setStepIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [blendTarget, setBlendTarget] = useState<string | null>(null)

  const currentNode = useMemo(
    () => nodes.find(n => n.id === nodeId) ?? nodes[0],
    [nodes, nodeId]
  )

  const step = currentNode?.steps[stepIndex]
  const hasNextStep = Boolean(currentNode && stepIndex < currentNode.steps.length - 1)

  const useSphere =
    Boolean(step) &&
    shouldRenderPanoramaSphere(step.imageUrl, step.aspectRatio ?? undefined)

  const goToNode = useCallback(
    (targetId: string) => {
      const target = nodes.find(n => n.id === targetId)
      const targetStep = target?.steps[0]
      if (!target || !targetStep || !step) return
      setTransitioning(true)
      setBlendTarget(targetStep.imageUrl)
      window.setTimeout(() => {
        setNodeId(targetId)
        setStepIndex(0)
        setTransitioning(false)
        setBlendTarget(null)
      }, 420)
    },
    [nodes, step]
  )

  const nextStep = useCallback(() => {
    if (!hasNextStep || !currentNode) return
    const next = currentNode.steps[stepIndex + 1]
    if (!step) return
    setTransitioning(true)
    setBlendTarget(next.imageUrl)
    window.setTimeout(() => {
      setStepIndex(i => i + 1)
      setTransitioning(false)
      setBlendTarget(null)
    }, 380)
  }, [currentNode, hasNextStep, step, stepIndex])

  const prevStep = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(i => i - 1)
      return
    }
    const idx = nodes.findIndex(n => n.id === nodeId)
    if (idx > 0) {
      const prev = nodes[idx - 1]
      setNodeId(prev.id)
      setStepIndex(Math.max(0, prev.steps.length - 1))
    }
  }, [nodeId, nodes, stepIndex])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit?.()
      if (e.key === 'ArrowRight') nextStep()
      if (e.key === 'ArrowLeft') prevStep()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nextStep, onExit, prevStep])

  if (!currentNode || !step) {
    return <div className="vt-street vt-street--empty">Няма точки за оглед.</div>
  }

  const blendUrl = blendTarget ?? step.imageUrl
  const totalSteps = nodes.reduce((s, n) => s + n.steps.length, 0)
  const globalIndex =
    nodes
      .slice(0, nodes.findIndex(n => n.id === nodeId))
      .reduce((s, n) => s + n.steps.length, 0) + stepIndex + 1

  return (
    <div className="vt-street">
      <div className="vt-guided__brand">ИМОТИ НАДЕЖДА</div>

      <Canvas
        className="vt-guided__canvas"
        camera={{ position: [0, HEAD_Y, 0], fov: 56, near: 0.1, far: 600 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor('#0e080a')}
      >
        <color attach="background" args={['#0e080a']} />
        <Suspense fallback={null}>
          <ViewpointScene
            key={`${nodeId}-${stepIndex}-${step.imageUrl}`}
            imageUrl={step.imageUrl}
            isPanorama={useSphere}
            blendUrl={blendUrl}
            blending={transitioning}
          />
        </Suspense>
      </Canvas>

      <TourFloorNav
        currentNode={currentNode}
        nodes={nodes}
        edges={edges}
        stepIndex={stepIndex}
        onGoToNode={goToNode}
        onNextStep={nextStep}
        hasNextStep={hasNextStep}
      />

      <div className="vt-street__hud vt-guided__glass">
        <strong>{currentNode.label}</strong>
        <span>
          {useSphere
            ? '360° — влачи за обиколка · стрелките за преход'
            : 'Влачи за оглед · стрелките на пода за следваща точка'}
        </span>
        <span className="vt-street__counter">
          Изглед {globalIndex} / {totalSteps} · {nodes.length} зони
        </span>
      </div>

      <nav className="vt-guided__controls vt-guided__glass" aria-label="Контроли">
        <button type="button" onClick={prevStep}>
          Назад
        </button>
        <button type="button" onClick={nextStep} disabled={!hasNextStep}>
          Напред
        </button>
        <button type="button" className="vt-guided__exit" onClick={() => onExit?.()}>
          Изход
        </button>
      </nav>
    </div>
  )
}
