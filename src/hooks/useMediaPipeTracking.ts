import { useEffect, useRef, useState, useCallback } from 'react'
import { FaceLandmarker, HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export interface FaceLandmarks {
  leftEye: { x: number; y: number; z: number }
  rightEye: { x: number; y: number; z: number }
  noseTip: { x: number; y: number; z: number }
  upperLip: { x: number; y: number; z: number }
  mouthLeft: { x: number; y: number; z: number }
  mouthRight: { x: number; y: number; z: number }
  forehead: { x: number; y: number; z: number }
  chin: { x: number; y: number; z: number }
  leftTemple: { x: number; y: number; z: number }
  rightTemple: { x: number; y: number; z: number }
  faceWidth: number
  faceHeight: number
  eyeDistance: number
  mouthWidth: number
  rotation: number
}

export interface HandPosition {
  palmCenter: { x: number; y: number }
  wrist: { x: number; y: number }
  handSize: number
  handWidth: number
  handHeight: number
  rotation: number
}

interface TrackingResult {
  face: FaceLandmarks | null
  hand: HandPosition | null
}

export function useMediaPipeTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean
) {
  const [tracking, setTracking] = useState<TrackingResult>({ face: null, hand: null })
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
  const handLandmarkerRef = useRef<HandLandmarker | null>(null)
  const loopRef = useRef<number>(0)
  const initRef = useRef(false)
  const [ready, setReady] = useState(false)

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
            minFaceDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          }),
          HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
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

      if (faceResults.faceLandmarks?.length) {
        const lm = faceResults.faceLandmarks[0]

        const leftEye = lm[33]
        const rightEye = lm[263]
        const noseTip = lm[1]
        const upperLip = lm[13]
        const mouthLeft = lm[61]
        const mouthRight = lm[291]
        const forehead = lm[10]
        const chin = lm[152]
        const leftTemple = lm[234]
        const rightTemple = lm[454]

        const mirrorX = (p: { x: number; y: number; z: number }) => ({
          x: 1 - p.x,
          y: p.y,
          z: p.z,
        })

        const mLeftEye = mirrorX(leftEye)
        const mRightEye = mirrorX(rightEye)
        const mNoseTip = mirrorX(noseTip)
        const mUpperLip = mirrorX(upperLip)
        const mMouthLeft = mirrorX(mouthLeft)
        const mMouthRight = mirrorX(mouthRight)
        const mForehead = mirrorX(forehead)
        const mChin = mirrorX(chin)
        const mLeftTemple = mirrorX(leftTemple)
        const mRightTemple = mirrorX(rightTemple)

        const faceWidth = Math.abs(mRightTemple.x - mLeftTemple.x)
        const faceHeight = Math.abs(mChin.y - mForehead.y)
        const eyeDistance = Math.hypot(
          mRightEye.x - mLeftEye.x,
          mRightEye.y - mLeftEye.y
        )
        const mouthWidth = Math.hypot(
          mMouthRight.x - mMouthLeft.x,
          mMouthRight.y - mMouthLeft.y
        )
        const rotation = Math.atan2(mRightEye.y - mLeftEye.y, mRightEye.x - mLeftEye.x)

        face = {
          leftEye: mLeftEye,
          rightEye: mRightEye,
          noseTip: mNoseTip,
          upperLip: mUpperLip,
          mouthLeft: mMouthLeft,
          mouthRight: mMouthRight,
          forehead: mForehead,
          chin: mChin,
          leftTemple: mLeftTemple,
          rightTemple: mRightTemple,
          faceWidth,
          faceHeight,
          eyeDistance,
          mouthWidth,
          rotation,
        }
      }

      if (handResults.landmarks?.length) {
        const lm = handResults.landmarks[0]
        const wrist = lm[0]
        const palmCenter = lm[9]
        const indexMcp = lm[5]
        const pinkyMcp = lm[17]
        const middleTip = lm[12]

        const handWidth = Math.hypot(indexMcp.x - pinkyMcp.x, indexMcp.y - pinkyMcp.y)
        const handHeight = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y)
        const handSize = Math.max(handWidth, handHeight)

        const rotation = Math.atan2(
          palmCenter.y - wrist.y,
          palmCenter.x - wrist.x
        )

        hand = {
          palmCenter: { x: 1 - palmCenter.x, y: palmCenter.y },
          wrist: { x: 1 - wrist.x, y: wrist.y },
          handSize,
          handWidth,
          handHeight,
          rotation,
        }
      }

      setTracking({ face, hand })
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
