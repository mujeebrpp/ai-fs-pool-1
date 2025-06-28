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
import { useSession } from 'next-auth/react';

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

export default function SquatTracker() {
  // State variables
  const [repCount, setRepCount] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [webcamActive, setWebcamActive] = useState(false);
  const [setComplete, setSetComplete] = useState(false);
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [workoutSaved, setWorkoutSaved] = useState(false);
  interface WorkoutHistoryItem {
    id: string;
    name: string;
    date: string;
    duration: number;
    exercises: {
      id: string;
      name: string;
      trackingKey: string;
      sets: {
        id: string;
        reps: number;
        formScore?: number;
      }[];
    }[];
  }
  
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseDetectionRef = useRef<{
    pose: PoseInterface;
    camera: MediaPipeCamera;
  } | null>(null);
  const mediaPipeLoadedRef = useRef<boolean>(false);
  
  // Squat state tracking
  const squatStateRef = useRef<{
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
  
  // Fetch user's workout history
  const fetchWorkoutHistory = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/workouts');
      
      if (response.ok) {
        const data = await response.json();
        // Filter for squat workouts only
        const squatWorkouts = data.workouts.filter((workout: WorkoutHistoryItem) => 
          workout.exercises.some((ex) => ex.name.toLowerCase().includes('squat'))
        );
        setWorkoutHistory(squatWorkouts);
      }
    } catch (error) {
      console.error('Error fetching workout history:', error);
    } finally {
      setIsLoading(false);
    }
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
      const hipL = landmarks[POSE_LANDMARKS.LEFT_HIP];
      const kneeL = landmarks[POSE_LANDMARKS.LEFT_KNEE];
      const ankleL = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

      // Get coordinates for Right side landmarks
      const hipR = landmarks[POSE_LANDMARKS.RIGHT_HIP];
      const kneeR = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
      const ankleR = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

      // Check landmark visibility
      const visL = isLandmarkVisible(hipL) && isLandmarkVisible(kneeL) && isLandmarkVisible(ankleL);
      const visR = isLandmarkVisible(hipR) && isLandmarkVisible(kneeR) && isLandmarkVisible(ankleR);

      // Calculate angles
      let angleL = 0, angleR = 0;
      if (visL) {
        angleL = calculateAngle(hipL, kneeL, ankleL);
      }
      if (visR) {
        angleR = calculateAngle(hipR, kneeR, ankleR);
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
        setStatus('Knees not clearly visible');
        return;
      }
      
      // Check knee alignment for form feedback
      if (visL && visR) {
        const leftKneeX = kneeL.x;
        const leftAnkleX = ankleL.x;
        const rightKneeX = kneeR.x;
        const rightAnkleX = ankleR.x;
        
        if (Math.abs(leftKneeX - leftAnkleX) > 0.05 || Math.abs(rightKneeX - rightAnkleX) > 0.05) {
          setFormFeedback('Keep knees aligned with toes');
        } else {
          setFormFeedback(null);
        }
      }
      
      // Update squat state and count
      updateSquatState(angle);
      
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
            setStatus('Ready! Start squats.');
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
  }, [handlePoseResults]);
  
  
  // Update squat state and count based on knee angle
  const updateSquatState = (angle: number) => {
    // If set is complete, don't count more reps
    if (setComplete) return;
    
    // Define angle thresholds for 'down' and 'up' positions
    const thresholdDown = 110; // Angle below which is considered 'down'
    const thresholdUp = 160;  // Angle above which is considered 'up'
    
    const currentState = squatStateRef.current.state;
    
    // Check for state transitions
    if (angle < thresholdDown) { // Potential 'down' state
      if (currentState === 'up') {
        squatStateRef.current.state = 'down';
        setStatus('Down');
        
        // Check squat depth
        if (angle > 100) {
          setFormFeedback('Go deeper!');
        }
      } else {
        setStatus('Down');
      }
    } else if (angle > thresholdUp) { // Potential 'up' state
      if (currentState === 'down') {
        squatStateRef.current.state = 'up';
        setRepCount(prev => {
          const newCount = prev + 1;
          return newCount;
        }); // Increment counter on completing a rep
        setStatus('Up');
        setFormFeedback(null);
      } else {
        setStatus('Up');
      }
    } else if (currentState === 'down') {
      setStatus('Going Up...');
    } else if (currentState === 'up') {
      setStatus('Going Down...');
    }
    
    squatStateRef.current.lastAngle = angle;
  };
  
  // Reset counter and timer
  const handleReset = () => {
    setRepCount(0);
    setSetComplete(false);
    setTimeRemaining(180);
    setTimerActive(false);
    squatStateRef.current.state = 'up';
    setStatus('Ready! Start squats.');
    setFormFeedback(null);
    setWorkoutSaved(false);
  };
  
  // Save workout to database
  const saveWorkout = async () => {
    if (!session?.user?.id || workoutSaved) return;
    
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId: `squat-tracker-${Date.now()}`,
          workoutName: 'Squat Test',
          type: 'beginner',
          duration: 180 - timeRemaining, // Actual duration in seconds
          exercises: [
            {
              exercise: 'Squat',
              actualCount: repCount,
              formScore: 90, // Default form score
            }
          ]
        }),
      });
      
      if (response.ok) {
        setWorkoutSaved(true);
        setStatus('Workout saved successfully!');
        // Refresh workout history after saving
        fetchWorkoutHistory();
      } else {
        console.error('Failed to save workout');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };
  
  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setStatus('Time\'s up! Great job!');
      setSetComplete(true);
      setTimerActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeRemaining]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Load workout history on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchWorkoutHistory();
    }
  }, [session?.user?.id, fetchWorkoutHistory]);
  
  // Start timer
  const startTimer = () => {
    setTimerActive(true);
    setStatus('Timer started! Begin squats.');
  };
  
  // Check if set is complete (20 reps or time's up)
  useEffect(() => {
    if (repCount >= 20) {
      setStatus('Set complete! Great job!');
      setSetComplete(true);
      setTimerActive(false);
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
      
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Squat Tracker</h1>
      
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
            <h2 className="text-lg font-semibold">Timer</h2>
            <div className={`text-4xl font-bold ${timeRemaining < 30 ? 'text-red-600' : 'text-blue-600'}`}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Status</h2>
          <div className={`text-xl italic ${setComplete ? 'text-green-600 font-bold' : 'text-gray-600'}`}>{status}</div>
        </div>
        
        {formFeedback && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-center">
            <p className="text-yellow-700 font-medium">{formFeedback}</p>
          </div>
        )}
        
        {setComplete && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-center">
            <p className="text-green-700 font-medium">Set complete! You&apos;ve reached 20 squats.</p>
          </div>
        )}
        
        <div className="mt-6 space-y-3">
          {!timerActive && !setComplete && (
            <Button onClick={startTimer} className="w-full bg-green-600 hover:bg-green-700">
              Start 3-Minute Timer
            </Button>
          )}
          
          {setComplete && !workoutSaved && (
            <Button onClick={saveWorkout} className="w-full bg-blue-600 hover:bg-blue-700">
              Save Results ({repCount} squats)
            </Button>
          )}
          
          {(workoutSaved || (!timerActive && !setComplete)) && (
            <Button onClick={handleReset} className="w-full">
              Reset
            </Button>
          )}
          
          <p className="mt-4 text-sm text-gray-500 text-center">
            Camera is {webcamActive ? 'active' : 'initializing'}. 
            Position yourself so your lower body is clearly visible.
          </p>
        </div>
        
        {/* Workout History Section */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Activity History</h2>
          
          {isLoading ? (
            <p className="text-center text-gray-500">Loading history...</p>
          ) : workoutHistory.length > 0 ? (
            <div className="space-y-3">
              {workoutHistory.map((workout) => {
                // Find squat exercise in the workout
                const squatExercise = workout.exercises.find((ex) => 
                  ex.name.toLowerCase().includes('squat')
                );
                
                // Get the rep count from the first set
                const repCount = squatExercise?.sets[0]?.reps || 0;
                
                return (
                  <div key={workout.id} className="bg-gray-50 p-3 rounded-md border">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{workout.name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(workout.date).toLocaleDateString()} at {new Date(workout.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{repCount} squats</p>
                        <p className="text-sm text-gray-600">{Math.round(workout.duration / 60)} minutes</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No workout history found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
