'use client'

import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import type { VirtualTourManifest } from '@/types/virtual-tour'

interface SceneProps {
  manifest: VirtualTourManifest
  frameIndex: number
  autoplay: boolean
  onFrameIndex: (i: number) => void
  onReady?: () => void
}

const PLANE_POS: [number, number, number] = [0, 1.55, -4]
const PLANE_SIZE: [number, number, number] = [7.2, 4.5, 1]
const CAMERA_HOME: [number, number, number] = [0, 1.55, 0.6]
const LOOK_AT: [number, number, number] = [0, 1.55, -4]

function SceneLoader() {
  return (
    <mesh position={PLANE_POS}>
      <planeGeometry args={[3, 2]} />
      <meshBasicMaterial color="#2a1520" wireframe />
    </mesh>
  )
}

function FramePlane({ imageUrl, onReady }: { imageUrl: string; onReady?: () => void }) {
  const texture = useLoader(
    THREE.TextureLoader,
    imageUrl,
    (loader: THREE.TextureLoader) => {
      loader.setCrossOrigin('anonymous')
    }
  )
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  const reported = useRef(false)

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
  }, [texture])

  useEffect(() => {
    const mat = matRef.current
    if (!mat) return
    mat.opacity = 0
    const tween = gsap.to(mat, {
      opacity: 1,
      duration: 0.55,
      ease: 'power2.out',
      onComplete: () => {
        if (!reported.current) {
          reported.current = true
          onReady?.()
        }
      },
    })
    return () => {
      tween.kill()
    }
  }, [imageUrl, onReady])

  return (
    <mesh position={PLANE_POS} scale={PLANE_SIZE}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={0}
        side={THREE.FrontSide}
        toneMapped={false}
      />
    </mesh>
  )
}

function CameraRig() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(...CAMERA_HOME)
    camera.lookAt(...LOOK_AT)
    camera.near = 0.1
    camera.far = 200
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

function TourContent({
  manifest,
  frameIndex,
  autoplay,
  onFrameIndex,
  onReady,
}: SceneProps) {
  const frame = manifest.frames[frameIndex]
  const imageUrl = frame?.imageUrl ?? ''

  useEffect(() => {
    if (!autoplay || manifest.frames.length < 2 || !frame) return
    const id = setTimeout(() => {
      onFrameIndex((frameIndex + 1) % manifest.frames.length)
    }, frame.durationMs / manifest.settings.autoplaySpeed)
    return () => clearTimeout(id)
  }, [autoplay, frame, frameIndex, manifest, onFrameIndex])

  if (!imageUrl) return null

  return (
    <>
      <CameraRig />
      <ambientLight intensity={1.15} />
      <directionalLight position={[2, 4, 3]} intensity={0.35} />
      <Suspense fallback={<SceneLoader />}>
        <FramePlane key={imageUrl} imageUrl={imageUrl} onReady={onReady} />
      </Suspense>
      <OrbitControls
        target={LOOK_AT}
        enablePan={false}
        minDistance={0.8}
        maxDistance={6}
        maxPolarAngle={Math.PI * 0.52}
        minPolarAngle={Math.PI * 0.28}
        enableDamping
        dampingFactor={0.06}
      />
    </>
  )
}

export default function VirtualTourScene(props: SceneProps) {
  return (
    <Canvas
      className="vt-canvas"
      camera={{ position: CAMERA_HOME, fov: 52, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1)]}
      onCreated={({ gl }) => {
        gl.setClearColor('#120a10')
      }}
    >
      <color attach="background" args={['#120a10']} />
      <TourContent {...props} />
    </Canvas>
  )
}
