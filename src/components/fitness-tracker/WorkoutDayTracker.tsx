'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  PoseResult, 
  isLandmarkVisible,
  POSE_LANDMARKS,
  PoseInterface,
  Landmark,
  FormFeedback
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

type ExerciseItem = {
  name: string;
  completed?: boolean;
  reps?: number;
  feedback?: FormFeedback[];
};

type WorkoutSection = {
  title: string;
  duration: string;
  exercises: ExerciseItem[];
};

type DayWorkout = {
  day: string;
  dayNumber: number;
  focus: string;
  style: string;
  warmUp: WorkoutSection;
  mainWorkout: WorkoutSection;
  coolDown: WorkoutSection;
};

interface WorkoutDayTrackerProps {
  workout: DayWorkout;
  onClose: () => void;
}

export default function WorkoutDayTracker({ workout, onClose }: WorkoutDayTrackerProps) {
  // State variables
  const [currentSection, setCurrentSection] = useState<'warmUp' | 'mainWorkout' | 'coolDown'>('warmUp');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [webcamActive, setWebcamActive] = useState(false);
  const [feedback, setFeedback] = useState<FormFeedback[]>([]);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [workoutProgress, setWorkoutProgress] = useState<{
    warmUp: ExerciseItem[];
    mainWorkout: ExerciseItem[];
    coolDown: ExerciseItem[];
  }>({
    warmUp: [...workout.warmUp.exercises],
    mainWorkout: [...workout.mainWorkout.exercises],
    coolDown: [...workout.coolDown.exercises]
  });
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseDetectionRef = useRef<{
    pose: PoseInterface;
    camera: MediaPipeCamera;
  } | null>(null);
  const mediaPipeLoadedRef = useRef<boolean>(false);
  
  // Exercise state tracking
  const exerciseStateRef = useRef<{
    state: string;
    lastAngle: number;
  }>({
    state: 'start',
    lastAngle: 180
  });
  
  // Get current exercise
  const getCurrentExercise = (): ExerciseItem => {
    return workoutProgress[currentSection][currentExerciseIndex];
  };
  
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
      // Get current exercise
      const currentExercise = getCurrentExercise();
      
      // Analyze pose based on exercise type
      analyzeExercisePose(currentExercise.name, landmarks);
      
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
            setStatus(`Ready! Start ${getCurrentExercise().name}`);
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
  }, [currentSection, currentExerciseIndex, handlePoseResults, getCurrentExercise]);
  
  
  // Analyze pose based on exercise type
  const analyzeExercisePose = (exerciseName: string, landmarks: Landmark[]) => {
    // Generic tracking for most exercises
    // In a real implementation, you would have specific tracking for each exercise type
    
    // Check if key landmarks are visible
    const shoulderL = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const shoulderR = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const hipL = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const hipR = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    
    if (!isLandmarkVisible(shoulderL) || !isLandmarkVisible(shoulderR) || 
        !isLandmarkVisible(hipL) || !isLandmarkVisible(hipR)) {
      setStatus('Position yourself so your body is clearly visible');
      return;
    }
    
    // For demonstration purposes, we'll use a simple movement detection
    // In a real implementation, you would have specific tracking for each exercise
    
    // Calculate movement amount
    const movementAmount = calculateMovement(landmarks);
    
    // Update status based on movement
    if (movementAmount > 0.01) {
      setStatus('Good movement!');
      
      // Increment rep count occasionally based on movement
      // This is a simplified version - real implementation would be exercise-specific
      if (Math.random() < 0.05) { // 5% chance per frame when moving
        setRepCount(prev => {
          const newCount = prev + 1;
          
          // Check if exercise is complete (10 reps for demonstration)
          if (newCount >= 10) {
            completeCurrentExercise();
          }
          
          return newCount;
        });
      }
    } else {
      setStatus(`Perform ${exerciseName}`);
    }
  };
  
  // Calculate movement amount (simplified)
  const calculateMovement = (landmarks: Landmark[]): number => {
    // Calculate movement based on key landmarks
    // This is a simplified version - real implementation would be more sophisticated
    const shoulderL = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const shoulderR = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const hipL = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const hipR = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    
    // Calculate average y position change as a simple movement metric
    const avgY = (shoulderL.y + shoulderR.y + hipL.y + hipR.y) / 4;
    
    // Store last position to calculate movement
    const lastAvgY = exerciseStateRef.current.lastAngle;
    const movement = Math.abs(avgY - lastAvgY);
    
    // Update last position
    exerciseStateRef.current.lastAngle = avgY;
    
    return movement;
  };
  
  // Complete current exercise
  const completeCurrentExercise = () => {
    setExerciseComplete(true);
    
    // Update exercise in workout progress
    const updatedProgress = { ...workoutProgress };
    updatedProgress[currentSection][currentExerciseIndex].completed = true;
    updatedProgress[currentSection][currentExerciseIndex].reps = repCount;
    setWorkoutProgress(updatedProgress);
    
    setStatus('Exercise complete! Great job!');
  };
  
  // Move to next exercise
  const handleNextExercise = () => {
    // Reset state for next exercise
    setRepCount(0);
    setExerciseComplete(false);
    setFeedback([]);
    
    const currentSectionExercises = workoutProgress[currentSection];
    
    // Check if there are more exercises in the current section
    if (currentExerciseIndex < currentSectionExercises.length - 1) {
      // Move to next exercise in current section
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Move to next section
      if (currentSection === 'warmUp') {
        setCurrentSection('mainWorkout');
        setCurrentExerciseIndex(0);
      } else if (currentSection === 'mainWorkout') {
        setCurrentSection('coolDown');
        setCurrentExerciseIndex(0);
      } else {
        // Workout complete
        onClose();
      }
    }
  };
  
  // Get current section title
  const getCurrentSectionTitle = () => {
    switch (currentSection) {
      case 'warmUp':
        return workout.warmUp.title;
      case 'mainWorkout':
        return workout.mainWorkout.title;
      case 'coolDown':
        return workout.coolDown.title;
      default:
        return '';
    }
  };
  
  // Get current section duration
  const getCurrentSectionDuration = () => {
    switch (currentSection) {
      case 'warmUp':
        return workout.warmUp.duration;
      case 'mainWorkout':
        return workout.mainWorkout.duration;
      case 'coolDown':
        return workout.coolDown.duration;
      default:
        return '';
    }
  };
  
  // Calculate overall progress
  const calculateProgress = () => {
    const totalExercises = 
      workout.warmUp.exercises.length + 
      workout.mainWorkout.exercises.length + 
      workout.coolDown.exercises.length;
    
    const completedExercises = 
      workoutProgress.warmUp.filter(ex => ex.completed).length +
      workoutProgress.mainWorkout.filter(ex => ex.completed).length +
      workoutProgress.coolDown.filter(ex => ex.completed).length;
    
    return Math.round((completedExercises / totalExercises) * 100);
  };
  
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
      
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">
            {workout.day} Workout: {workout.focus}
          </h1>
          <Button onClick={onClose} variant="secondary">Close Tracker</Button>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-3 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">{getCurrentSectionTitle()}</span>
              <span className="text-sm text-gray-500 ml-2">({getCurrentSectionDuration()})</span>
            </div>
            <div className="text-sm font-medium">
              Exercise {currentExerciseIndex + 1}/{workoutProgress[currentSection].length}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md">
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
              
              {!webcamActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                  <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Initializing camera...</p>
                    <p className="text-sm mt-2">Please allow camera access when prompted</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Current Exercise</h2>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {getCurrentExercise().name}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-semibold">Reps</h3>
                <div className="text-3xl font-bold">{repCount}</div>
                <div className="text-sm text-gray-500 mt-1">Target: 10 reps</div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-semibold">Status</h3>
                <div className={`text-lg italic ${exerciseComplete ? 'text-green-600 font-bold' : 'text-gray-600'}`}>
                  {status}
                </div>
              </div>
              
              {feedback.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-2">Form Feedback</h3>
                  <ul className="space-y-2">
                    {feedback.map((item, index) => (
                      <li 
                        key={index}
                        className={`text-sm p-2 rounded ${
                          item.severity === 'high' ? 'bg-red-100 text-red-700' :
                          item.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {exerciseComplete && (
                <Button onClick={handleNextExercise} className="w-full">
                  Next Exercise
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
