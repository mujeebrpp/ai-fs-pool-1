'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import WorkoutDayTracker from './WorkoutDayTracker';

type ExerciseItem = {
  name: string;
  trackability?: string;
  reps?: number;
  repsDisplay?: string;
  focus?: string;
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

const weeklyWorkoutPlan: DayWorkout[] = [
  {
    day: 'Monday',
    dayNumber: 1,
    focus: 'Full Body Intro + Mobility',
    style: 'Gentle Start',
    warmUp: {
      title: 'Warm-Up',
      duration: '5 min',
      exercises: [
        { name: 'March in Place', trackability: 'Excellent', focus: 'Focus on high knees' },
        { name: 'Arm Circles', trackability: 'Excellent', focus: 'Forward and backward' },
        { name: 'Side Reaches', trackability: 'Good', focus: 'Focus on reaching and torso tilt' },
        { name: 'Knee Lifts', trackability: 'Excellent', focus: 'Focus on bringing knees up' },
        { name: 'Calf Raises (slow)', trackability: 'Excellent', focus: 'Focus on full range of motion' }
      ]
    },
    mainWorkout: {
      title: 'Main Workout',
      duration: '20 min (2 rounds × 10 min)',
      exercises: [
        { name: 'Front Arm Raise', reps: 10, repsDisplay: '10-12 reps', focus: 'Focus on controlled movement' },
        { name: 'Side Arm Raise', reps: 10, repsDisplay: '10-12 reps', focus: 'Focus on controlled movement' },
        { name: 'Knee Lifts', reps: 10, repsDisplay: '10-12 reps per leg', focus: 'Focus on lifting the knee to hip height' },
        { name: 'Standing Bicep Curls (air)', reps: 10, repsDisplay: '10-12 reps', focus: 'Focus on full elbow flexion' },
        { name: 'Chair Squats', reps: 8, repsDisplay: '8-10 reps', focus: 'Focus on sitting back, not down, with controlled descent' },
        { name: 'Calf Raises', reps: 12, repsDisplay: '12-15 reps', focus: 'Focus on slow, full extension' }
      ]
    },
    coolDown: {
      title: 'Stretching',
      duration: '5 min',
      exercises: [
        { name: 'Overhead Reach', focus: 'Hold 30s, arms extended upwards' },
        { name: 'Standing Side Bend', focus: 'Hold 30s per side, torso tilted to the side' },
        { name: 'Gentle Forward Fold', focus: 'Hold 30s, torso bent at the hips' },
        { name: 'Cross-arm Shoulder Stretch', focus: 'Hold 30s per arm, arm pulled across the body' },
        { name: 'Deep Breathing', focus: '1 min, focus on stillness and deep breaths' }
      ]
    }
  },
  {
    day: 'Tuesday',
    dayNumber: 2,
    focus: 'Upper Body + Core',
    style: 'Posture & Strength',
    warmUp: {
      title: 'Warm-Up',
      duration: '5 min',
      exercises: [
        { name: 'March in Place', trackability: 'Excellent', focus: 'Light and easy' },
        { name: 'Arm Swings (front & back)', trackability: 'Excellent', focus: 'Controlled swings' },
        { name: 'Shoulder Rolls (forward & back)', trackability: 'Excellent', focus: 'Exaggerated circles' },
        { name: 'Front Arm Raise (mini)', trackability: 'Excellent', focus: 'Small, controlled raises' },
        { name: 'Torso Twists (gentle)', trackability: 'Good', focus: 'Controlled rotation' }
      ]
    },
    mainWorkout: {
      title: 'Main Workout',
      duration: '20 min',
      exercises: [
        { name: 'Overhead Press (Air)', reps: 10, repsDisplay: '10-12 reps', focus: 'Focus on full extension overhead' },
        { name: 'Front Arm Raise', reps: 10, repsDisplay: '10-12 reps', focus: 'Controlled movement' },
        { name: 'Side Arm Raise', reps: 10, repsDisplay: '10-12 reps', focus: 'Controlled movement' },
        { name: 'Standing Side Bends', reps: 10, repsDisplay: '10-12 reps per side', focus: 'Focus on torso tilt' },
        { name: 'Standing Knee-to-Elbow', reps: 8, repsDisplay: '8-10 reps per side', focus: 'Focus on bringing knee and opposite elbow close' },
        { name: 'Torso Rotation', reps: 10, repsDisplay: '10-12 reps per side', focus: 'Focus on twisting from the core' }
      ]
    },
    coolDown: {
      title: 'Stretching',
      duration: '5 min',
      exercises: [
        { name: 'Cross-arm Shoulder Stretch', focus: 'Hold 30s per arm' },
        { name: 'Overhead Reach', focus: 'Hold 30s' },
        { name: 'Standing Side Bend', focus: 'Hold 30s per side' },
        { name: 'Wall Chest Opener', focus: 'Hold 30s per arm, arm against wall, chest forward' },
        { name: 'Deep Breathing', focus: '1 min' }
      ]
    }
  },
  {
    day: 'Wednesday',
    dayNumber: 3,
    focus: 'Lower Body + Balance',
    style: 'Legs + Hips',
    warmUp: {
      title: 'Warm-Up',
      duration: '5 min',
      exercises: [
        { name: 'March in Place', trackability: 'Excellent', focus: 'Get the legs moving' },
        { name: 'Knee Bends (mini squats)', trackability: 'Excellent', focus: 'Gentle leg bending' },
        { name: 'Hip Circles (gentle)', trackability: 'Good', focus: 'Controlled hip movement' },
        { name: 'Side Leg Swings (controlled)', trackability: 'Excellent', focus: 'Small, controlled swings' },
        { name: 'Calf Raises', trackability: 'Excellent', focus: 'Quick warm-up for ankles' }
      ]
    },
    mainWorkout: {
      title: 'Main Workout',
      duration: '20 min',
      exercises: [
        { name: 'Chair Squats', reps: 10, repsDisplay: '10-12 reps', focus: 'Focus on depth and control' },
        { name: 'Standing Hamstring Curls', reps: 10, repsDisplay: '10-12 reps per leg', focus: 'Focus on bringing heel to glute' },
        { name: 'Side Leg Raises', reps: 10, repsDisplay: '10-12 reps per leg', focus: 'Focus on lifting leg directly to the side' },
        { name: 'Back Leg Extensions', reps: 10, repsDisplay: '10-12 reps per leg', focus: 'Focus on extending leg straight back' },
        { name: 'Calf Raises (slow & controlled)', reps: 15, repsDisplay: '15-20 reps', focus: 'Focus on full range of motion' },
        { name: 'Heel-Toe Balance Hold', reps: 10, repsDisplay: 'Hold 30s per foot', focus: 'Focus on stability (detecting the static pose)' }
      ]
    },
    coolDown: {
      title: 'Stretching',
      duration: '5 min',
      exercises: [
        { name: 'Hamstring Stretch (leg forward on chair/step)', focus: 'Hold 30s per leg' },
        { name: 'Calf Stretch (wall)', focus: 'Hold 30s per leg' },
        { name: 'Quad Stretch (heel to glute - standing assist)', focus: 'Hold 30s per leg' },
        { name: 'Standing Glute Stretch (figure-4 if stable)', focus: 'Hold 30s per side' },
        { name: 'Deep Breathing', focus: '1 min' }
      ]
    }
  },
  {
    day: 'Thursday',
    dayNumber: 4,
    focus: 'Core + Stability',
    style: 'Abs & Obliques',
    warmUp: {
      title: 'Warm-Up',
      duration: '5 min',
      exercises: [
        { name: 'March in Place', trackability: 'Excellent', focus: 'Light and rhythmic' },
        { name: 'Torso Twists (gentle)', trackability: 'Good', focus: 'Prepare the core' },
        { name: 'Side Reaches', trackability: 'Good', focus: 'Extend and engage the sides' },
        { name: 'Knee Lifts (focus on core)', trackability: 'Excellent', focus: 'Engage lower abs' },
        { name: 'Arm Circles', trackability: 'Excellent', focus: 'Get the upper body moving' }
      ]
    },
    mainWorkout: {
      title: 'Main Workout',
      duration: '20 min',
      exercises: [
        { name: 'Standing Knee-to-Elbow', reps: 10, repsDisplay: '10-12 reps per side', focus: 'Focus on bringing them close' },
        { name: 'Wood Chop (Air)', reps: 10, repsDisplay: '10-12 reps per side', focus: 'Focus on diagonal movement' },
        { name: 'Oblique Side Crunch (standing)', reps: 10, repsDisplay: '10-12 reps per side', focus: 'Focus on side bending' },
        { name: 'March with Core Engagement', reps: 15, repsDisplay: '15-20 steps', focus: 'Emphasize controlled knee lifts' },
        { name: 'Standing Side Bends with Hold', reps: 8, repsDisplay: '8-10 reps per side', focus: 'With 2-3 sec hold at bottom' },
        { name: 'Controlled Leg Lift with Arm Balance', reps: 8, repsDisplay: '8-10 reps per leg', focus: 'Focus on stability' }
      ]
    },
    coolDown: {
      title: 'Stretching',
      duration: '5 min',
      exercises: [
        { name: 'Standing Twist Hold', focus: 'Hold 30s per side, gentle spinal twist' },
        { name: 'Side Reach', focus: 'Hold 30s per side' },
        { name: 'Gentle Forward Fold', focus: 'Hold 30s' },
        { name: 'Cat–Cow (Standing version)', focus: 'Flow for 1 min, focus on spinal flexion/extension' },
        { name: 'Deep Breathing', focus: '1 min' }
      ]
    }
  },
  {
    day: 'Friday',
    dayNumber: 5,
    focus: 'Full Body Strength',
    style: 'Power & Endurance',
    warmUp: {
      title: 'Warm-Up',
      duration: '5 min',
      exercises: [
        { name: 'March in Place', trackability: 'Excellent', focus: 'Elevate heart rate' },
        { name: 'Arm Circles (large)', trackability: 'Excellent', focus: 'Full range' },
        { name: 'Knee Bends (deeper)', trackability: 'Excellent', focus: 'Prepare for squats' },
        { name: 'Torso Twist (more active)', trackability: 'Good', focus: 'Dynamic warm-up' },
        { name: 'Calf Raises (faster)', trackability: 'Excellent', focus: 'Quick activation' }
      ]
    },
    mainWorkout: {
      title: 'Main Workout',
      duration: '20 min (Circuit style – 2 rounds)',
      exercises: [
        { name: 'Chair Squats', reps: 10, repsDisplay: '10-12 reps', focus: 'Focus on good form and depth' },
        { name: 'Side Arm Raise', reps: 10, repsDisplay: '10-12 reps', focus: 'Controlled and full range' },
        { name: 'Standing Knee-to-Elbow', reps: 10, repsDisplay: '10-12 reps each side', focus: 'Keep core engaged' },
        { name: 'Side Step + Mini Squat', reps: 10, repsDisplay: '10-12 reps per side', focus: 'Combine lateral movement with squat' },
        { name: 'Standing Wood Chop', reps: 10, repsDisplay: '10-12 reps per side', focus: 'Powerful, controlled motion' },
        { name: 'Leg Swings (forward & back)', reps: 10, repsDisplay: '10-12 reps per side', focus: 'Dynamic leg movement' },
        { name: 'Overhead Press (Air)', reps: 10, repsDisplay: '10-12 reps', focus: 'Strong upward push' },
        { name: 'Calf Raise (slow, controlled)', reps: 15, repsDisplay: '15-20 reps', focus: 'Squeeze at the top' },
        { name: 'Standing Bicep Curl (Air)', reps: 15, repsDisplay: '15-20 reps', focus: 'Focus on controlled curl' }
      ]
    },
    coolDown: {
      title: 'Stretching',
      duration: '5 min',
      exercises: [
        { name: 'Forward Fold', focus: 'Hold 30s' },
        { name: 'Cross-body Shoulder Stretch', focus: 'Hold 30s per arm' },
        { name: 'Wall Chest Opener', focus: 'Hold 30s per arm' },
        { name: 'Hamstring Stretch (leg forward)', focus: 'Hold 30s per leg' },
        { name: 'Deep Breathing', focus: '1 min' }
      ]
    }
  },
  {
    day: 'Saturday',
    dayNumber: 6,
    focus: 'Flexibility + Flow',
    style: 'Low Impact Cardio',
    warmUp: {
      title: 'Warm-Up',
      duration: '5 min',
      exercises: [
        { name: 'March in Place', trackability: 'Excellent', focus: 'Gentle start' },
        { name: 'Shoulder Rolls (slow)', trackability: 'Excellent', focus: 'Relaxing the upper body' },
        { name: 'Side Reaches (slow & controlled)', trackability: 'Good', focus: 'Gentle stretches' },
        { name: 'Knee Lifts (gentle)', trackability: 'Excellent', focus: 'Light leg movement' },
        { name: 'Calf Raises (slow)', trackability: 'Excellent', focus: 'Light ankle work' }
      ]
    },
    mainWorkout: {
      title: 'Main Workout',
      duration: '20 min (Flow Style)',
      exercises: [
        { name: 'March + Knee Lift (Flowing)', reps: 20, focus: 'Continuous for 2-3 min, focus on smooth transition' },
        { name: 'Side Tap with Reach (Flowing)', reps: 20, focus: 'Continuous for 2-3 min, focus on coordination' },
        { name: 'Arm Circles with Steps (Flowing)', reps: 20, focus: 'Continuous for 2-3 min, integrate arm and leg movement' },
        { name: 'Controlled Squats + Breathe (Flowing)', reps: 20, focus: 'Continuous for 2-3 min, gentle, rhythmic squats' },
        { name: 'Side Bends (flowing)', reps: 20, focus: 'Continuous for 2-3 min, smooth side-to-side movement' },
        { name: 'Wood Chop (gentle pace, flowing)', reps: 20, focus: 'Continuous for 2-3 min, focus on fluid motion' },
        { name: 'Hip Circles (flowing)', reps: 20, focus: 'Continuous for 2-3 min, smooth, continuous circles' }
      ]
    },
    coolDown: {
      title: 'Stretching',
      duration: '5 min',
      exercises: [
        { name: 'Full Body Stretch (Reach up, then gentle forward fold)', focus: 'Hold 1 min' },
        { name: 'Hip Opener (Standing figure-4 if stable)', focus: 'Hold 30s per side' },
        { name: 'Side Stretch (standing)', focus: 'Hold 30s per side' },
        { name: 'Calf Stretch (wall)', focus: 'Hold 30s per leg' },
        { name: 'Deep Calm Breathing', focus: '1 min' }
      ]
    }
  }
];

export default function WeeklyWorkoutPlan() {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<DayWorkout | null>(null);

  const toggleDay = (dayNumber: number) => {
    if (expandedDay === dayNumber) {
      setExpandedDay(null);
      setExpandedSection(null);
    } else {
      setExpandedDay(dayNumber);
      setExpandedSection(null);
    }
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  const startWorkout = (day: DayWorkout) => {
    setActiveWorkout(day);
  };
  
  const closeWorkout = () => {
    setActiveWorkout(null);
  };

  // If a workout is active, show the workout tracker
  if (activeWorkout) {
    return <WorkoutDayTracker workout={activeWorkout} onClose={closeWorkout} />;
  }
  
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">High-Confidence 6-Day Standing Workout Plan (Age 40+, 30 min/day)</h2>
        <p className="text-gray-600">
          A weekly workout plan optimized for MediaPipe camera tracking, focusing on movements with clear, detectable joint angle changes for accurate rep counting.
          Each day focuses on different areas with safe progression from light to moderate-hard over the week.
        </p>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Day</th>
              <th className="py-2 px-4 border-b text-left">Focus Area</th>
              <th className="py-2 px-4 border-b text-left">Style</th>
            </tr>
          </thead>
          <tbody>
            {weeklyWorkoutPlan.map((day) => (
              <tr key={day.dayNumber} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{day.day}</td>
                <td className="py-2 px-4 border-b">{day.focus}</td>
                <td className="py-2 px-4 border-b">{day.style}</td>
              </tr>
            ))}
            <tr className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">Sunday</td>
              <td className="py-2 px-4 border-b">💤 Rest Day</td>
              <td className="py-2 px-4 border-b">Optional Walk/Yoga</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {weeklyWorkoutPlan.map((day) => (
          <Card key={day.dayNumber} className={`overflow-hidden ${expandedDay === day.dayNumber ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex flex-col">
              <div 
                className="p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                onClick={() => toggleDay(day.dayNumber)}
              >
                <div>
                  <h3 className="font-bold">Day {day.dayNumber} – {day.day}</h3>
                  <p className="text-sm text-gray-600">{day.focus}</p>
                </div>
                <div className="text-blue-500">
                  {expandedDay === day.dayNumber ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="px-4 pb-4 bg-gray-50">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    startWorkout(day);
                  }}
                  className="w-full"
                  variant="primary"
                >
                  Start Workout with Camera Tracking
                </Button>
              </div>
            </div>
            
            {expandedDay === day.dayNumber && (
              <CardContent className="p-4">
                {/* Warm-up Section */}
                <div className="mb-3">
                  <div 
                    className="flex justify-between items-center p-2 bg-blue-50 rounded-md cursor-pointer"
                    onClick={() => toggleSection(`warmup-${day.dayNumber}`)}
                  >
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">🕔</span>
                      <h4 className="font-medium">{day.warmUp.title} ({day.warmUp.duration})</h4>
                    </div>
                    <div className="text-blue-500">
                      {expandedSection === `warmup-${day.dayNumber}` ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {expandedSection === `warmup-${day.dayNumber}` && (
                    <ul className="mt-2 pl-8 list-disc space-y-1 text-sm">
                      {day.warmUp.exercises.map((exercise, idx) => (
                        <li key={idx}>{exercise.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
                
                {/* Main Workout Section */}
                <div className="mb-3">
                  <div 
                    className="flex justify-between items-center p-2 bg-green-50 rounded-md cursor-pointer"
                    onClick={() => toggleSection(`main-${day.dayNumber}`)}
                  >
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">💪</span>
                      <h4 className="font-medium">{day.mainWorkout.title} ({day.mainWorkout.duration})</h4>
                    </div>
                    <div className="text-green-500">
                      {expandedSection === `main-${day.dayNumber}` ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {expandedSection === `main-${day.dayNumber}` && (
                    <ul className="mt-2 pl-8 list-disc space-y-1 text-sm">
                      {day.mainWorkout.exercises.map((exercise, idx) => (
                        <li key={idx}>
                          {exercise.name} 
                          {exercise.repsDisplay && <span className="text-gray-600 ml-1">({exercise.repsDisplay})</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                {/* Cool Down Section */}
                <div>
                  <div 
                    className="flex justify-between items-center p-2 bg-purple-50 rounded-md cursor-pointer"
                    onClick={() => toggleSection(`cooldown-${day.dayNumber}`)}
                  >
                    <div className="flex items-center">
                      <span className="text-purple-500 mr-2">🧘</span>
                      <h4 className="font-medium">{day.coolDown.title} ({day.coolDown.duration})</h4>
                    </div>
                    <div className="text-purple-500">
                      {expandedSection === `cooldown-${day.dayNumber}` ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {expandedSection === `cooldown-${day.dayNumber}` && (
                    <ul className="mt-2 pl-8 list-disc space-y-1 text-sm">
                      {day.coolDown.exercises.map((exercise, idx) => (
                        <li key={idx}>{exercise.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
        
        {/* Rest Day Card */}
        <Card className="overflow-hidden">
          <div className="p-4 bg-gray-50">
            <h3 className="font-bold">Day 7 – Sunday</h3>
            <div className="mt-2 p-4 bg-blue-50 rounded-md">
              <div className="flex items-center">
                <span className="text-blue-500 mr-2">💤</span>
                <h4 className="font-medium">Rest Day</h4>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Take a complete rest or engage in light activities like walking or gentle yoga.
                Rest is essential for recovery and muscle growth.
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-lg mb-2">Important Notes</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>This plan is designed specifically for adults aged 40+ with a focus on safe, standing exercises.</li>
          <li>Each workout is 30 minutes total: 5 min warm-up, 20 min main workout, and 5 min cool-down.</li>
          <li>Use the camera tracking feature for real-time form feedback during exercises.</li>
          <li>Exercises are optimized for MediaPipe camera tracking with clear, detectable joint angle changes.</li>
          <li>Progress at your own pace and modify exercises as needed for your fitness level.</li>
          <li>Maintain proper hydration before, during, and after workouts.</li>
        </ul>
      </div>
    </div>
  );
}
