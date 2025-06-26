// Import only the camera and drawing utils directly
import { Camera } from '@mediapipe/camera_utils';
import { drawLandmarks } from '@mediapipe/drawing_utils';

// Define a type for the Pose object
export interface PoseInterface {
  setOptions: (options: {
    modelComplexity?: 0 | 1 | 2;
    smoothLandmarks?: boolean;
    enableSegmentation?: boolean;
    smoothSegmentation?: boolean;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
  }) => void;
  onResults: (callback: (results: PoseResult) => void) => void;
  send: (options: { image: HTMLVideoElement }) => Promise<void>;
}

// Types for pose detection
export type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
};

export type PoseResult = {
  poseLandmarks: Landmark[];
  poseWorldLandmarks: Landmark[];
};

export type JointAngle = {
  joint: string;
  angle: number;
};

export type FormFeedback = {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
};

// Landmark indices for different body parts
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

// Initialize pose detection
export const initializePoseDetection = async (
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement,
  onPoseResults: (results: PoseResult) => void
): Promise<{ pose: PoseInterface; camera: Camera }> => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Pose detection can only be initialized in a browser environment');
    }

    // Dynamically import the Pose module
    const mediapipePose = await import('@mediapipe/pose');
    
    // Create a new Pose instance using the imported module
    // Use type assertion to help TypeScript understand this is a constructor
    const PoseClass = mediapipePose.Pose as unknown as new (config: {
      locateFile: (file: string) => string;
    }) => PoseInterface;
    
    const pose = new PoseClass({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
      }
    });
    
    console.log('MediaPipe Pose initialized successfully');
    
    // Store the callback function
    let resultsCallback: ((results: PoseResult) => void) | null = null;
    
    // Set options for the pose detector
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // Set up the results callback
    pose.onResults = (callback) => {
      resultsCallback = callback;
      console.log('Results callback set');
    };
    
    // Create a function to handle pose detection results
    const handleResults = (results: PoseResult) => {
      const canvasCtx = canvasElement.getContext('2d');
      if (!canvasCtx) return;

      // Clear canvas
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Draw pose landmarks
      if (results.poseLandmarks) {
        // Define key connections for visualization
        const connections = [
          // Torso
          [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
          [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
          [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
          [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
          
          // Arms
          [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
          [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
          [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
          [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
          
          // Legs
          [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
          [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
          [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
          [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
        ];
        
        // Draw each connection
        connections.forEach(([start, end]) => {
          canvasCtx.beginPath();
          canvasCtx.moveTo(
            results.poseLandmarks[start].x * canvasElement.width,
            results.poseLandmarks[start].y * canvasElement.height
          );
          canvasCtx.lineTo(
            results.poseLandmarks[end].x * canvasElement.width,
            results.poseLandmarks[end].y * canvasElement.height
          );
          canvasCtx.strokeStyle = '#00FF00';
          canvasCtx.lineWidth = 2;
          canvasCtx.stroke();
        });
        
        // Draw landmarks
        drawLandmarks(
          canvasCtx, 
          results.poseLandmarks, 
          { color: '#FF0000', lineWidth: 1, radius: 3 }
        );
      }

      // Pass results to callback
      onPoseResults(results);
      
      // Call the stored callback if it exists
      if (resultsCallback) {
        resultsCallback(results);
      }
    };

    // Set the results handler
    pose.onResults(handleResults);

    // Initialize camera
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await pose.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });

    return { pose, camera };
  } catch (error) {
    console.error('Error initializing pose detection:', error);
    throw error;
  }
};

// Calculate angle between three points
export const calculateAngle = (
  p1: Landmark,
  p2: Landmark,
  p3: Landmark
): number => {
  // Convert to radians
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                  Math.atan2(p1.y - p2.y, p1.x - p2.x);
  
  // Convert to degrees
  let angle = Math.abs(radians * (180 / Math.PI));
  
  // Ensure angle is within 0-180 degrees
  if (angle > 180) {
    angle = 360 - angle;
  }
  
  return angle;
};

// Calculate distance between two points
export const calculateDistance = (p1: Landmark, p2: Landmark): number => {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) + 
    Math.pow(p2.y - p1.y, 2) + 
    Math.pow(p2.z - p1.z, 2)
  );
};

// Check if a landmark is visible
export const isLandmarkVisible = (landmark: Landmark): boolean => {
  return landmark && landmark.visibility !== undefined && landmark.visibility > 0.5;
};

// Define state type for rep counting
export type RepCountState = {
  count: number;
  state: string;
  lastUpdated?: number;
};

// Exercise-specific rep counting algorithms
export const repCountingAlgorithms = {
  // Squat rep counting
  squat: (landmarks: Landmark[], prevState: RepCountState = { count: 0, state: 'up' }): { count: number; state: string; feedback: FormFeedback[] } => {
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
    
    // Check if landmarks are visible
    if (!isLandmarkVisible(leftHip) || !isLandmarkVisible(leftKnee) || !isLandmarkVisible(leftAnkle) ||
        !isLandmarkVisible(rightHip) || !isLandmarkVisible(rightKnee) || !isLandmarkVisible(rightAnkle)) {
      return { count: prevState.count || 0, state: 'unknown', feedback: [] };
    }
    
    // Calculate knee angles
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    
    // Average both knee angles
    const kneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
    
    // Define squat states
    const SQUAT_DOWN_THRESHOLD = 110; // Degrees
    const SQUAT_UP_THRESHOLD = 160; // Degrees
    
    // Initialize state and count
    let state = prevState.state || 'up';
    let count = prevState.count || 0;
    const feedback: FormFeedback[] = [];
    
    // State machine for counting
    if (state === 'up' && kneeAngle < SQUAT_DOWN_THRESHOLD) {
      state = 'down';
    } else if (state === 'down' && kneeAngle > SQUAT_UP_THRESHOLD) {
      state = 'up';
      count += 1;
    }
    
    // Form feedback
    if (kneeAngle < SQUAT_DOWN_THRESHOLD && kneeAngle > 100) {
      feedback.push({
        type: 'depth',
        message: 'Go deeper!',
        severity: 'medium'
      });
    }
    
    // Check knee alignment
    const leftKneeX = leftKnee.x;
    const leftAnkleX = leftAnkle.x;
    const rightKneeX = rightKnee.x;
    const rightAnkleX = rightAnkle.x;
    
    if (Math.abs(leftKneeX - leftAnkleX) > 0.05 || Math.abs(rightKneeX - rightAnkleX) > 0.05) {
      feedback.push({
        type: 'kneeAlignment',
        message: 'Keep knees aligned with toes',
        severity: 'high'
      });
    }
    
    return { count, state, feedback };
  },
  
  // Push-up rep counting
  pushup: (landmarks: Landmark[], prevState: RepCountState = { count: 0, state: 'up' }): { count: number; state: string; feedback: FormFeedback[] } => {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    
    // Check if landmarks are visible
    if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(leftElbow) || !isLandmarkVisible(leftWrist) ||
        !isLandmarkVisible(rightShoulder) || !isLandmarkVisible(rightElbow) || !isLandmarkVisible(rightWrist)) {
      return { count: prevState.count || 0, state: 'unknown', feedback: [] };
    }
    
    // Calculate elbow angles
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    
    // Average both elbow angles
    const elbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
    
    // Define push-up states
    const PUSHUP_DOWN_THRESHOLD = 90; // Degrees
    const PUSHUP_UP_THRESHOLD = 160; // Degrees
    
    // Initialize state and count
    let state = prevState.state || 'up';
    let count = prevState.count || 0;
    const feedback: FormFeedback[] = [];
    
    // State machine for counting
    if (state === 'up' && elbowAngle < PUSHUP_DOWN_THRESHOLD) {
      state = 'down';
    } else if (state === 'down' && elbowAngle > PUSHUP_UP_THRESHOLD) {
      state = 'up';
      count += 1;
    }
    
    // Form feedback
    if (state === 'down' && elbowAngle > 70) {
      feedback.push({
        type: 'depth',
        message: 'Lower your chest closer to the ground',
        severity: 'medium'
      });
    }
    
    // Check elbow position
    const leftShoulderToElbowAngle = Math.atan2(leftElbow.y - leftShoulder.y, leftElbow.x - leftShoulder.x);
    const rightShoulderToElbowAngle = Math.atan2(rightElbow.y - rightShoulder.y, rightElbow.x - rightShoulder.x);
    
    if (Math.abs(leftShoulderToElbowAngle) > Math.PI / 3 || Math.abs(rightShoulderToElbowAngle) > Math.PI / 3) {
      feedback.push({
        type: 'elbowPosition',
        message: 'Keep elbows closer to body',
        severity: 'medium'
      });
    }
    
    return { count, state, feedback };
  },
  
  // Jumping jack rep counting
  jumpingjack: (landmarks: Landmark[], prevState: RepCountState = { count: 0, state: 'together' }): { count: number; state: string; feedback: FormFeedback[] } => {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
    
    // Check if landmarks are visible
    if (!isLandmarkVisible(leftShoulder) || !isLandmarkVisible(rightShoulder) || 
        !isLandmarkVisible(leftWrist) || !isLandmarkVisible(rightWrist) ||
        !isLandmarkVisible(leftAnkle) || !isLandmarkVisible(rightAnkle)) {
      return { count: prevState.count || 0, state: 'unknown', feedback: [] };
    }
    
    // Calculate distances
    const wristDistance = calculateDistance(leftWrist, rightWrist);
    const ankleDistance = calculateDistance(leftAnkle, rightAnkle);
    
    // Define jumping jack states
    const ARMS_TOGETHER_THRESHOLD = 0.3;
    const ARMS_APART_THRESHOLD = 0.6;
    const FEET_TOGETHER_THRESHOLD = 0.1;
    const FEET_APART_THRESHOLD = 0.3;
    
    // Initialize state and count
    let state = prevState.state || 'together';
    let count = prevState.count || 0;
    const feedback: FormFeedback[] = [];
    
    // State machine for counting
    if (state === 'together' && 
        wristDistance > ARMS_APART_THRESHOLD && 
        ankleDistance > FEET_APART_THRESHOLD) {
      state = 'apart';
    } else if (state === 'apart' && 
               wristDistance < ARMS_TOGETHER_THRESHOLD && 
               ankleDistance < FEET_TOGETHER_THRESHOLD) {
      state = 'together';
      count += 1;
    }
    
    // Form feedback
    if (state === 'apart' && wristDistance < ARMS_APART_THRESHOLD) {
      feedback.push({
        type: 'armExtension',
        message: 'Extend arms fully overhead',
        severity: 'low'
      });
    }
    
    if (state === 'apart' && ankleDistance < FEET_APART_THRESHOLD) {
      feedback.push({
        type: 'jumpWidth',
        message: 'Jump wider',
        severity: 'medium'
      });
    }
    
    return { count, state, feedback };
  },
  
  // Generic rep counter for other exercises
  generic: (landmarks: Landmark[], prevState: RepCountState = { count: 0, state: 'unknown' }): { count: number; state: string; feedback: FormFeedback[] } => {
    // This is a placeholder for exercises that don't have specific algorithms yet
    return { count: prevState.count || 0, state: 'unknown', feedback: [] };
  }
};

// Get the appropriate rep counting algorithm based on exercise type
export const getRepCountingAlgorithm = (exerciseKey: string) => {
  switch (exerciseKey) {
    case 'squat':
    case 'deepsquat':
      return repCountingAlgorithms.squat;
    case 'pushup':
    case 'perfectpushup':
    case 'wallpushup':
      return repCountingAlgorithms.pushup;
    case 'jumpingjack':
      return repCountingAlgorithms.jumpingjack;
    default:
      return repCountingAlgorithms.generic;
  }
};
