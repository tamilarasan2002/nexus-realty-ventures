/**
 * Signature capture: draw with a pointer, or upload an existing signature
 * image. Emits a trimmed PNG data URL.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { trimCanvasToPng } from '../lib/textImage'

const CANVAS_W = 640
const CANVAS_H = 200
const STROKE = 2.6

interface Props {
  onChange: (png: string | null) => void
}

export function SignaturePad({ onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasInk, setHasInk] = useState(false)
  const [mode, setMode] = useState<'draw' | 'upload'>('draw')
  const [uploadName, setUploadName] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = STROKE
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#12138f'
  }, [])

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const r = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    }
  }

  const emit = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const trimmed = trimCanvasToPng(canvas)
    setHasInk(!!trimmed)
    onChange(trimmed?.dataUrl ?? null)
  }, [onChange])

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Capture keeps the stroke alive if the pointer leaves the canvas, but it
    // throws when the id is not an active pointer — never let that abort the
    // stroke itself.
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* capture is a nicety, not a requirement */
    }
    const ctx = canvasRef.current!.getContext('2d')!
    const p = pos(e)
    drawing.current = true
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    const p = pos(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  const up = () => {
    if (!drawing.current) return
    drawing.current = false
    emit()
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
    setUploadName(null)
    onChange(null)
  }

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const fit = Math.min(canvas.width / img.width, canvas.height / img.height, 1)
        const w = img.width * fit
        const h = img.height * fit
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
        emit()
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="sigpad">
      <div className="sigpad__tabs">
        <button
          className={`btn btn--sm${mode === 'draw' ? ' btn--primary' : ''}`}
          onClick={() => setMode('draw')}
        >
          ✍ Draw
        </button>
        <button
          className={`btn btn--sm${mode === 'upload' ? ' btn--primary' : ''}`}
          onClick={() => setMode('upload')}
        >
          🖼 Upload image
        </button>
        <span className="topbar__spacer" />
        <button className="btn btn--sm btn--ghost" onClick={clear} disabled={!hasInk}>
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="sigpad__canvas"
        width={CANVAS_W}
        height={CANVAS_H}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        style={{ cursor: mode === 'draw' ? 'crosshair' : 'default' }}
      />

      {mode === 'upload' && (
        <label className="sigpad__upload">
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onUpload} />
          <span>{uploadName ?? 'Choose a PNG / JPG file — a transparent background works best'}</span>
        </label>
      )}

      <p className="sigpad__note">
        {hasInk
          ? '✓ Signature ready'
          : mode === 'draw'
            ? 'Sign in the ruled area above using your mouse, trackpad or finger.'
            : 'Upload an image of your signature.'}
      </p>
    </div>
  )
}
