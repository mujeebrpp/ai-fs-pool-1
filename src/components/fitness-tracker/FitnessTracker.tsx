'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { beginnerWorkouts, expertWorkouts, Workout } from '@/lib/fitness/workouts';
import { 
  initializePoseDetection, 
  PoseResult, 
  FormFeedback,
  getRepCountingAlgorithm,
  RepCountState,
  PoseInterface
} from '@/lib/fitness/poseDetection';
import { Camera } from '@mediapipe/camera_utils';

// Define stages for the fitness test
const STAGES = {
  FACE_DETECTION: 'face_detection',
  WORKOUT_SELECTION: 'workout_selection',
  EXERCISE_SELECTION: 'exercise_selection',
  COUNTDOWN: 'countdown',
  EXERCISE: 'exercise',
  REST: 'rest',
  RESULTS: 'results',
};

type ExerciseResult = {
  exercise: string;
  targetCount: number;
  actualCount: number;
  formScore: number;
  success: boolean;
};

type WorkoutResult = {
  workoutId: string;
  workoutName: string;
  type: string;
  duration: number;
  date: Date;
  exercises: ExerciseResult[];
};

export default function FitnessTracker() {
  // State variables
  const [stage, setStage] = useState(STAGES.FACE_DETECTION);
  const [userLevel, setUserLevel] = useState<'beginner' | 'expert'>('beginner');
  const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>(beginnerWorkouts);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [targetCount, setTargetCount] = useState(10);
  const [repCount, setRepCount] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [restTime, setRestTime] = useState(60);
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
  const [workoutResult, setWorkoutResult] = useState<WorkoutResult | null>(null);
  const [useWebcam, setUseWebcam] = useState(true);
  const [webcamActive, setWebcamActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [formFeedback, setFormFeedback] = useState<FormFeedback[]>([]);
  const [formScore, setFormScore] = useState(100);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const poseDetectionRef = useRef<{
    pose: PoseInterface;
    camera: Camera;
  } | null>(null);
  const repCountStateRef = useRef<RepCountState>({ count: 0, state: 'unknown' });
  
  // Initialize webcam
  useEffect(() => {
    if (!useWebcam || !videoRef.current) return;
    
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user" // Prefer front camera for face detection
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              setWebcamActive(true);
              console.log("Webcam active and playing");
            }).catch(err => {
              console.error("Error playing video:", err);
            });
          };
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setUseWebcam(false);
      }
    };
    
    startWebcam();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        
        tracks.forEach(track => {
          track.stop();
        });
        
        videoRef.current.srcObject = null;
        setWebcamActive(false);
      }
    };
  }, [useWebcam]);
  
  // Simulated face detection for demo purposes
  useEffect(() => {
    // Only run face detection in the face detection stage
    if (!useWebcam || !webcamActive || !videoRef.current || !canvasRef.current || stage !== STAGES.FACE_DETECTION) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    
    // Draw overlays on canvas
    const drawOverlays = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        try {
          // Clear the canvas first
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // We don't need to draw the video to canvas anymore since we're showing the video element directly
          
          // Add "Detecting face..." text
          if (!faceDetected) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, canvasRef.current.height - 40, canvasRef.current.width, 40);
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Detecting face...', canvasRef.current.width / 2, canvasRef.current.height - 15);
          } else {
            // Draw face detection rectangle when face is detected
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 3;
            
            // Draw a rectangle in the center of the canvas (simulating face detection)
            const centerX = canvasRef.current.width / 2;
            const centerY = canvasRef.current.height / 2;
            const width = canvasRef.current.width / 3;
            const height = canvasRef.current.height / 2;
            
            ctx.strokeRect(
              centerX - width / 2,
              centerY - height / 2,
              width,
              height
            );
            
            // Add "Face detected" text
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, canvasRef.current.height - 40, canvasRef.current.width, 40);
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Face detected!', canvasRef.current.width / 2, canvasRef.current.height - 15);
          }
        } catch (err) {
          console.error("Error drawing to canvas:", err);
        }
      }
      
      animationId = requestAnimationFrame(drawOverlays);
    };
    
    // Start the animation loop
    animationId = requestAnimationFrame(drawOverlays);
    
    // Simulate face detection after a delay
    faceDetectionTimeoutRef.current = setTimeout(() => {
      setFaceDetected(true);
      console.log("Face detected!");
    }, 3000);
    
    return () => {
      cancelAnimationFrame(animationId);
      if (faceDetectionTimeoutRef.current) {
        clearTimeout(faceDetectionTimeoutRef.current);
      }
      
      // Clear the canvas when unmounting to remove any face detection visuals
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    };
  }, [useWebcam, webcamActive, faceDetected, stage]);
  
  // Countdown effect
  useEffect(() => {
    if (stage !== STAGES.COUNTDOWN) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setStage(STAGES.EXERCISE);
    }
  }, [countdown, stage]);
  
  // Rest timer effect
  useEffect(() => {
    if (stage !== STAGES.REST) return;
    
    if (restTime > 0) {
      const timer = setTimeout(() => {
        setRestTime(restTime - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setStage(STAGES.EXERCISE);
    }
  }, [restTime, stage]);
  
  // Initialize pose detection when in exercise stage
  useEffect(() => {
    if (stage === STAGES.EXERCISE && useWebcam && webcamActive && videoRef.current && canvasRef.current) {
      const initPoseDetection = async () => {
        try {
          const { pose, camera } = await initializePoseDetection(
            videoRef.current!,
            canvasRef.current!,
            handlePoseResults
          );
          
          poseDetectionRef.current = { pose, camera };
          camera.start();
          console.log("Pose detection initialized and camera started");
        } catch (error) {
          console.error("Error initializing pose detection:", error);
        }
      };
      
      initPoseDetection();
      
      return () => {
        if (poseDetectionRef.current && poseDetectionRef.current.camera) {
          poseDetectionRef.current.camera.stop();
          console.log("Camera stopped");
        }
      };
    }
  }, [stage, useWebcam, webcamActive]);
  
  // Handle pose detection results
  const handlePoseResults = (results: PoseResult) => {
    if (stage !== STAGES.EXERCISE || !selectedWorkout) return;
    
    const currentExercise = selectedWorkout.exercises[currentExerciseIndex].exercise;
    const repCountingAlgorithm = getRepCountingAlgorithm(currentExercise.trackingKey);
    
    if (results.poseLandmarks) {
      const { count, state, feedback } = repCountingAlgorithm(
        results.poseLandmarks, 
        repCountStateRef.current
      );
      
      // Update rep count if it changed
      if (count > repCountStateRef.current.count) {
        setRepCount(count);
        
        // Check if set is complete
        if (count >= targetCount) {
          completeCurrentSet();
        }
      }
      
      // Update form feedback
      if (feedback.length > 0) {
        setFormFeedback(feedback);
        
        // Calculate form score based on feedback severity
        const newFormScore = calculateFormScore(feedback);
        setFormScore(newFormScore);
      } else {
        setFormFeedback([]);
      }
      
      // Update state reference
      repCountStateRef.current = { count, state };
    }
  };
  
  // Calculate form score based on feedback
  const calculateFormScore = (feedback: FormFeedback[]): number => {
    if (feedback.length === 0) return 100;
    
    let score = 100;
    feedback.forEach(item => {
      switch (item.severity) {
        case 'low':
          score -= 5;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'high':
          score -= 20;
          break;
      }
    });
    
    return Math.max(0, score);
  };
  
  // Complete current set and move to next set or exercise
  const completeCurrentSet = () => {
    if (!selectedWorkout) return;
    
    const currentExercise = selectedWorkout.exercises[currentExerciseIndex];
    const totalSets = currentExercise.sets;
    
    // If there are more sets to do for this exercise
    if (currentSetIndex < totalSets - 1) {
      // Save current set results
      const exerciseResult: ExerciseResult = {
        exercise: currentExercise.exercise.name,
        targetCount,
        actualCount: repCount,
        formScore,
        success: repCount >= targetCount
      };
      
      setExerciseResults(prev => [...prev, exerciseResult]);
      
      // Move to rest period before next set
      setRestTime(currentExercise.restBetweenSets);
      setStage(STAGES.REST);
      
      // Prepare for next set
      setCurrentSetIndex(currentSetIndex + 1);
      setRepCount(0);
      repCountStateRef.current = { count: 0, state: 'unknown' };
    } else {
      // All sets for this exercise are complete
      const exerciseResult: ExerciseResult = {
        exercise: currentExercise.exercise.name,
        targetCount,
        actualCount: repCount,
        formScore,
        success: repCount >= targetCount
      };
      
      setExerciseResults(prev => [...prev, exerciseResult]);
      
      // Check if there are more exercises in the workout
      if (currentExerciseIndex < selectedWorkout.exercises.length - 1) {
        // Move to next exercise
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
        setRepCount(0);
        repCountStateRef.current = { count: 0, state: 'unknown' };
        
        // Set target count for next exercise
        const nextExercise = selectedWorkout.exercises[currentExerciseIndex + 1];
        setTargetCount(nextExercise.reps);
        
        // Rest before next exercise
        setRestTime(60); // Default rest between exercises
        setStage(STAGES.REST);
      } else {
        // Workout complete
        completeWorkout();
      }
    }
  };
  
  // Complete the entire workout
  const completeWorkout = async () => {
    if (!selectedWorkout) return;
    
    const result: WorkoutResult = {
      workoutId: selectedWorkout.id,
      workoutName: selectedWorkout.name,
      type: selectedWorkout.type,
      duration: selectedWorkout.duration,
      date: new Date(),
      exercises: exerciseResults
    };
    
    setWorkoutResult(result);
    setStage(STAGES.RESULTS);
    
    // Save workout result to database
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });
      
      if (!response.ok) {
        console.error('Failed to save workout:', await response.text());
      } else {
        console.log('Workout saved successfully');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };
  
  // Function to manually count a rep (for demo purposes)
  const countRep = () => {
    if (stage !== STAGES.EXERCISE) return;
    
    setRepCount(prevCount => {
      const newCount = prevCount + 1;
      
      // Check if set is complete
      if (newCount >= targetCount) {
        completeCurrentSet();
      }
      
      return newCount;
    });
  };
  
  // Handle workout level selection
  const handleLevelSelect = (level: 'beginner' | 'expert') => {
    setUserLevel(level);
    setAvailableWorkouts(level === 'beginner' ? beginnerWorkouts : expertWorkouts);
  };
  
  // Handle workout selection
  const handleWorkoutSelect = (workout: Workout) => {
    setSelectedWorkout(workout);
    setStage(STAGES.EXERCISE_SELECTION);
    
    // Reset exercise and set indices
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setExerciseResults([]);
  };
  
  // Handle exercise selection
  const handleExerciseSelect = () => {
    if (!selectedWorkout) return;
    
    // Set target count for the selected exercise
    const exercise = selectedWorkout.exercises[currentExerciseIndex];
    setTargetCount(exercise.reps);
    
    setStage(STAGES.COUNTDOWN);
    setCountdown(3);
    setRepCount(0);
    repCountStateRef.current = { count: 0, state: 'unknown' };
  };
  
  
  // Handle restart
  const handleRestart = () => {
    // Stop camera if running
    if (poseDetectionRef.current && poseDetectionRef.current.camera) {
      poseDetectionRef.current.camera.stop();
    }
    
    // Reset all state
    setStage(STAGES.WORKOUT_SELECTION);
    setSelectedWorkout(null);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setTargetCount(10);
    setRepCount(0);
    setCountdown(3);
    setExerciseResults([]);
    setWorkoutResult(null);
    setFormFeedback([]);
    setFormScore(100);
    repCountStateRef.current = { count: 0, state: 'unknown' };
  };
  
  // Toggle webcam
  const handleToggleWebcam = () => {
    setUseWebcam(!useWebcam);
  };
  
  // Proceed to exercise selection after face detection
  const handleProceedToExerciseSelection = () => {
    if (faceDetected) {
      setStage(STAGES.WORKOUT_SELECTION);
    }
  };
  
  // Render different stages of the fitness test
  const renderStage = () => {
    switch (stage) {
      case STAGES.FACE_DETECTION:
        return (
          <div className="text-center">
            <h2 className="mb-4 text-xl font-semibold">Face Detection</h2>
            <p className="mb-4">Please position your face in the camera view.</p>
            <div className="mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-md ${faceDetected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 mr-2 ${faceDetected ? 'text-green-500' : 'text-yellow-500'}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  {faceDetected ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  )}
                </svg>
                <span>{faceDetected ? 'Face detected!' : 'No face detected'}</span>
              </div>
            </div>
            <Button 
              onClick={handleProceedToExerciseSelection} 
              disabled={!faceDetected}
              className={!faceDetected ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Continue to Workout
            </Button>
          </div>
        );
        
      case STAGES.WORKOUT_SELECTION:
        return (
          <div className="text-center">
            <h2 className="mb-4 text-xl font-semibold">Select Workout Level</h2>
            <div className="mb-6 flex justify-center gap-4">
              <Button 
                onClick={() => handleLevelSelect('beginner')}
                className={`px-6 py-3 ${userLevel === 'beginner' ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                Beginner
              </Button>
              <Button 
                onClick={() => handleLevelSelect('expert')}
                className={`px-6 py-3 ${userLevel === 'expert' ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                Expert
              </Button>
            </div>
            
            <h3 className="mb-3 text-lg font-medium">Available Workouts</h3>
            <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto">
              {availableWorkouts.map(workout => (
                <div 
                  key={workout.id} 
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleWorkoutSelect(workout)}
                >
                  <h4 className="font-semibold text-lg">{workout.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{workout.description}</p>
                  <div className="flex justify-between text-sm">
                    <span>Duration: {workout.duration} min</span>
                    <span>Exercises: {workout.exercises.length}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex items-center justify-center">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={useWebcam} 
                    onChange={handleToggleWebcam} 
                  />
                  <div className={`block w-14 h-8 rounded-full ${useWebcam ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${useWebcam ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-700 font-medium">
                  Use Webcam
                </div>
              </label>
            </div>
          </div>
        );
        
      case STAGES.EXERCISE_SELECTION:
        return (
          <div className="text-center">
            <h2 className="mb-4 text-xl font-semibold">{selectedWorkout?.name}</h2>
            <p className="mb-4 text-gray-600">{selectedWorkout?.description}</p>
            
            <div className="mb-6">
              <h3 className="mb-2 font-medium">Current Exercise:</h3>
              {selectedWorkout && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold">
                    {selectedWorkout.exercises[currentExerciseIndex].exercise.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedWorkout.exercises[currentExerciseIndex].exercise.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>Sets: {selectedWorkout.exercises[currentExerciseIndex].sets}</div>
                    <div>Reps: {selectedWorkout.exercises[currentExerciseIndex].reps}</div>
                  </div>
                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-1">Instructions:</h5>
                    <ul className="text-sm text-left list-disc pl-5">
                      {selectedWorkout.exercises[currentExerciseIndex].exercise.instructions.map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-1">Form Tips:</h5>
                    <ul className="text-sm text-left list-disc pl-5">
                      {selectedWorkout.exercises[currentExerciseIndex].exercise.formTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={handleExerciseSelect}>Start Exercise</Button>
              <Button variant="secondary" onClick={handleRestart}>Back to Workouts</Button>
            </div>
          </div>
        );
        
      case STAGES.COUNTDOWN:
        return (
          <div className="text-center">
            <h2 className="mb-4 text-xl font-semibold">Get Ready!</h2>
            <div className="text-6xl font-bold mb-4">{countdown}</div>
            {selectedWorkout && (
              <p>
                Prepare for {selectedWorkout.exercises[currentExerciseIndex].exercise.name} - 
                Set {currentSetIndex + 1} of {selectedWorkout.exercises[currentExerciseIndex].sets}
              </p>
            )}
          </div>
        );
        
      case STAGES.EXERCISE:
        return (
          <div className="text-center">
            {selectedWorkout && (
              <>
                <h2 className="mb-2 text-xl font-semibold">
                  {selectedWorkout.exercises[currentExerciseIndex].exercise.name}
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                  Set {currentSetIndex + 1} of {selectedWorkout.exercises[currentExerciseIndex].sets}
                </p>
              </>
            )}
            
            <div className="flex justify-center items-center mb-4">
              <div className="text-4xl font-bold">{repCount}</div>
              <div className="mx-2 text-xl">/</div>
              <div className="text-2xl">{targetCount}</div>
            </div>
            
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(repCount / targetCount) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Form feedback */}
            {formFeedback.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <h3 className="text-sm font-medium mb-2">Form Feedback:</h3>
                <ul className="text-sm">
                  {formFeedback.map((feedback, idx) => (
                    <li key={idx} className="mb-1 flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        feedback.severity === 'high' ? 'bg-red-500' : 
                        feedback.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></span>
                      {feedback.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <Button variant="danger" onClick={handleRestart}>Stop Exercise</Button>
            </div>
            
            <div className="mt-4">
              <p className="mb-2 text-sm text-gray-700">
                Camera is {webcamActive ? 'active' : 'initializing'}. Form Score: {formScore}%
              </p>
              
              <div className="mt-4">
                <Button 
                  onClick={countRep}
                  disabled={!webcamActive}
                  className={!webcamActive ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Simulate Movement Detection
                </Button>
                <p className="mt-2 text-xs text-gray-500">
                  Click this button to simulate the camera detecting your movement
                </p>
              </div>
            </div>
          </div>
        );
        
      case STAGES.REST:
        return (
          <div className="text-center">
            <h2 className="mb-4 text-xl font-semibold">Rest Period</h2>
            <div className="text-6xl font-bold mb-4">{restTime}</div>
            <p className="mb-4">Take a short break before the next set</p>
            
            {selectedWorkout && (
              <div className="mb-4">
                <p>
                  Next: {selectedWorkout.exercises[currentExerciseIndex].exercise.name} - 
                  Set {currentSetIndex + 1} of {selectedWorkout.exercises[currentExerciseIndex].sets}
                </p>
              </div>
            )}
            
            <Button onClick={() => setRestTime(0)}>Skip Rest</Button>
          </div>
        );
        
      case STAGES.RESULTS:
        return (
          <div className="text-center">
            <h2 className="mb-4 text-xl font-semibold">Workout Complete!</h2>
            
            {workoutResult && (
              <div className="mb-6">
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="font-medium text-lg mb-2">{workoutResult.workoutName}</h3>
                  <p className="text-sm mb-1">Type: {workoutResult.type}</p>
                  <p className="text-sm mb-1">Duration: {workoutResult.duration} minutes</p>
                  <p className="text-sm mb-1">Date: {workoutResult.date.toLocaleDateString()}</p>
                </div>
                
                <h3 className="font-medium text-lg mb-2">Exercise Results:</h3>
                <div className="space-y-3">
                  {exerciseResults.map((result, idx) => (
                    <div key={idx} className="p-3 border rounded-md">
                      <h4 className="font-medium">{result.exercise}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>Target: {result.targetCount} reps</p>
                        <p>Completed: {result.actualCount} reps</p>
                        <p>Form Score: {result.formScore}%</p>
                        <p className={result.success ? 'text-green-600' : 'text-red-600'}>
                          {result.success ? 'Completed' : 'Incomplete'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button onClick={handleRestart} className="mt-6">Start New Workout</Button>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="relative">
      {/* Video and canvas elements for webcam and pose detection */}
      <div className="relative mb-6 flex justify-center">
        {useWebcam && (
          <div className="relative" style={{ width: '640px', maxWidth: '100%' }}>
            <video
              ref={videoRef}
              className="rounded-lg"
              playsInline
              style={{ 
                display: stage === STAGES.FACE_DETECTION || stage === STAGES.EXERCISE ? 'block' : 'none',
                width: '100%',
                height: 'auto'
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0"
              style={{
                width: '100%',
                height: '100%'
              }}
              width={640}
              height={480}
            />
          </div>
        )}
      </div>
      
      {/* Main content area */}
      <div className="container mx-auto px-4">
        {renderStage()}
      </div>
    </div>
  );
}
