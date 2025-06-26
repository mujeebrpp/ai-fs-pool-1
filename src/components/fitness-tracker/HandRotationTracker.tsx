'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  PoseResult, 
  isLandmarkVisible,
  POSE_LANDMARKS,
  PoseInterface,
  Landmark
} from '@/lib/fitness/poseDetection';
import Script from 'next/script';

// Define MediaPipe Camera interface
interface MediaPipeCamera {
  start: () => Promise<void>;
  stop: () => void;
}

// Define MediaPipe drawing utilities interfaces
interface PoseConnection {
  start: number;
  end: number;
}

interface DrawingUtils {
  drawConnectors: (
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    connections: PoseConnection[],
    options: { color: string, lineWidth: number }
  ) => void;
  drawLandmarks: (
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    options: { color: string, lineWidth: number, radius: number }
  ) => void;
  POSE_CONNECTIONS: PoseConnection[];
}

interface CameraOptions {
  onFrame: () => Promise<void>;
  width: number;
  height: number;
}

interface MediaPipeWindow {
  Camera?: new (videoElement: HTMLVideoElement, options: CameraOptions) => MediaPipeCamera;
  Pose?: new (config: { locateFile: (file: string) => string }) => PoseInterface;
  drawConnectors?: DrawingUtils['drawConnectors'];
  drawLandmarks?: DrawingUtils['drawLandmarks'];
  POSE_CONNECTIONS?: PoseConnection[];
}

