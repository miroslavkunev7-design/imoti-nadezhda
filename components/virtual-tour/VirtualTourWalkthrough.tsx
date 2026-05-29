'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import type { TourNode, TourStepFrame, VirtualTourManifest } from '@/types/virtual-tour'
import TourFloorNav from '@/components/virtual-tour/TourFloorNav'

interface WalkProps {
  manifest: VirtualTourManifest
  onReady?: () => void
}

const AMBIENT = '#1a1016'

/** Само истински 2:1 equirectangular — пълна 360° сфера */
function Panorama360({ url, onReady }: { url: string; onReady?: () => void }) {
  const texture = useLoader(THREE.TextureLoader, url, (loader: THREE.TextureLoader) => {
    loader.setCrossOrigin('anonymous')
  })
  const reported = useRef(false)

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.mapping = THREE.EquirectangularReflectionMapping
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    if (!reported.current) {
      reported.current = true
      onReady?.()
    }
  }, [texture, onReady, url])

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 80, 50]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  )
}

/** Обикновена снимка — тъмен „стаен“ ореол + ограничено въртене (без черна празнина на сфера) */
function PhotoViewpoint({
  step,
  onReady,
}: {
  step: TourStepFrame
  onReady?: () => void
}) {
  const texture = useLoader(THREE.TextureLoader, step.imageUrl, (loader: THREE.TextureLoader) => {
    loader.setCrossOrigin('anonymous')
  })
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  const reported = useRef(false)
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    const mat = matRef.current
    if (mat) {
      mat.opacity = 0
      gsap.to(mat, {
        opacity: 1,
        duration: 0.4,
        onComplete: () => {
          if (!reported.current) {
            reported.current = true
            onReady?.()
          }
        },
      })
    }
  }, [step.imageUrl, onReady, texture])

  const ox = step.positionOffset.x
  const oz = step.positionOffset.z
  const yawLimit = 0.55

  return (
    <>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[40, 32, 24]} />
        <meshBasicMaterial color={AMBIENT} side={THREE.BackSide} />
      </mesh>
      <group position={[ox, 0, oz]} rotation={[0, step.yawOffset, 0]}>
        <mesh position={[0, 1.55, -4.2]}>
          <planeGeometry args={[7.5, 4.6]} />
          <meshBasicMaterial
            ref={matRef}
            map={texture}
            transparent
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0.02, -2]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[5.5, 48]} />
          <meshBasicMaterial color="#2a1818" transparent opacity={0.85} />
        </mesh>
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        rotateSpeed={-0.32}
        minAzimuthAngle={-yawLimit}
        maxAzimuthAngle={yawLimit}
        minPolarAngle={Math.PI * 0.38}
        maxPolarAngle={Math.PI * 0.52}
        target={[ox, 1.55, -4]}
        enableDamping
        dampingFactor={0.06}
      />
    </>
  )
}

function DoorPortal({
  open,
  onComplete,
}: {
  open: boolean
  onComplete: () => void
}) {
  const leftRef = useRef<THREE.Mesh>(null)
  const rightRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (!open || !leftRef.current || !rightRef.current) return
    gsap.to(leftRef.current.position, { x: -1.4, duration: 1.1, ease: 'power2.inOut' })
    gsap.to(rightRef.current.position, {
      x: 1.4,
      duration: 1.1,
      ease: 'power2.inOut',
      onComplete,
    })
  }, [open, onComplete])

  return (
    <group position={[0, 1.55, -3.2]}>
      <mesh ref={leftRef} position={[-0.05, 0, 0]}>
        <boxGeometry args={[0.08, 2.6, 0.12]} />
        <meshStandardMaterial color="#3d2818" />
      </mesh>
      <mesh ref={rightRef} position={[0.05, 0, 0]}>
        <boxGeometry args={[0.08, 2.6, 0.12]} />
        <meshStandardMaterial color="#3d2818" />
      </mesh>
    </group>
  )
}

function SceneWorld({
  node,
  stepIndex,
  doorOpening,
  onDoorDone,
  onReady,
}: {
  node: TourNode
  stepIndex: number
  doorOpening: boolean
  onDoorDone: () => void
  onReady?: () => void
}) {
  const step = node.steps[stepIndex]
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 1.55, 0.15)
    camera.lookAt(0, 1.55, -4)
    camera.updateProjectionMatrix()
  }, [camera, node.id, stepIndex])

  if (!step) return null

  const isPanorama = step.viewKind === 'panorama360'

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 6, 2]} intensity={0.45} />
      <Suspense fallback={null}>
        {isPanorama ? (
          <Panorama360 url={step.imageUrl} onReady={onReady} />
        ) : (
          <PhotoViewpoint step={step} onReady={onReady} />
        )}
      </Suspense>
      {node.hasDoor && doorOpening && <DoorPortal open={doorOpening} onComplete={onDoorDone} />}
      {isPanorama && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={-0.42}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI - 0.15}
          enableDamping
          dampingFactor={0.05}
        />
      )}
    </>
  )
}

