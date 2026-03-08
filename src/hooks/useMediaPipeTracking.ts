import { useEffect, useRef, useState, useCallback } from 'react'
import { FaceLandmarker, HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

interface Point3D {
  x: number
  y: number
  z: number
}

interface Point2D {
  x: number
  y: number
}

export interface FaceLandmarks {
  leftEye: Point3D
  rightEye: Point3D
  noseTip: Point3D
  upperLip: Point3D
  mouthLeft: Point3D
  mouthRight: Point3D
  forehead: Point3D
  chin: Point3D
  leftTemple: Point3D
  rightTemple: Point3D
  faceWidth: number
  faceHeight: number
  eyeDistance: number
  mouthWidth: number
  rotation: number
}

export interface HandPosition {
  palmCenter: Point2D
  wrist: Point2D
  handSize: number
  handWidth: number
  handHeight: number
  rotation: number
}

interface TrackingResult {
  face: FaceLandmarks | null
  hand: HandPosition | null
  leftHand: HandPosition | null
  rightHand: HandPosition | null
}

const FACE = {
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_OUTER: 263,
  NOSE_TIP: 1,
  UPPER_LIP: 13,
  MOUTH_LEFT: 61,
  MOUTH_RIGHT: 291,
  FOREHEAD: 10,
  CHIN: 152,
  LEFT_TEMPLE: 234,
  RIGHT_TEMPLE: 454,
} as const

const HAND = {
  WRIST: 0,
  PALM_CENTER: 9,
  INDEX_MCP: 5,
  PINKY_MCP: 17,
  MIDDLE_TIP: 12,
} as const

const MIRROR_PREVIEW = true
const SMOOTH_ALPHA_FACE = 0.5
const SMOOTH_ALPHA_HAND = 0.45

const dist2 = (a: Point2D, b: Point2D) => Math.hypot(a.x - b.x, a.y - b.y)
const dist3XY = (a: Point3D, b: Point3D) => Math.hypot(a.x - b.x, a.y - b.y)

function mirror3(p: Point3D): Point3D {
  if (!MIRROR_PREVIEW) return p
  return { x: 1 - p.x, y: p.y, z: p.z }
}

function mirror2(p: Point2D): Point2D {
  if (!MIRROR_PREVIEW) return p
  return { x: 1 - p.x, y: p.y }
}

function smoothPoint3(prev: Point3D, next: Point3D, alpha: number): Point3D {
  return {
    x: prev.x + (next.x - prev.x) * alpha,
    y: prev.y + (next.y - prev.y) * alpha,
    z: prev.z + (next.z - prev.z) * alpha,
  }
}

function smoothPoint2(prev: Point2D, next: Point2D, alpha: number): Point2D {
  return {
    x: prev.x + (next.x - prev.x) * alpha,
    y: prev.y + (next.y - prev.y) * alpha,
  }
}

function smoothFace(prev: FaceLandmarks | null, next: FaceLandmarks): FaceLandmarks {
  if (!prev) return next

  return {
    leftEye: smoothPoint3(prev.leftEye, next.leftEye, SMOOTH_ALPHA_FACE),
    rightEye: smoothPoint3(prev.rightEye, next.rightEye, SMOOTH_ALPHA_FACE),
    noseTip: smoothPoint3(prev.noseTip, next.noseTip, SMOOTH_ALPHA_FACE),
    upperLip: smoothPoint3(prev.upperLip, next.upperLip, SMOOTH_ALPHA_FACE),
    mouthLeft: smoothPoint3(prev.mouthLeft, next.mouthLeft, SMOOTH_ALPHA_FACE),
    mouthRight: smoothPoint3(prev.mouthRight, next.mouthRight, SMOOTH_ALPHA_FACE),
    forehead: smoothPoint3(prev.forehead, next.forehead, SMOOTH_ALPHA_FACE),
    chin: smoothPoint3(prev.chin, next.chin, SMOOTH_ALPHA_FACE),
    leftTemple: smoothPoint3(prev.leftTemple, next.leftTemple, SMOOTH_ALPHA_FACE),
    rightTemple: smoothPoint3(prev.rightTemple, next.rightTemple, SMOOTH_ALPHA_FACE),
    faceWidth: prev.faceWidth + (next.faceWidth - prev.faceWidth) * SMOOTH_ALPHA_FACE,
    faceHeight: prev.faceHeight + (next.faceHeight - prev.faceHeight) * SMOOTH_ALPHA_FACE,
    eyeDistance: prev.eyeDistance + (next.eyeDistance - prev.eyeDistance) * SMOOTH_ALPHA_FACE,
    mouthWidth: prev.mouthWidth + (next.mouthWidth - prev.mouthWidth) * SMOOTH_ALPHA_FACE,
    rotation: prev.rotation + (next.rotation - prev.rotation) * SMOOTH_ALPHA_FACE,
  }
}

function smoothHand(prev: HandPosition | null, next: HandPosition): HandPosition {
  if (!prev) return next

  return {
    palmCenter: smoothPoint2(prev.palmCenter, next.palmCenter, SMOOTH_ALPHA_HAND),
    wrist: smoothPoint2(prev.wrist, next.wrist, SMOOTH_ALPHA_HAND),
    handSize: prev.handSize + (next.handSize - prev.handSize) * SMOOTH_ALPHA_HAND,
    handWidth: prev.handWidth + (next.handWidth - prev.handWidth) * SMOOTH_ALPHA_HAND,
    handHeight: prev.handHeight + (next.handHeight - prev.handHeight) * SMOOTH_ALPHA_HAND,
    rotation: prev.rotation + (next.rotation - prev.rotation) * SMOOTH_ALPHA_HAND,
  }
}

function extractHand(lm: { x: number; y: number }[]): HandPosition {
  const wrist = mirror2(lm[HAND.WRIST])
  const palmCenter = mirror2(lm[HAND.PALM_CENTER])
  const indexMcp = mirror2(lm[HAND.INDEX_MCP])
  const pinkyMcp = mirror2(lm[HAND.PINKY_MCP])
  const middleTip = mirror2(lm[HAND.MIDDLE_TIP])

  const handWidth = dist2(indexMcp, pinkyMcp)
  const handHeight = dist2(middleTip, wrist)

  return {
    palmCenter,
    wrist,
    handWidth,
    handHeight,
    handSize: Math.max(handWidth, handHeight),
    rotation: Math.atan2(indexMcp.y - pinkyMcp.y, indexMcp.x - pinkyMcp.x),
  }
}

export function useMediaPipeTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean
) {
  const [tracking, setTracking] = useState<TrackingResult>({ face: null, hand: null, leftHand: null, rightHand: null })
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
  const handLandmarkerRef = useRef<HandLandmarker | null>(null)
  const loopRef = useRef<number>(0)
  const initRef = useRef(false)
  const [ready, setReady] = useState(false)
  const smoothedFaceRef = useRef<FaceLandmarks | null>(null)
  const smoothedHandRef = useRef<HandPosition | null>(null)
  const smoothedLeftHandRef = useRef<HandPosition | null>(null)
  const smoothedRightHandRef = useRef<HandPosition | null>(null)

  useEffect(() => {
    if (!enabled || initRef.current) return
    initRef.current = true

    let cancelled = false

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )

        if (cancelled) return

        const [faceLm, handLm] = await Promise.all([
          FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            minFaceDetectionConfidence: 0.55,
            minTrackingConfidence: 0.55,
          }),
          HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.55,
            minTrackingConfidence: 0.55,
          }),
        ])

        if (cancelled) {
          faceLm.close()
          handLm.close()
          return
        }

        faceLandmarkerRef.current = faceLm
        handLandmarkerRef.current = handLm
        setReady(true)
      } catch (err) {
        console.error('MediaPipe init failed:', err)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [enabled])

  const detect = useCallback(() => {
    const video = videoRef.current
    if (!video || video.readyState < 2 || !faceLandmarkerRef.current || !handLandmarkerRef.current) {
      loopRef.current = requestAnimationFrame(detect)
      return
    }

    const now = performance.now()

    try {
      const faceResults = faceLandmarkerRef.current.detectForVideo(video, now)
      const handResults = handLandmarkerRef.current.detectForVideo(video, now)

      let face: FaceLandmarks | null = null
      let hand: HandPosition | null = null
      let leftHand: HandPosition | null = null
      let rightHand: HandPosition | null = null

      if (faceResults.faceLandmarks?.length) {
        const lm = faceResults.faceLandmarks[0]

        const leftEye = mirror3(lm[FACE.LEFT_EYE_OUTER])
        const rightEye = mirror3(lm[FACE.RIGHT_EYE_OUTER])
        const noseTip = mirror3(lm[FACE.NOSE_TIP])
        const upperLip = mirror3(lm[FACE.UPPER_LIP])
        const mouthLeft = mirror3(lm[FACE.MOUTH_LEFT])
        const mouthRight = mirror3(lm[FACE.MOUTH_RIGHT])
        const forehead = mirror3(lm[FACE.FOREHEAD])
        const chin = mirror3(lm[FACE.CHIN])
        const leftTemple = mirror3(lm[FACE.LEFT_TEMPLE])
        const rightTemple = mirror3(lm[FACE.RIGHT_TEMPLE])

        const nextFace: FaceLandmarks = {
          leftEye,
          rightEye,
          noseTip,
          upperLip,
          mouthLeft,
          mouthRight,
          forehead,
          chin,
          leftTemple,
          rightTemple,
          faceWidth: dist3XY(leftTemple, rightTemple),
          faceHeight: dist3XY(forehead, chin),
          eyeDistance: dist3XY(leftEye, rightEye),
          mouthWidth: dist3XY(mouthLeft, mouthRight),
          rotation: Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x),
        }

        face = smoothFace(smoothedFaceRef.current, nextFace)
        smoothedFaceRef.current = face
      } else {
        smoothedFaceRef.current = null
      }

      // Process hands with handedness
      if (handResults.landmarks?.length) {
        // First hand is also kept as generic "hand" for backward compat
        hand = smoothHand(smoothedHandRef.current, extractHand(handResults.landmarks[0]))
        smoothedHandRef.current = hand

        for (let i = 0; i < handResults.landmarks.length; i++) {
          const handedness = handResults.handednesses?.[i]?.[0]?.categoryName
          const extracted = extractHand(handResults.landmarks[i])
          
          // MediaPipe reports handedness from camera's perspective
          // Since we mirror the preview, "Left" from camera = user's right hand visually (but we mirror coordinates too)
          // After mirroring: MediaPipe "Right" = user's right hand on screen, "Left" = user's left hand on screen
          if (handedness === 'Left') {
            // Camera's left = user's right (but mirrored coords make it appear on user's left side)
            leftHand = smoothHand(smoothedLeftHandRef.current, extracted)
            smoothedLeftHandRef.current = leftHand
          } else {
            // Camera's right = user's left (but mirrored coords make it appear on user's right side)
            rightHand = smoothHand(smoothedRightHandRef.current, extracted)
            smoothedRightHandRef.current = rightHand
          }
        }
      } else {
        smoothedHandRef.current = null
        smoothedLeftHandRef.current = null
        smoothedRightHandRef.current = null
      }

      // Clear smoothed refs for hands not detected this frame
      if (!leftHand) smoothedLeftHandRef.current = null
      if (!rightHand) smoothedRightHandRef.current = null

      setTracking({ face, hand, leftHand, rightHand })
    } catch {
      // skip frame
    }

    loopRef.current = requestAnimationFrame(detect)
  }, [videoRef])

  useEffect(() => {
    if (enabled && ready) {
      loopRef.current = requestAnimationFrame(detect)
    } else {
      cancelAnimationFrame(loopRef.current)
    }
    return () => cancelAnimationFrame(loopRef.current)
  }, [enabled, ready, detect])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(loopRef.current)
      faceLandmarkerRef.current?.close()
      handLandmarkerRef.current?.close()
    }
  }, [])

  return { ...tracking, ready }
}
