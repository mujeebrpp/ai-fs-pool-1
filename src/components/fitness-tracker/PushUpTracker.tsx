'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  PoseResult, 
  calculateAngle,
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

export default function PushUpTracker() {
  // State variables
  const [repCount, setRepCount] = useState(0);
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
  
  // Push-up state tracking
  const pushupStateRef = useRef<{
    state: 'up' | 'down';
    lastAngle: number;
  }>({
    state: 'up',
    lastAngle: 180
  });
  
  // Handle MediaPipe script loading
  const handleMediaPipeLoaded = () => {
    console.log('MediaPipe scripts loaded');
    mediaPipeLoadedRef.current = true;
  };
  
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
      // Get coordinates for Left side landmarks
      const shoulderL = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
      const elbowL = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
      const wristL = landmarks[POSE_LANDMARKS.LEFT_WRIST];

      // Get coordinates for Right side landmarks
      const shoulderR = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
      const elbowR = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
      const wristR = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

      // Check landmark visibility
      const visL = isLandmarkVisible(shoulderL) && isLandmarkVisible(elbowL) && isLandmarkVisible(wristL);
      const visR = isLandmarkVisible(shoulderR) && isLandmarkVisible(elbowR) && isLandmarkVisible(wristR);

      // Calculate angles
      let angleL = 0, angleR = 0;
      if (visL) {
        angleL = calculateAngle(shoulderL, elbowL, wristL);
      }
      if (visR) {
        angleR = calculateAngle(shoulderR, elbowR, wristR);
      }

      // Determine which angle to use
      let angle = 0;
      if (visL && visR) {
        angle = (angleL + angleR) / 2; // Average angle
      } else if (visL) {
        angle = angleL; // Use left angle
      } else if (visR) {
        angle = angleR; // Use right angle
      } else {
        setStatus('Elbows not clearly visible');
        return;
      }
      
      // Update push-up state and count
      updatePushUpState(angle);
      
    } catch (error) {
      console.error("Error processing landmarks:", error);
      setStatus('Error processing pose');
    }
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
            setStatus('Ready! Start push-ups.');
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
  
  // Update push-up state and count based on elbow angle
  const updatePushUpState = (angle: number) => {
    // If set is complete, don't count more reps
    if (setComplete) return;
    
    // Define angle thresholds for 'down' and 'up' positions
    const thresholdDown = 85; // Angle below which is considered 'down'
    const thresholdUp = 150;  // Angle above which is considered 'up'
    
    const currentState = pushupStateRef.current.state;
    
    // Check for state transitions
    if (angle < thresholdDown) { // Potential 'down' state
      if (currentState === 'up') {
        pushupStateRef.current.state = 'down';
        setStatus('Down');
      } else {
        setStatus('Down');
      }
    } else if (angle > thresholdUp) { // Potential 'up' state
      if (currentState === 'down') {
        pushupStateRef.current.state = 'up';
        setRepCount(prev => {
          const newCount = prev + 1;
          return newCount;
        }); // Increment counter on completing a rep
        setStatus('Up');
      } else {
        setStatus('Up');
      }
    } else if (currentState === 'down') {
      setStatus('Going Up...');
    } else if (currentState === 'up') {
      setStatus('Going Down...');
    }
    
    pushupStateRef.current.lastAngle = angle;
  };
  
  // Reset counter
  const handleReset = () => {
    setRepCount(0);
    setSetComplete(false);
    pushupStateRef.current.state = 'up';
    setStatus('Ready! Start push-ups.');
  };
  
  // Check if set is complete (20 reps)
  useEffect(() => {
    if (repCount >= 20) {
      setStatus('Set complete! Great job!');
      setSetComplete(true);
    }
  }, [repCount]);
  
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
      
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Push-Up Tracker</h1>
      
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
            <div className="text-4xl font-bold text-blue-600">{repCount}</div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Status</h2>
            <div className={`text-xl italic ${setComplete ? 'text-green-600 font-bold' : 'text-gray-600'}`}>{status}</div>
          </div>
        </div>
        
        {setComplete && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-center">
            <p className="text-green-700 font-medium">Set complete! You&apos;ve reached 20 push-ups.</p>
          </div>
        )}
        
        <div className="mt-6">
          <Button onClick={handleReset} className="w-full">
            Reset Counter
          </Button>
          <p className="mt-4 text-sm text-gray-500 text-center">
            Camera is {webcamActive ? 'active' : 'initializing'}. 
            Position yourself so your upper body is clearly visible.
          </p>
        </div>
      </div>
    </div>
  );
}