export default function VirtualTourWalkthrough({ manifest, onReady }: WalkProps) {
  const nodes = useMemo(() => manifest.nodes ?? [], [manifest.nodes])
  const edges = useMemo(() => manifest.edges ?? [], [manifest.edges])
  const startId = manifest.startNodeId ?? nodes[0]?.id ?? ''

  const [nodeId, setNodeId] = useState(startId)
  const [stepIndex, setStepIndex] = useState(0)
  const [doorOpening, setDoorOpening] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pendingDoorTarget, setPendingDoorTarget] = useState<string | null>(null)

  const currentNode = useMemo(
    () => nodes.find(n => n.id === nodeId) ?? nodes[0],
    [nodes, nodeId]
  )

  const nextEdge = useMemo(
    () => edges.find(e => e.from === currentNode?.id),
    [edges, currentNode?.id]
  )

  const nextNode = useMemo(
    () => (nextEdge ? nodes.find(n => n.id === nextEdge.to) : null),
    [nodes, nextEdge]
  )

  const step = currentNode?.steps[stepIndex]
  const hasNextStep = Boolean(currentNode && stepIndex < currentNode.steps.length - 1)
  const isPanorama = step?.viewKind === 'panorama360'

  const goNextStep = useCallback(() => {
    if (!currentNode) return
    if (stepIndex < currentNode.steps.length - 1) {
      setLoading(true)
      setStepIndex(i => i + 1)
    }
  }, [currentNode, stepIndex])

  const goToNode = useCallback(
    (targetId: string) => {
      const edge = edges.find(e => e.from === currentNode?.id && e.to === targetId)
      const target = nodes.find(n => n.id === targetId)
      if (!edge || !target) return

      const useDoor =
        edge.transition === 'door' || currentNode?.sceneType === 'entrance'

      if (useDoor && currentNode?.hasDoor) {
        setPendingDoorTarget(targetId)
        setDoorOpening(true)
        return
      }
      setLoading(true)
      setNodeId(targetId)
      setStepIndex(0)
    },
    [currentNode, edges, nodes]
  )

  const onDoorDone = useCallback(() => {
    if (pendingDoorTarget) {
      setDoorOpening(false)
      setLoading(true)
      setNodeId(pendingDoorTarget)
      setStepIndex(0)
      setPendingDoorTarget(null)
    } else if (nextNode) {
      setDoorOpening(false)
      setLoading(true)
      setNodeId(nextNode.id)
      setStepIndex(0)
    }
  }, [pendingDoorTarget, nextNode])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd') {
        if (hasNextStep) goNextStep()
        else if (nextNode) goToNode(nextNode.id)
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (stepIndex > 0) {
          setLoading(true)
          setStepIndex(i => i - 1)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNextStep, goToNode, hasNextStep, nextNode, stepIndex])

  if (!currentNode || !step) {
    return <div className="vt-walk vt-walk--empty">Няма сцени за разходка.</div>
  }

  return (
    <div className="vt-walk">
      {loading && (
        <div className="vt-viewer-loading vt-viewer-loading--overlay">Зареждане...</div>
      )}

      <Canvas
        className="vt-canvas"
        camera={{
          position: [0, 1.55, 0.15],
          fov: isPanorama ? 75 : 58,
          near: 0.1,
          far: 200,
        }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor('#0e080c')}
      >
        <color attach="background" args={['#0e080c']} />
        <Suspense fallback={null}>
          <SceneWorld
            key={`${nodeId}-${stepIndex}-${step.imageUrl}`}
            node={currentNode}
            stepIndex={stepIndex}
            doorOpening={doorOpening}
            onDoorDone={onDoorDone}
            onReady={() => {
              setLoading(false)
              onReady?.()
            }}
          />
        </Suspense>
      </Canvas>

      <TourFloorNav
        currentNode={currentNode}
        nodes={nodes}
        edges={edges}
        stepIndex={stepIndex}
        onGoToNode={goToNode}
        onNextStep={goNextStep}
        hasNextStep={hasNextStep}
      />

      <div className="vt-walk__hud">
        <div className="vt-walk__info">
          <strong>{currentNode.label}</strong>
          <span>
            {isPanorama
              ? '360° панорама — влачи мишката за обиколка'
              : `Изглед ${stepIndex + 1} / ${currentNode.steps.length} — леко въртене наляво/надясно`}
          </span>
          <span className="vt-walk__hint">
            Кликни белите стрелки на пода за преход · Enter / стрелки на клавиатура
          </span>
        </div>
      </div>
    </div>
  )
}
