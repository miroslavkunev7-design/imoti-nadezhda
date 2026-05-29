'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const FILL = '#141018'
const DIST = 2.15
const OVERSCAN = 1.14
const _offset = new THREE.Vector3()

interface Props {
  textureA: THREE.Texture | null
  textureB?: THREE.Texture | null
  blend?: number
  opacity?: number
}

/** Пълно запълване на екрана — снимката следва камерата (Street View изглед). */
export default function SpatialOccupancyDome({
  textureA,
  textureB,
  blend = 0,
  opacity = 1,
}: Props) {
  const planeA = useRef<THREE.Mesh>(null)
  const planeB = useRef<THREE.Mesh>(null)
  const { camera, size } = useThree()

  const placeScreenPlane = (mesh: THREE.Mesh, zExtra: number) => {
    mesh.position.copy(camera.position)
    mesh.quaternion.copy(camera.quaternion)
    _offset.set(0, 0, -(DIST + zExtra))
    _offset.applyQuaternion(camera.quaternion)
    mesh.position.add(_offset)
    const cam = camera as THREE.PerspectiveCamera
    const vFov = (cam.fov * Math.PI) / 180
    const h = 2 * Math.tan(vFov / 2) * DIST * OVERSCAN
    const w = h * (size.width / Math.max(size.height, 1))
    mesh.scale.set(w, h, 1)
  }

  useFrame(() => {
    if (planeA.current) placeScreenPlane(planeA.current, 0)
    if (planeB.current) placeScreenPlane(planeB.current, 0.002)
  })

  useEffect(() => {
    for (const tex of [textureA, textureB]) {
      if (!tex) continue
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
    }
  }, [textureA, textureB])

  const opA = opacity * (1 - blend)
  const opB = opacity * blend

  return (
    <group>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[180, 48, 32]} />
        <meshBasicMaterial color={FILL} side={THREE.BackSide} />
      </mesh>
      {textureA && (
        <mesh ref={planeA}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={textureA}
            transparent
            opacity={opA}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      )}
      {textureB && blend > 0.01 && (
        <mesh ref={planeB}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={textureB}
            transparent
            opacity={opB}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}
