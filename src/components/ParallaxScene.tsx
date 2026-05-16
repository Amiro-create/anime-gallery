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

    // Timeout safety: abort if texture takes >15s
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
    meshRef.current.position.y = mouse.y * parallaxFactor * 0.6
  })

  if (error || !texture) return null

  return (
    <mesh ref={meshRef} position={[0, 0, z]}>
      <planeGeometry args={[16, 9]} />
      <meshBasicMaterial map={texture} transparent opacity={z === 0 ? 1 : 0.85} />
    </mesh>
  )
}

function SceneContent({ layers }: { layers: ParallaxLayers }) {
  const mouseRef = useRef({ x: 0, y: 0 })
  const { size } = useThree()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = ((e.clientX / size.width) - 0.5) * 2
      mouseRef.current.y = -((e.clientY / size.height) - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [size])

  return (
    <>
      {/* Background layer (deepest) */}
      <ParallaxPlane textureUrl={layers.bg} z={-2} parallaxFactor={0.15} mouseRef={mouseRef} />

      {/* Midground layer */}
      {layers.mg && (
        <ParallaxPlane textureUrl={layers.mg} z={-1} parallaxFactor={0.4} mouseRef={mouseRef} />
      )}

      {/* Foreground layer (closest) */}
      {layers.fg && (
        <ParallaxPlane textureUrl={layers.fg} z={0} parallaxFactor={0.8} mouseRef={mouseRef} />
      )}
    </>
  )
}

function FallbackImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover opacity-50"
      />
      <p className="absolute text-white/40 text-sm">3D 渲染加载中...</p>
    </div>
  )
}

interface ParallaxSceneProps {
  layers: ParallaxLayers
}

export default function ParallaxScene({ layers }: ParallaxSceneProps) {
  const [hasError, setHasError] = useState(false)

  // Safety: auto-abort 3D after 10s regardless of texture status
  useEffect(() => {
    const t = setTimeout(() => setHasError(true), 10000)
    return () => clearTimeout(t)
  }, [])

  if (hasError) {
    return <FallbackImage src={layers.bg} alt="场景背景" />
  }

  return (
    <div className="absolute inset-0">
      <FallbackImage src={layers.bg} alt="场景背景" />
      <Suspense fallback={null}>
        <ErrorBoundary onError={() => setHasError(true)}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <SceneContent layers={layers} />
          </Canvas>
        </ErrorBoundary>
      </Suspense>
    </div>
  )
}

// Simple error boundary for Three.js
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
