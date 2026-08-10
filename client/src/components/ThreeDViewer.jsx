import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
import * as THREE from 'three'

function ShapeMesh({ type, dimensions = {}, highlightFaces = [], cuttingPlane, showWireframe = false, showDimensions = false, color = '#4dabf7', opacity = 1 }) {
  const meshRef = useRef()
  const { w = 1, h = 1, d = 1, r = 0.5, sides = 3, height = 1 } = dimensions
  const hlSet = useMemo(() => new Set(highlightFaces), [highlightFaces])

  const geometry = useMemo(() => {
    switch (type) {
      case 'cube':
        return new THREE.BoxGeometry(w, h, d)
      case 'cuboid':
        return new THREE.BoxGeometry(w, h, d)
      case 'sphere':
        return new THREE.SphereGeometry(r || 0.6, 32, 32)
      case 'cylinder':
        return new THREE.CylinderGeometry(r || 0.5, r || 0.5, height || h, 32)
      case 'cone':
        return new THREE.ConeGeometry(r || 0.6, height || h, 32)
      case 'pyramid': {
        const geo = new THREE.ConeGeometry(r || 0.7, height || h, sides || 4)
        geo.rotateY(Math.PI / (sides || 4))
        return geo
      }
      case 'triangular-prism':
        return new THREE.CylinderGeometry(r || 0.6, r || 0.6, height || h, 3)
      case 'torus':
        return new THREE.TorusGeometry(r || 0.5, (r || 0.5) * 0.35, 16, 48)
      case 'frustum': {
        const tr = (r || 0.5) * 0.4
        return new THREE.CylinderGeometry(tr, r || 0.5, height || h, 32)
      }
      default:
        return new THREE.BoxGeometry(1, 1, 1)
    }
  }, [type, w, h, d, r, height, sides])

  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry])

  const cuttingPlaneHelper = useMemo(() => {
    if (!cuttingPlane) return null
    const { position = [0, 0, 0], normal = [0, 1, 0], color = '#e03131' } = cuttingPlane
    const size = 3
    return { position: new THREE.Vector3(...position), normal: new THREE.Vector3(...normal), color, size }
  }, [cuttingPlane])

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={color}
          transparent={opacity < 1}
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={opacity >= 1}
        />
      </mesh>
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color="#1e1e1e" linewidth={1} />
      </lineSegments>
      {showWireframe && (
        <mesh geometry={geometry}>
          <meshBasicMaterial color="#1e1e1e" wireframe />
        </mesh>
      )}
      {cuttingPlaneHelper && (
        <mesh position={cuttingPlaneHelper.position} rotation={[0, 0, 0]}>
          <planeGeometry args={[cuttingPlaneHelper.size, cuttingPlaneHelper.size]} />
          <meshBasicMaterial color={cuttingPlaneHelper.color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      {showDimensions && type !== 'sphere' && type !== 'torus' && (
        <DimensionLabels type={type} dimensions={dimensions} />
      )}
    </group>
  )
}

function DimensionLabels({ type, dimensions }) {
  const { w = 1, h = 1, d = 1, r = 0.5, height = 1 } = dimensions
  const labelStyle = { fontSize: 11, color: '#e03131', anchorX: 'center', anchorY: 'middle' }

  if (type === 'cube' || type === 'cuboid') {
    return (
      <group>
        <Text position={[0, -(h / 2) - 0.25, 0]} {...labelStyle}>{w}</Text>
        <Text position={[(w / 2) + 0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} {...labelStyle}>{h}</Text>
        {d && <Text position={[0, -(h / 2) - 0.25, d / 2 + 0.2]} {...labelStyle}>{d}</Text>}
      </group>
    )
  }
  if (type === 'cylinder' || type === 'cone') {
    return (
      <group>
        <Text position={[(r || 0.5) + 0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} {...labelStyle}>r={r || 0.5}</Text>
        <Text position={[0, -(height / 2) - 0.25, 0]} {...labelStyle}>h={height}</Text>
      </group>
    )
  }
  return null
}

function SceneSetup() {
  const { camera } = useThree()
  useEffect(() => { camera.position.set(2.5, 2, 3) }, [camera])
  return null
}

export default function ThreeDViewer({
  shapeType = 'cube',
  dimensions = {},
  highlightFaces = [],
  cuttingPlane,
  showWireframe = false,
  showDimensions = false,
  autoRotate = false,
  color = '#4dabf7',
  opacity = 1,
  width = 320,
  height = 280,
  style
}) {
  return (
    <div style={{ width, height, borderRadius: 8, overflow: 'hidden', border: '2px solid var(--clr-border, #e0e0e0)', background: '#f8f9fa', ...style }}>
      <Canvas shadows camera={{ position: [2.5, 2, 3], fov: 40 }}>
        <SceneSetup />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-3, 4, -2]} intensity={0.3} />
        <ShapeMesh
          type={shapeType}
          dimensions={dimensions}
          highlightFaces={highlightFaces}
          cuttingPlane={cuttingPlane}
          showWireframe={showWireframe}
          showDimensions={showDimensions}
          color={color}
          opacity={opacity}
        />
        <OrbitControls enablePan={false} autoRotate={autoRotate} autoRotateSpeed={1.5} minDistance={1.5} maxDistance={8} />
        <gridHelper args={[4, 20, '#ccc', '#e0e0e0']} position={[0, -1.5, 0]} />
      </Canvas>
    </div>
  )
}

export const SHAPE_TYPES = [
  { id: 'cube', label: 'Cube', defaults: { w: 1, h: 1, d: 1 } },
  { id: 'cuboid', label: 'Cuboid', defaults: { w: 1.2, h: 0.8, d: 0.6 } },
  { id: 'sphere', label: 'Sphere', defaults: { r: 0.6 } },
  { id: 'cylinder', label: 'Cylinder', defaults: { r: 0.5, height: 1.2 } },
  { id: 'cone', label: 'Cone', defaults: { r: 0.6, height: 1.2 } },
  { id: 'pyramid', label: 'Pyramid', defaults: { r: 0.7, height: 1, sides: 4 } },
  { id: 'triangular-prism', label: 'Triangular Prism', defaults: { r: 0.6, height: 1 } },
  { id: 'torus', label: 'Torus', defaults: { r: 0.5 } },
  { id: 'frustum', label: 'Frustum', defaults: { r: 0.6, height: 1 } },
]
