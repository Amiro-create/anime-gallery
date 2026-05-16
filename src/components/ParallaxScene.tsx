'use client'

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface ParallaxLayers {
  fg?: string
  mg?: string
  bg: string
}

interface ParallaxPlaneProps {
  textureUrl: string
  z: number
  parallaxFactor: number
  mouseRef: React.RefObject<{ x: number; y: number }>
}

function ParallaxPlane({ textureUrl, z, parallaxFactor, mouseRef }: ParallaxPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'

    const timer = setTimeout(() => {
      if (!cancelled) setError(true)
    }, 15000)

    loader.load(
      textureUrl,
      (tex) => {
        if (cancelled) return
        clearTimeout(timer)
        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.colorSpace = THREE.SRGBColorSpace
        setTexture(tex)
      },
      undefined,
      () => {
        if (!cancelled) {
          clearTimeout(timer)
          setError(true)
        }
      },
    )
    return () => {
      cancelled = true
      clearTimeout(timer)
      if (texture) texture.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textureUrl])

  useFrame(() => {
    if (!meshRef.current) return
    const mouse = mouseRef.current
    meshRef.current.position.x = mouse.x * parallaxFactor
    meshRef.current.position.y = mouse.y * parallaxFactor * 0.5
  })

  if (error || !texture) return null

  return (
    <mesh ref={meshRef} position={[0, 0, z]}>
      <planeGeometry args={[5.3, 2.98]} />
      <meshBasicMaterial map={texture} transparent opacity={0.92} />
    </mesh>
  )
}

function SceneContent({ layers, onReady }: { layers: ParallaxLayers; onReady: () => void }) {
  const mouseRef = useRef({ x: 0, y: 0 })
  const { size } = useThree()

  useEffect(() => {
    onReady()
  }, [onReady])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = ((e.clientX / size.width) - 0.5) * 0.8
      mouseRef.current.y = -((e.clientY / size.height) - 0.5) * 0.8
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [size])

  return (
    <>
      <ParallaxPlane textureUrl={layers.bg} z={-2.5} parallaxFactor={0.08} mouseRef={mouseRef} />
      {layers.mg && (
        <ParallaxPlane textureUrl={layers.mg} z={-1} parallaxFactor={0.2} mouseRef={mouseRef} />
      )}
      {layers.fg && (
        <ParallaxPlane textureUrl={layers.fg} z={0.5} parallaxFactor={0.4} mouseRef={mouseRef} />
      )}
    </>
  )
}

interface ParallaxSceneProps {
  layers: ParallaxLayers
}

export default function ParallaxScene({ layers }: ParallaxSceneProps) {
  const [hasError, setHasError] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      if (!ready) setHasError(true)
    }, 12000)
    return () => clearTimeout(t)
  }, [ready])

  if (hasError) {
    return (
      <div className="absolute inset-0 bg-black">
        <img src={layers.bg} alt="" className="w-full h-full object-contain opacity-90" />
      </div>
    )
  }

  return (
    <div className="absolute inset-0">
      {/* Loading fallback - shown until 3D is ready */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <img src={layers.bg} alt="" className="w-full h-full object-contain opacity-40" />
          <p className="absolute text-white/30 text-sm">空间效果加载中...</p>
        </div>
      )}

      <Suspense fallback={null}>
        <ErrorBoundary onError={() => setHasError(true)}>
          <Canvas
            camera={{ position: [0, 0, 2], fov: 45 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <SceneContent layers={layers} onReady={() => setReady(true)} />
          </Canvas>
        </ErrorBoundary>
      </Suspense>
    </div>
  )
}

function ErrorBoundary({ children, onError }: { children: React.ReactNode; onError: () => void }) {
  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      if (e.message?.includes('three') || e.message?.includes('WebGL') || e.message?.includes('canvas')) {
        onError()
      }
    }
    window.addEventListener('error', handler)
    return () => window.removeEventListener('error', handler)
  }, [onError])

  return <>{children}</>
}
