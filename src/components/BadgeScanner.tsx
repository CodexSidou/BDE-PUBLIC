'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Camera,
  CameraOff,
  UploadCloud,
  FlipHorizontal,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ScanLine,
  QrCode,
  ArrowRight,
  ExternalLink,
  FileImage,
  RefreshCw,
  Search,
} from 'lucide-react'

export interface ScannedPayload {
  raw: string
  badgeCode: string | null
  insimUrl: string | null
  isBadge: boolean
  isSiteUrl: boolean
}

interface BadgeScannerProps {
  onScanBadge: (badgeCode: string) => void
  onScanOtherUrl?: (url: string) => void
  initialMode?: 'camera' | 'file' | 'manual'
  isVerifying?: boolean
}

export function parseInsimQrPayload(rawText: string): ScannedPayload {
  const trimmed = rawText.trim()

  // 1. Check if it matches direct badge code format: INSIM-XXXX-XXXX-XXXX
  const directBadgeMatch = trimmed.match(/^INSIM-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i)
  if (directBadgeMatch) {
    return {
      raw: trimmed,
      badgeCode: trimmed.toUpperCase(),
      insimUrl: null,
      isBadge: true,
      isSiteUrl: false,
    }
  }

  // 2. Check if it's a URL containing /verify/INSIM-...
  const verifyUrlMatch = trimmed.match(/\/verify\/(INSIM-[A-Z0-9\-]+)/i)
  if (verifyUrlMatch && verifyUrlMatch[1]) {
    return {
      raw: trimmed,
      badgeCode: verifyUrlMatch[1].toUpperCase(),
      insimUrl: trimmed,
      isBadge: true,
      isSiteUrl: true,
    }
  }

  // 3. Check if it contains any INSIM badge code pattern anywhere in text
  const looseBadgeMatch = trimmed.match(/(INSIM-[A-Z0-9]{3,5}-[A-Z0-9]{3,5}-[A-Z0-9]{3,5})/i)
  if (looseBadgeMatch && looseBadgeMatch[1]) {
    return {
      raw: trimmed,
      badgeCode: looseBadgeMatch[1].toUpperCase(),
      insimUrl: null,
      isBadge: true,
      isSiteUrl: false,
    }
  }

  // 4. Check if it's an INSIM site URL (e.g., /dashboard/events, /projects, etc.)
  const isSiteUrl =
    trimmed.includes('bde-bice.vercel.app') ||
    trimmed.includes('localhost:') ||
    trimmed.startsWith('/dashboard') ||
    trimmed.startsWith('/events') ||
    trimmed.startsWith('/projects')

  return {
    raw: trimmed,
    badgeCode: null,
    insimUrl: isSiteUrl ? trimmed : null,
    isBadge: false,
    isSiteUrl,
  }
}