export default function HandRotationTracker() {
  // State variables
  const [rotationCount, setRotationCount] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [webcamActive, setWebcamActive] = useState(false);
  const [setComplete, setSetComplete] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseDetectionRef = useRef<{
    pose: PoseInterface;
    camera: MediaPipeCamera;
  } | null>(null);
  const mediaPipeLoadedRef = useRef<boolean>(false);
  
  // Hand rotation state tracking
  const rotationStateRef = useRef<{
    state: 'neutral' | 'rotated';
    lastAngle: number;
    direction: 'clockwise' | 'counterclockwise' | 'unknown';
    previousAngles: number[];
  }>({
    state: 'neutral',
    lastAngle: 0,
    direction: 'unknown',
    previousAngles: []
  });
  
  // Handle MediaPipe script loading
  const handleMediaPipeLoaded = () => {
    console.log('MediaPipe scripts loaded');
    mediaPipeLoadedRef.current = true;
  };
  
  // Initialize webcam and pose detection after MediaPipe scripts are loaded
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Check if MediaPipe is loaded
    const checkMediaPipeLoaded = () => {
      const windowWithMediaPipe = window as unknown as MediaPipeWindow;
      if (windowWithMediaPipe.Camera && windowWithMediaPipe.Pose) {
        mediaPipeLoadedRef.current = true;
        return true;
      }
      return false;
    };
    
    // Initialize pose detection
    const initializeTracking = async () => {
      try {
        setStatus('Initializing pose detection...');
        
        // Access MediaPipe objects from the window object
        const windowWithMediaPipe = window as unknown as MediaPipeWindow;
        
        if (!windowWithMediaPipe.Pose || !windowWithMediaPipe.Camera) {
          throw new Error('MediaPipe libraries not loaded');
        }
        
        // Create a new Pose instance
        const pose = new windowWithMediaPipe.Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });
        
        // Set pose options
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        
        // Set up the results callback
        pose.onResults(handlePoseResults);
        
        // Initialize camera
        const camera = new windowWithMediaPipe.Camera(videoRef.current!, {
          onFrame: async () => {
            if (videoRef.current) {
              await pose.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });
        
        poseDetectionRef.current = { pose, camera };
        
        // Start the camera
        camera.start()
          .then(() => {
            setWebcamActive(true);
            setStatus('Ready! Start hand rotations.');
            console.log("Camera started successfully");
          })
          .catch((err: Error) => {
            setStatus(`Error starting camera: ${err.message}. Please grant permission and refresh.`);
            console.error("Error starting camera:", err);
          });
      } catch (error) {
        console.error("Error initializing pose detection:", error);
        setStatus(`Error initializing: ${(error as Error).message}`);
      }
    };
    
    // If MediaPipe is not loaded yet, set up a polling mechanism
    if (!mediaPipeLoadedRef.current && !checkMediaPipeLoaded()) {
      const interval = setInterval(() => {
        if (checkMediaPipeLoaded()) {
          clearInterval(interval);
          initializeTracking();
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
    
    // If MediaPipe is loaded, initialize tracking
    if (mediaPipeLoadedRef.current) {
      initializeTracking();
    }
    
    // Cleanup function
    return () => {
      if (poseDetectionRef.current && poseDetectionRef.current.camera) {
        poseDetectionRef.current.camera.stop();
        console.log("Camera stopped");
      }
    };
  }, []);
  
  // Handle pose detection results
  const handlePoseResults = (results: PoseResult) => {
    if (!results.poseLandmarks) {
      setStatus('Waiting for pose...');
      return;
    }
    
    // Draw the video frame and landmarks on the canvas
    if (canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext('2d');
      if (canvasCtx) {
        // Clear the canvas
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw the video frame
        if (videoRef.current) {
          canvasCtx.drawImage(
            videoRef.current, 
            0, 0, 
            canvasRef.current.width, 
            canvasRef.current.height
          );
        }
        
        // Draw the landmarks
        if (results.poseLandmarks) {
          // Access drawConnectors and drawLandmarks from window
          const drawUtils = window as unknown as DrawingUtils;
          if (drawUtils.drawConnectors && drawUtils.drawLandmarks) {
            drawUtils.drawConnectors(
              canvasCtx, 
              results.poseLandmarks, 
              drawUtils.POSE_CONNECTIONS,
              { color: '#00FF00', lineWidth: 4 }
            );
            drawUtils.drawLandmarks(
              canvasCtx, 
              results.poseLandmarks,
              { color: '#FF0000', lineWidth: 2, radius: 6 }
            );
          }
        }
      }
    }
    
    const landmarks = results.poseLandmarks;
    
    try {
      // Get coordinates for wrist, elbow, and shoulder landmarks
      const shoulderR = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
      const elbowR = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
      const wristR = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
      
      // Check landmark visibility
      const visR = isLandmarkVisible(shoulderR) && isLandmarkVisible(elbowR) && isLandmarkVisible(wristR);
      
      if (!visR) {
        setStatus('Right arm not clearly visible');
        return;
      }
      
      // Calculate wrist rotation angle
      const angle = calculateHandRotationAngle(shoulderR, elbowR, wristR);
      
      // Update rotation state and count
      updateRotationState(angle);
      
    } catch (error) {
      console.error("Error processing landmarks:", error);
      setStatus('Error processing pose');
    }
  };
  
  // Calculate hand rotation angle
  const calculateHandRotationAngle = (shoulder: Landmark, elbow: Landmark, wrist: Landmark) => {
    // Calculate the angle between the forearm and the vertical axis
    // This is a simplified calculation for demonstration purposes
    
    // Calculate forearm vector (from elbow to wrist)
    const forearmX = wrist.x - elbow.x;
    const forearmY = wrist.y - elbow.y;
    
    // Calculate angle in degrees (0 is vertical, positive is clockwise)
    const angle = Math.atan2(forearmX, -forearmY) * (180 / Math.PI);
    
    return angle;
  };
  
  // Update rotation state and count based on wrist angle
  const updateRotationState = (angle: number) => {
    // If set is complete, don't count more rotations
    if (setComplete) return;
    
    // Keep track of previous angles to detect rotation
    const previousAngles = rotationStateRef.current.previousAngles;
    previousAngles.push(angle);
    
    // Keep only the last 10 angles for analysis
    if (previousAngles.length > 10) {
      previousAngles.shift();
    }
    
    // Need at least 5 angles to detect rotation
    if (previousAngles.length < 5) {
      setStatus('Move your hand in a circular motion');
      return;
    }
    
    // Detect if a full rotation has occurred
    const rotationDetected = detectRotation(previousAngles);
    if (rotationDetected) {
      setRotationCount(prev => {
        const newCount = prev + 1;
        return newCount;
      });
      
      // Clear previous angles after detecting a rotation
      rotationStateRef.current.previousAngles = [];
      
      setStatus('Rotation detected!');
    } else {
      setStatus('Rotating...');
    }
    
    rotationStateRef.current.lastAngle = angle;
  };
  
  // Detect if a full rotation has occurred
  const detectRotation = (angles: number[]): boolean => {
    // This is a simplified rotation detection algorithm
    // In a real implementation, you would need a more robust algorithm
    
    // Check if the angles have crossed from positive to negative or vice versa
    // which indicates a potential rotation
    let crossings = 0;
    for (let i = 1; i < angles.length; i++) {
      // Check for crossing from positive to negative (or vice versa)
      if ((angles[i-1] > 150 && angles[i] < -150) || 
          (angles[i-1] < -150 && angles[i] > 150)) {
        crossings++;
      }
    }
    
    // If we detect at least one crossing, consider it a rotation
    return crossings >= 1;
  };
  
  // Reset counter
  const handleReset = () => {
    setRotationCount(0);
    setSetComplete(false);
    rotationStateRef.current = {
      state: 'neutral',
      lastAngle: 0,
      direction: 'unknown',
      previousAngles: []
    };
    setStatus('Ready! Start hand rotations.');
  };
  
  // Check if set is complete (20 rotations)
  useEffect(() => {
    if (rotationCount >= 20) {
      setStatus('Set complete! Great job!');
      setSetComplete(true);
    }
  }, [rotationCount]);
  
  return (
    <div className="flex flex-col items-center">
      {/* Load MediaPipe scripts */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" 
        strategy="lazyOnload"
        onReady={() => console.log('Camera utils loaded')}
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" 
        strategy="lazyOnload"
        onReady={() => console.log('Control utils loaded')}
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" 
        strategy="lazyOnload"
        onReady={() => console.log('Drawing utils loaded')}
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" 
        strategy="lazyOnload"
        onReady={handleMediaPipeLoaded}
      />
      
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Hand Rotation Tracker</h1>
      
      <div className="relative w-full max-w-2xl aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md mb-6">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          playsInline
          autoPlay
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          width={640}
          height={480}
        />
      </div>
      
      <div className={`bg-white p-6 rounded-lg shadow-md w-full max-w-md ${setComplete ? 'border-2 border-green-500' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Count</h2>
            <div className="text-4xl font-bold text-blue-600">{rotationCount}</div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Status</h2>
            <div className={`text-xl italic ${setComplete ? 'text-green-600 font-bold' : 'text-gray-600'}`}>{status}</div>
          </div>
        </div>
        
        {setComplete && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-center">
            <p className="text-green-700 font-medium">Set complete! You&apos;ve reached 20 rotations.</p>
          </div>
        )}
        
        <div className="mt-6">
          <Button onClick={handleReset} className="w-full">
            Reset Counter
          </Button>
          <p className="mt-4 text-sm text-gray-500 text-center">
            Camera is {webcamActive ? 'active' : 'initializing'}. 
            Position yourself so your arms are clearly visible.
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-700 mb-2">How to perform hand rotations:</h3>
            <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-1">
              <li>Extend your right arm in front of you</li>
              <li>Keep your elbow steady</li>
              <li>Rotate your wrist in a circular motion</li>
              <li>Complete 20 rotations for a full set</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