export default function BadgeScanner({
  onScanBadge,
  onScanOtherUrl,
  initialMode = 'camera',
  isVerifying = false,
}: BadgeScannerProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'file' | 'manual'>(initialMode)
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'running' | 'error'>('idle')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [lastScannedResult, setLastScannedResult] = useState<ScannedPayload | null>(null)
  const [fileScanning, setFileScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')

  const html5QrCodeRef = useRef<any>(null)
  const isMountedRef = useRef(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const readerElementId = 'insim-qr-reader'

  // Play high-tech synthesized scan audio
  const playScanBeep = useCallback(
    (isSuccess = true) => {
      if (!soundEnabled) return
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioCtx) return
        const ctx = new AudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        if (isSuccess) {
          // Futuristic double high-frequency chime (880Hz -> 1320Hz)
          osc.type = 'sine'
          osc.frequency.setValueAtTime(880, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1)
          gain.gain.setValueAtTime(0.18, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.2)
        } else {
          // Low buzzing beep for unknown / invalid
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(320, ctx.currentTime)
          gain.gain.setValueAtTime(0.15, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.25)
        }
      } catch (err) {
        // Ignore audio restrictions
      }
    },
    [soundEnabled]
  )

  // Trigger smartphone haptic vibration
  const triggerHaptic = (isSuccess = true) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (isSuccess) {
          navigator.vibrate([40, 30, 80])
        } else {
          navigator.vibrate([150])
        }
      }
    } catch (e) {
      // Haptics optional
    }
  }

  // Handle scanned decoded text
  const handleDecodedText = useCallback(
    (decodedText: string) => {
      const parsed = parseInsimQrPayload(decodedText)
      setLastScannedResult(parsed)

      if (parsed.badgeCode) {
        playScanBeep(true)
        triggerHaptic(true)
        onScanBadge(parsed.badgeCode)
      } else if (parsed.insimUrl && onScanOtherUrl) {
        playScanBeep(true)
        triggerHaptic(true)
        onScanOtherUrl(parsed.insimUrl)
      } else {
        playScanBeep(false)
        triggerHaptic(false)
      }
    },
    [onScanBadge, onScanOtherUrl, playScanBeep]
  )

  // Stop camera safely
  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop()
        }
      } catch (err) {
        // Ignore already stopped error
      }
    }
    if (isMountedRef.current) {
      setCameraState('idle')
    }
  }, [])

  // Start camera
  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined') return

    setCameraError(null)
    setCameraState('starting')

    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(readerElementId)
      }

      // Query available camera devices if not fetched
      try {
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0) {
          setCameras(devices)
          if (!selectedCameraId) {
            // Favor back / environment camera
            const backCam = devices.find(
              (d) =>
                d.label.toLowerCase().includes('back') ||
                d.label.toLowerCase().includes('rear') ||
                d.label.toLowerCase().includes('environnement')
            )
            setSelectedCameraId(backCam ? backCam.id : devices[0].id)
          }
        }
      } catch (e) {
        // Camera enumeration might be restricted before permission is granted
      }

      // Camera config with responsive scanning box
      const scanConfig = {
        fps: 12,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minDim = Math.min(viewfinderWidth, viewfinderHeight)
          const size = Math.floor(minDim * 0.72)
          return { width: Math.max(180, size), height: Math.max(180, size) }
        },
        aspectRatio: 1.0,
      }

      const cameraSelection = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode }

      await html5QrCodeRef.current.start(
        cameraSelection,
        scanConfig,
        (decodedText: string) => {
          handleDecodedText(decodedText)
        },
        (errorMessage: string) => {
          // Frame errors are expected when no QR is in view, ignore
        }
      )

      if (isMountedRef.current) {
        setCameraState('running')
      }
    } catch (err: any) {
      console.warn('Camera start error:', err)
      if (isMountedRef.current) {
        setCameraState('error')
        const message =
          err?.name === 'NotAllowedError'
            ? "Accès à la caméra refusé. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur."
            : err?.name === 'NotFoundError'
            ? 'Aucune caméra détectée sur cet appareil.'
            : err?.message || 'Impossible de démarrer la caméra.'
        setCameraError(message)
      }
    }
  }, [facingMode, handleDecodedText, selectedCameraId])

  // Flip between front and rear cameras
  const toggleFacingMode = async () => {
    await stopCamera()
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
    setSelectedCameraId(null)
  }

  // Handle image file scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileScanning(true)
    setCameraError(null)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const tempScanner = new Html5Qrcode('insim-qr-file-scratch')
      const decodedText = await tempScanner.scanFile(file, false)
      tempScanner.clear()

      handleDecodedText(decodedText)
    } catch (err: any) {
      setCameraError(
        "Aucun QR code lisible n'a été détecté dans cette image. Assurez-vous que le badge ou QR code est bien net et éclairé."
      )
      playScanBeep(false)
    } finally {
      setFileScanning(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Manage camera lifecycle based on active tab
  useEffect(() => {
    isMountedRef.current = true

    if (activeTab === 'camera') {
      const timer = setTimeout(() => {
        startCamera()
      }, 150)
      return () => {
        clearTimeout(timer)
        stopCamera()
      }
    } else {
      stopCamera()
    }

    return () => {
      isMountedRef.current = false
      stopCamera()
    }
  }, [activeTab, facingMode, selectedCameraId, startCamera, stopCamera])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Hidden scratch container for file decoder */}
      <div id="insim-qr-file-scratch" className="hidden" />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-navy-900 border border-white/10 shadow-lg">
        <div className="flex items-center gap-1 sm:gap-2 flex-grow">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'camera'
                ? 'bg-accent text-white shadow-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Caméra en direct</span>
            <span className="sm:hidden">Caméra</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'file'
                ? 'bg-accent text-white shadow-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span className="hidden sm:inline">Importer Image</span>
            <span className="sm:hidden">Image</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'manual'
                ? 'bg-accent text-white shadow-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Saisie Clavier</span>
            <span className="sm:hidden">Manuel</span>
          </button>
        </div>

        {/* Audio Mute Toggle Button */}
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Désactiver le son du bip' : 'Activer le bip sonore'}
          className="ml-2 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-accent-glow" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>

      {/* TAB 1: LIVE CAMERA SCANNER */}
      {activeTab === 'camera' && (
        <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden space-y-4">
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    cameraState === 'running' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    cameraState === 'running' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                {cameraState === 'running'
                  ? 'Scanner Optique Actif'
                  : cameraState === 'starting'
                  ? 'Initialisation du capteur...'
                  : 'Capteur en veille'}
              </span>
            </div>

            {/* Quick Actions (Flip Camera & Refresh) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-semibold border border-white/5 flex items-center gap-1.5 transition-colors"
                title="Changer de caméra (avant/arrière)"
              >
                <FlipHorizontal className="w-3.5 h-3.5 text-accent-glow" />
                <span className="hidden sm:inline">
                  {facingMode === 'environment' ? 'Arrière' : 'Avant'}
                </span>
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors"
                title="Redémarrer la caméra"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Viewfinder Video Container with Cyberpunk/Modern HUD Overlay */}
          <div className="relative w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-navy-950 border-2 border-white/10 shadow-inner flex items-center justify-center">
            {/* HTML5 QR Code DOM mount point */}
            <div
              id={readerElementId}
              className="w-full h-full object-cover [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
            />

            {/* Cyber Reticle Overlay (Only shown when running) */}
            {cameraState === 'running' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                {/* Central Targeting Box */}
                <div className="relative w-64 h-64 border-2 border-dashed border-accent/40 rounded-2xl flex items-center justify-center">
                  {/* Glowing 4 Corners */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg shadow-glow" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg shadow-glow" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg shadow-glow" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-cyan-400 rounded-br-lg shadow-glow" />

                  {/* Animated Horizontal Laser Scan Line */}
                  <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-scanner-laser top-0" />

                  {/* Center Target Dot */}
                  <div className="w-2 h-2 rounded-full bg-cyan-400/80 shadow-glow" />
                </div>

                <p className="mt-4 text-[11px] font-semibold text-cyan-300/90 bg-navy-950/80 px-3 py-1 rounded-full backdrop-blur-md border border-cyan-500/20">
                  Alignez le QR Code du Badge INSIM
                </p>
              </div>
            )}

            {/* Loading / Starting state */}
            {cameraState === 'starting' && (
              <div className="absolute inset-0 bg-navy-950/90 flex flex-col items-center justify-center text-center p-4">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-bold text-white">Connexion au capteur optique...</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Veuillez autoriser l&apos;accès caméra sur votre smartphone
                </p>
              </div>
            )}

            {/* Error state */}
            {cameraState === 'error' && (
              <div className="absolute inset-0 bg-navy-950/95 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <CameraOff className="w-10 h-10 text-red-400" />
                <div>
                  <p className="text-xs font-bold text-white">Caméra indisponible</p>
                  <p className="text-[11px] text-red-300 mt-1 max-w-xs">{cameraError}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold shadow-glow"
                  >
                    Réessayer
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('file')}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium"
                  >
                    Utiliser une image
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-[11px] text-slate-400">
            Reconnaissance automatique : Badges Officiels BDE, Cartes d&apos;accès et Billets d&apos;événements INSIM.
          </p>
        </div>
      )}

      {/* TAB 2: IMAGE FILE UPLOAD SCANNER */}
      {activeTab === 'file' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl text-center space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/15 hover:border-accent/60 rounded-2xl p-8 cursor-pointer transition-all bg-navy-950/40 hover:bg-navy-900/60 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 group-hover:bg-accent/20 flex items-center justify-center text-accent-glow mx-auto mb-4 transition-transform group-hover:scale-105">
              {fileScanning ? (
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <h3 className="text-sm font-bold text-white">
              {fileScanning ? 'Analyse du QR Code en cours...' : 'Sélectionner ou déposer une image'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Importez une capture d&apos;écran de badge, une photo prise avec votre téléphone ou un fichier PNG/JPEG de carte BDE.
            </p>

            <button
              type="button"
              disabled={fileScanning}
              className="mt-4 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-glow inline-flex items-center gap-2"
            >
              <FileImage className="w-4 h-4" />
              <span>Parcourir mes photos</span>
            </button>
          </div>

          {cameraError && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANUAL INPUT */}
      {activeTab === 'manual' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Saisie manuelle du code badge</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Entrez l&apos;identifiant hexadécimal à 12 caractères présent sous le QR code.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (manualCode.trim()) {
                const parsed = parseInsimQrPayload(manualCode)
                if (parsed.badgeCode) {
                  onScanBadge(parsed.badgeCode)
                } else {
                  onScanBadge(manualCode.trim().toUpperCase())
                }
              }
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-grow">
              <QrCode className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="INSIM-8B4F-29E1-C34A"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim() || isVerifying}
              className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>Contrôler</span>
            </button>
          </form>

          {/* Quick Demo Badges */}
          <div className="pt-3 border-t border-white/5">
            <p className="text-[10px] text-slate-400 mb-2 uppercase font-bold tracking-wider">
              Accès rapide pour tests :
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Badge Président', code: 'INSIM-8B4F-29E1-C34A' },
                { label: 'Chef de Projet', code: 'INSIM-4D9A-71C5-9F2B' },
                { label: 'Badge Révoqué', code: 'INSIM-0000-REVOKED-X1' },
              ].map((s) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => {
                    setManualCode(s.code)
                    onScanBadge(s.code)
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Non-badge INSIM URL notification if scanned */}
      {lastScannedResult && !lastScannedResult.isBadge && lastScannedResult.insimUrl && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-white text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 overflow-hidden">
            <ExternalLink className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div className="truncate">
              <p className="font-bold text-cyan-300">Lien INSIM détecté</p>
              <p className="text-slate-300 text-[11px] truncate">{lastScannedResult.raw}</p>
            </div>
          </div>
          <a
            href={lastScannedResult.insimUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs whitespace-nowrap transition-colors"
          >
            Ouvrir la page
          </a>
        </div>
      )}
    </div>
  )
}
