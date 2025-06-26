export type WorkoutType = 'beginner' | 'expert';

export type Exercise = {
  name: string;
  trackingKey: string;
  description: string;
  targetMuscles: string[];
  instructions: string[];
  formTips: string[];
  trackingPoints: string[]; // Body landmarks to track
  repDetectionMethod: string;
  formFeedbackRules: {
    type: string;
    message: string;
    detection: string;
  }[];
};

export type Workout = {
  id: string;
  name: string;
  type: WorkoutType;
  description: string;
  duration: number; // in minutes
  exercises: {
    exercise: Exercise;
    sets: number;
    reps: number;
    restBetweenSets: number; // in seconds
  }[];
};

// Beginner Workouts
export const beginnerWorkouts: Workout[] = [
  {
    id: 'beginner-1',
    name: 'Foundational Strength Circuit',
    type: 'beginner',
    description: 'A full-body workout focusing on fundamental movement patterns to build a strong foundation.',
    duration: 30,
    exercises: [
      {
        exercise: {
          name: 'Bodyweight Squat',
          trackingKey: 'squat',
          description: 'A fundamental lower body exercise that targets the quadriceps, hamstrings, and glutes.',
          targetMuscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
          instructions: [
            'Stand with feet shoulder-width apart',
            'Lower your body as if sitting in a chair',
            'Keep chest up and back straight',
            'Return to standing position'
          ],
          formTips: [
            'Keep knees aligned with toes',
            'Lower until thighs are parallel to ground',
            'Maintain weight in heels'
          ],
          trackingPoints: ['hip', 'knee', 'ankle'],
          repDetectionMethod: 'Hip-knee-ankle angle threshold crossing',
          formFeedbackRules: [
            {
              type: 'depth',
              message: 'Go deeper!',
              detection: 'Knee angle > 100 degrees at bottom position'
            },
            {
              type: 'kneeAlignment',
              message: 'Keep knees aligned with toes',
              detection: 'Knee position outside of foot width'
            }
          ]
        },
        sets: 3,
        reps: 12,
        restBetweenSets: 60
      },
      {
        exercise: {
          name: 'Modified Push-up',
          trackingKey: 'pushup',
          description: 'An upper body exercise that can be performed from the knees for beginners.',
          targetMuscles: ['Chest', 'Shoulders', 'Triceps', 'Core'],
          instructions: [
            'Start on hands and knees with hands slightly wider than shoulders',
            'Lower chest toward the ground',
            'Push back up to starting position'
          ],
          formTips: [
            'Keep body in a straight line from head to knees',
            'Elbows should bend at about 45 degrees from body',
            'Look slightly ahead, not directly at the floor'
          ],
          trackingPoints: ['shoulder', 'elbow', 'wrist'],
          repDetectionMethod: 'Shoulder-elbow-wrist angle threshold crossing',
          formFeedbackRules: [
            {
              type: 'elbowPosition',
              message: 'Keep elbows closer to body',
              detection: 'Elbow angle > 60 degrees from torso'
            },
            {
              type: 'backAlignment',
              message: 'Keep your back straight',
              detection: 'Back curvature detection'
            }
          ]
        },
        sets: 3,
        reps: 8,
        restBetweenSets: 60
      },
      {
        exercise: {
          name: 'Jumping Jacks',
          trackingKey: 'jumpingjack',
          description: 'A full-body cardio exercise that raises your heart rate.',
          targetMuscles: ['Shoulders', 'Hips', 'Quads', 'Cardiovascular system'],
          instructions: [
            'Start standing with feet together and arms at sides',
            'Jump feet out wide while raising arms overhead',
            'Jump feet back together while lowering arms'
          ],
          formTips: [
            'Land softly on the balls of your feet',
            'Keep a slight bend in knees',
            'Extend arms fully overhead'
          ],
          trackingPoints: ['shoulder', 'hip', 'ankle', 'wrist'],
          repDetectionMethod: 'Arm and leg position state machine',
          formFeedbackRules: [
            {
              type: 'armExtension',
              message: 'Extend arms fully overhead',
              detection: 'Arm angle < 160 degrees at top position'
            },
            {
              type: 'jumpWidth',
              message: 'Jump wider',
              detection: 'Feet distance < shoulder width at wide position'
            }
          ]
        },
        sets: 3,
        reps: 20,
        restBetweenSets: 45
      }
    ]
  },
  {
    id: 'beginner-2',
    name: 'Cardio Starter',
    type: 'beginner',
    description: 'A beginner-friendly cardio workout to improve endurance and heart health.',
    duration: 25,
    exercises: [
      {
        exercise: {
          name: 'Marching in Place',
          trackingKey: 'marching',
          description: 'A simple cardio exercise that elevates your heart rate.',
          targetMuscles: ['Quadriceps', 'Hip flexors', 'Cardiovascular system'],
          instructions: [
            'Stand tall with feet hip-width apart',
            'Lift right knee up to hip height',
            'Lower right foot and lift left knee',
            'Continue alternating at a comfortable pace'
          ],
          formTips: [
            'Maintain an upright posture',
            'Engage your core',
            'Pump arms naturally as you march'
          ],
          trackingPoints: ['hip', 'knee', 'ankle'],
          repDetectionMethod: 'Knee height threshold crossing',
          formFeedbackRules: [
            {
              type: 'kneeHeight',
              message: 'Lift knees higher',
              detection: 'Knee height < hip height'
            },
            {
              type: 'posture',
              message: 'Stand tall, don\'t lean forward',
              detection: 'Forward lean angle > 10 degrees'
            }
          ]
        },
        sets: 3,
        reps: 30,
        restBetweenSets: 30
      },
      {
        exercise: {
          name: 'Arm Circles',
          trackingKey: 'armcircles',
          description: 'An upper body exercise that improves shoulder mobility.',
          targetMuscles: ['Shoulders', 'Upper back', 'Arms'],
          instructions: [
            'Stand with feet shoulder-width apart',
            'Extend arms out to sides at shoulder height',
            'Make small circles with arms',
            'Switch direction after completing reps'
          ],
          formTips: [
            'Keep shoulders down away from ears',
            'Maintain arm height at shoulder level',
            'Start with small circles and gradually increase size'
          ],
          trackingPoints: ['shoulder', 'elbow', 'wrist'],
          repDetectionMethod: 'Wrist circular path completion',
          formFeedbackRules: [
            {
              type: 'armHeight',
              message: 'Keep arms at shoulder height',
              detection: 'Arm angle deviation from horizontal > 15 degrees'
            },
            {
              type: 'shoulderTension',
              message: 'Relax your shoulders',
              detection: 'Shoulder elevation > normal threshold'
            }
          ]
        },
        sets: 2,
        reps: 15,
        restBetweenSets: 30
      }
    ]
  },
  {
    id: 'beginner-3',
    name: 'Core Fundamentals',
    type: 'beginner',
    description: 'Focus on building core strength with beginner-friendly exercises.',
    duration: 20,
    exercises: [
      {
        exercise: {
          name: 'Modified Plank',
          trackingKey: 'plank',
          description: 'A core stabilizing exercise performed from the knees for beginners.',
          targetMuscles: ['Core', 'Shoulders', 'Back'],
          instructions: [
            'Start on hands and knees',
            'Walk hands forward and lower to forearms if comfortable',
            'Hold position with back straight',
            'Hold for specified time'
          ],
          formTips: [
            'Keep back flat (no sagging or arching)',
            'Engage core by drawing navel to spine',
            'Keep neck in neutral position'
          ],
          trackingPoints: ['shoulder', 'hip', 'ankle', 'spine'],
          repDetectionMethod: 'Time-based with back alignment monitoring',
          formFeedbackRules: [
            {
              type: 'backSagging',
              message: 'Don\'t let your hips sag',
              detection: 'Hip position below straight line from shoulder to knee'
            },
            {
              type: 'backArching',
              message: 'Don\'t arch your back',
              detection: 'Hip position above straight line from shoulder to knee'
            }
          ]
        },
        sets: 3,
        reps: 20, // seconds
        restBetweenSets: 45
      },
      {
        exercise: {
          name: 'Bird Dog',
          trackingKey: 'birddog',
          description: 'A core stability exercise that also improves balance and coordination.',
          targetMuscles: ['Core', 'Lower back', 'Glutes', 'Shoulders'],
          instructions: [
            'Start on hands and knees',
            'Extend right arm forward and left leg back',
            'Return to starting position',
            'Extend left arm forward and right leg back',
            'Return to starting position'
          ],
          formTips: [
            'Keep back flat and core engaged',
            'Extend limbs fully without arching back',
            'Move slowly and with control'
          ],
          trackingPoints: ['shoulder', 'hip', 'knee', 'ankle', 'wrist'],
          repDetectionMethod: 'Opposite limb extension detection',
          formFeedbackRules: [
            {
              type: 'backStability',
              message: 'Keep your back stable',
              detection: 'Back rotation or tilt > 10 degrees'
            },
            {
              type: 'limbExtension',
              message: 'Extend arm and leg fully',
              detection: 'Limb extension < 80% of full range'
            }
          ]
        },
        sets: 3,
        reps: 10,
        restBetweenSets: 45
      }
    ]
  },
  {
    id: 'beginner-4',
    name: 'Upper Body Primer',
    type: 'beginner',
    description: 'A beginner-friendly workout focusing on upper body strength.',
    duration: 25,
    exercises: [
      {
        exercise: {
          name: 'Wall Push-up',
          trackingKey: 'wallpushup',
          description: 'A modified push-up using a wall for support, ideal for beginners.',
          targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
          instructions: [
            'Stand facing wall at arm\'s length',
            'Place hands on wall at shoulder height',
            'Bend elbows to bring chest toward wall',
            'Push back to starting position'
          ],
          formTips: [
            'Keep body in a straight line',
            'Engage core throughout movement',
            'Keep elbows at 45-degree angle from body'
          ],
          trackingPoints: ['shoulder', 'elbow', 'wrist', 'hip'],
          repDetectionMethod: 'Shoulder-to-wall distance change',
          formFeedbackRules: [
            {
              type: 'elbowPosition',
              message: 'Keep elbows at 45-degree angle',
              detection: 'Elbow angle > 60 degrees from torso'
            },
            {
              type: 'bodyAlignment',
              message: 'Keep body straight',
              detection: 'Hip angle deviation > 15 degrees from straight line'
            }
          ]
        },
        sets: 3,
        reps: 12,
        restBetweenSets: 45
      },
      {
        exercise: {
          name: 'Seated Shoulder Press',
          trackingKey: 'shoulderpress',
          description: 'An upper body exercise that targets the shoulders.',
          targetMuscles: ['Shoulders', 'Triceps', 'Upper back'],
          instructions: [
            'Sit with back supported',
            'Start with arms bent at 90 degrees at shoulder height',
            'Press arms overhead until almost straight',
            'Lower back to starting position'
          ],
          formTips: [
            'Keep core engaged and back supported',
            'Don\'t lock elbows at the top',
            'Avoid arching lower back'
          ],
          trackingPoints: ['shoulder', 'elbow', 'wrist'],
          repDetectionMethod: 'Arm extension and flexion angle tracking',
          formFeedbackRules: [
            {
              type: 'backArching',
              message: 'Don\'t arch your back',
              detection: 'Lower back arching > 15 degrees'
            },
            {
              type: 'elbowLocking',
              message: 'Don\'t lock your elbows',
              detection: 'Elbow extension > 175 degrees'
            }
          ]
        },
        sets: 3,
        reps: 10,
        restBetweenSets: 60
      }
    ]
  },
  {
    id: 'beginner-5',
    name: 'Mobility & Balance',
    type: 'beginner',
    description: 'Improve flexibility, joint mobility, and balance with these beginner exercises.',
    duration: 20,
    exercises: [
      {
        exercise: {
          name: 'Standing Leg Raises',
          trackingKey: 'legraise',
          description: 'A balance exercise that also strengthens the hip flexors.',
          targetMuscles: ['Hip flexors', 'Core', 'Balance'],
          instructions: [
            'Stand tall with feet together',
            'Lift one leg forward to hip height',
            'Hold briefly, then lower',
            'Repeat with other leg'
          ],
          formTips: [
            'Use a wall or chair for support if needed',
            'Keep standing leg slightly bent',
            'Maintain upright posture'
          ],
          trackingPoints: ['hip', 'knee', 'ankle'],
          repDetectionMethod: 'Leg height threshold detection',
          formFeedbackRules: [
            {
              type: 'legHeight',
              message: 'Lift leg higher',
              detection: 'Leg height < 70% of hip height'
            },
            {
              type: 'posture',
              message: 'Stand tall, don\'t lean back',
              detection: 'Torso lean > 10 degrees'
            }
          ]
        },
        sets: 2,
        reps: 10,
        restBetweenSets: 30
      },
      {
        exercise: {
          name: 'Seated Torso Rotation',
          trackingKey: 'torsorotation',
          description: 'A mobility exercise for the spine and core.',
          targetMuscles: ['Obliques', 'Lower back', 'Spine mobility'],
          instructions: [
            'Sit on edge of chair with feet flat',
            'Cross arms over chest',
            'Rotate torso to right as far as comfortable',
            'Return to center and rotate to left',
            'Continue alternating sides'
          ],
          formTips: [
            'Keep hips facing forward',
            'Sit tall with good posture',
            'Move slowly and with control'
          ],
          trackingPoints: ['shoulder', 'hip', 'spine'],
          repDetectionMethod: 'Shoulder rotation angle tracking',
          formFeedbackRules: [
            {
              type: 'hipMovement',
              message: 'Keep hips facing forward',
              detection: 'Hip rotation > 15 degrees'
            },
            {
              type: 'posture',
              message: 'Sit tall, don\'t slouch',
              detection: 'Spine flexion > 20 degrees'
            }
          ]
        },
        sets: 2,
        reps: 10,
        restBetweenSets: 30
      }
    ]
  }
];

// Expert Workouts
export const expertWorkouts: Workout[] = [
  {
    id: 'expert-1',
    name: 'Hypertrophy Split',
    type: 'expert',
    description: 'A high-volume workout designed to maximize muscle growth through targeted exercises.',
    duration: 45,
    exercises: [
      {
        exercise: {
          name: 'Deep Squat',
          trackingKey: 'deepsquat',
          description: 'An advanced squat variation focusing on full range of motion.',
          targetMuscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
          instructions: [
            'Stand with feet shoulder-width apart',
            'Lower your body until thighs are below parallel to ground',
            'Maintain upright chest and neutral spine',
            'Drive through heels to return to standing'
          ],
          formTips: [
            'Keep weight in heels and mid-foot',
            'Maintain knee alignment with toes',
            'Achieve depth with good form'
          ],
          trackingPoints: ['hip', 'knee', 'ankle', 'spine'],
          repDetectionMethod: 'Hip depth threshold with spine angle monitoring',
          formFeedbackRules: [
            {
              type: 'depth',
              message: 'Go deeper for full range of motion',
              detection: 'Hip height > 10% above knee height at bottom'
            },
            {
              type: 'kneeValgus',
              message: 'Keep knees tracking over toes',
              detection: 'Knee position inside or outside foot alignment > 3 inches'
            },
            {
              type: 'torsoAngle',
              message: 'Keep chest up',
              detection: 'Forward lean > 45 degrees'
            }
          ]
        },
        sets: 4,
        reps: 12,
        restBetweenSets: 90
      },
      {
        exercise: {
          name: 'Perfect Push-up',
          trackingKey: 'perfectpushup',
          description: 'A standard push-up with strict form requirements.',
          targetMuscles: ['Chest', 'Shoulders', 'Triceps', 'Core'],
          instructions: [
            'Start in plank position with hands slightly wider than shoulders',
            'Lower body until chest nearly touches ground',
            'Keep elbows at 45-degree angle from body',
            'Push back up to starting position'
          ],
          formTips: [
            'Maintain rigid plank throughout movement',
            'Touch chest to ground at bottom position',
            'Fully extend arms at top without locking elbows'
          ],
          trackingPoints: ['shoulder', 'elbow', 'wrist', 'hip', 'ankle'],
          repDetectionMethod: 'Chest-to-ground proximity with body alignment check',
          formFeedbackRules: [
            {
              type: 'depth',
              message: 'Lower chest closer to ground',
              detection: 'Chest height > 4 inches from ground at bottom'
            },
            {
              type: 'hipSag',
              message: 'Keep hips up, maintain plank position',
              detection: 'Hip height > 2 inches below straight line from shoulder to ankle'
            },
            {
              type: 'elbowAngle',
              message: 'Keep elbows at 45-degree angle',
              detection: 'Elbow angle > 60 degrees from torso'
            }
          ]
        },
        sets: 4,
        reps: 15,
        restBetweenSets: 60
      },
      {
        exercise: {
          name: 'Bulgarian Split Squat',
          trackingKey: 'splitsquat',
          description: 'A unilateral leg exercise that challenges balance and builds strength.',
          targetMuscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core', 'Balance'],
          instructions: [
            'Stand about 2 feet in front of a bench or chair',
            'Place one foot behind you on the bench',
            'Lower your body until front thigh is parallel to ground',
            'Push through front heel to return to starting position'
          ],
          formTips: [
            'Keep front knee aligned with toes',
            'Maintain upright torso',
            'Lower until front thigh is parallel to ground'
          ],
          trackingPoints: ['hip', 'knee', 'ankle', 'spine'],
          repDetectionMethod: 'Front knee angle threshold with balance monitoring',
          formFeedbackRules: [
            {
              type: 'kneePosition',
              message: 'Keep front knee behind toes',
              detection: 'Knee position > 2 inches past toes'
            },
            {
              type: 'torsoLean',
              message: 'Stay upright, don\'t lean forward',
              detection: 'Forward lean > 20 degrees'
            },
            {
              type: 'depth',
              message: 'Lower until thigh is parallel',
              detection: 'Thigh angle > 20 degrees above parallel'
            }
          ]
        },
        sets: 3,
        reps: 10,
        restBetweenSets: 60
      }
    ]
  },
  {
    id: 'expert-2',
    name: 'Power & Explosiveness',
    type: 'expert',
    description: 'Develop power, speed, and explosive strength with these advanced movements.',
    duration: 40,
    exercises: [
      {
        exercise: {
          name: 'Squat Jump',
          trackingKey: 'squatjump',
          description: 'An explosive lower body exercise that builds power and athleticism.',
          targetMuscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
          instructions: [
            'Stand with feet shoulder-width apart',
            'Lower into squat position',
            'Explosively jump upward as high as possible',
            'Land softly with bent knees and immediately repeat'
          ],
          formTips: [
            'Use arms to help propel body upward',
            'Land softly with knees bent to absorb impact',
            'Maintain proper squat form throughout'
          ],
          trackingPoints: ['hip', 'knee', 'ankle', 'velocity'],
          repDetectionMethod: 'Vertical displacement with velocity tracking',
          formFeedbackRules: [
            {
              type: 'jumpHeight',
              message: 'Jump higher, more explosive',
              detection: 'Vertical displacement < 10 inches'
            },
            {
              type: 'landingForm',
              message: 'Land softer with bent knees',
              detection: 'Landing impact force > threshold'
            },
            {
              type: 'squatDepth',
              message: 'Lower deeper before jumping',
              detection: 'Pre-jump knee bend < 90 degrees'
            }
          ]
        },
        sets: 4,
        reps: 10,
        restBetweenSets: 90
      },
      {
        exercise: {
          name: 'Plyo Push-up',
          trackingKey: 'plyopushup',
          description: 'An explosive upper body exercise that builds power in the chest and arms.',
          targetMuscles: ['Chest', 'Shoulders', 'Triceps', 'Core'],
          instructions: [
            'Start in push-up position',
            'Lower chest to ground',
            'Push up explosively so hands leave ground',
            'Land softly and immediately begin next rep'
          ],
          formTips: [
            'Maintain rigid body alignment throughout',
            'Push with enough force for hands to leave ground',
            'Control the landing to protect wrists and shoulders'
          ],
          trackingPoints: ['shoulder', 'elbow', 'wrist', 'hip', 'velocity'],
          repDetectionMethod: 'Hand elevation detection with velocity tracking',
          formFeedbackRules: [
            {
              type: 'explosiveness',
              message: 'Push more explosively',
              detection: 'Hand elevation < 3 inches from ground'
            },
            {
              type: 'bodyAlignment',
              message: 'Keep body rigid throughout',
              detection: 'Hip position deviation > 3 inches from straight line'
            },
            {
              type: 'controlledLanding',
              message: 'Control your landing',
              detection: 'Landing impact force > threshold'
            }
          ]
        },
        sets: 3,
        reps: 8,
        restBetweenSets: 90
      }
    ]
  },
  {
    id: 'expert-3',
    name: 'Olympic Lifting Complex',
    type: 'expert',
    description: 'A technical workout focusing on Olympic lifting movements and technique.',
    duration: 50,
    exercises: [
      {
        exercise: {
          name: 'Dumbbell Clean',
          trackingKey: 'dbclean',
          description: 'A technical lift that develops power and coordination.',
          targetMuscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Shoulders', 'Traps', 'Core'],
          instructions: [
            'Stand with feet shoulder-width apart, dumbbells in front of thighs',
            'Hinge at hips, keeping back flat',
            'Explosively extend hips and shrug shoulders',
            'Pull dumbbells to shoulder height and rotate elbows under',
            'Catch in quarter squat position with dumbbells at shoulders'
          ],
          formTips: [
            'Drive through heels during extension',
            'Keep dumbbells close to body throughout movement',
            'Fully extend hips before pulling with arms'
          ],
          trackingPoints: ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'spine'],
          repDetectionMethod: 'Multi-phase movement pattern recognition',
          formFeedbackRules: [
            {
              type: 'hipExtension',
              message: 'Extend hips fully before pulling',
              detection: 'Hip extension < 170 degrees at power position'
            },
            {
              type: 'elbowSpeed',
              message: 'Rotate elbows faster under the weight',
              detection: 'Elbow rotation time > 0.5 seconds'
            },
            {
              type: 'barPath',
              message: 'Keep dumbbells close to body',
              detection: 'Dumbbell distance from body > 6 inches'
            }
          ]
        },
        sets: 4,
        reps: 6,
        restBetweenSets: 120
      },
      {
        exercise: {
          name: 'Dumbbell Snatch',
          trackingKey: 'dbsnatch',
          description: 'A full-body explosive movement that develops power and coordination.',
          targetMuscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Shoulders', 'Traps', 'Core'],
          instructions: [
            'Stand with feet shoulder-width apart, dumbbell between feet',
            'Hinge at hips with flat back to grasp dumbbell',
            'Explosively extend hips, knees, and ankles',
            'Pull dumbbell upward keeping it close to body',
            'Punch hand upward and catch dumbbell overhead with arm locked out'
          ],
          formTips: [
            'Keep dumbbell close to body during pull',
            'Fully extend hips before pulling with arm',
            'Lock out arm completely overhead'
          ],
          trackingPoints: ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'spine'],
          repDetectionMethod: 'Multi-phase movement pattern with overhead position detection',
          formFeedbackRules: [
            {
              type: 'trippleExtension',
              message: 'Extend hips, knees, and ankles fully',
              detection: 'Incomplete extension at power position'
            },
            {
              type: 'overheadPosition',
              message: 'Lock arm fully overhead',
              detection: 'Elbow angle < 170 degrees at catch position'
            },
            {
              type: 'timing',
              message: 'Extend first, then pull',
              detection: 'Early arm bend before hip extension'
            }
          ]
        },
        sets: 4,
        reps: 5,
        restBetweenSets: 120
      }
    ]
  },
  {
    id: 'expert-4',
    name: 'Advanced Calisthenics',
    type: 'expert',
    description: 'Master bodyweight movements with these challenging calisthenic exercises.',
    duration: 45,
    exercises: [
      {
        exercise: {
          name: 'Pistol Squat',
          trackingKey: 'pistolsquat',
          description: 'A challenging unilateral squat that tests strength, balance, and mobility.',
          targetMuscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core', 'Balance'],
          instructions: [
            'Stand on one leg with other leg extended forward',
            'Slowly lower into a single-leg squat',
            'Keep extended leg off ground throughout movement',
            'Return to standing using only working leg'
          ],
          formTips: [
            'Keep chest up throughout movement',
            'Extend arms forward for counterbalance',
            'Keep heel of working leg firmly planted'
          ],
          trackingPoints: ['hip', 'knee', 'ankle', 'spine'],
          repDetectionMethod: 'Single-leg depth tracking with balance monitoring',
          formFeedbackRules: [
            {
              type: 'depth',
              message: 'Lower all the way down',
              detection: 'Hip height > 4 inches above lowest possible position'
            },
            {
              type: 'balance',
              message: 'Maintain balance, don\'t wobble',
              detection: 'Center of mass horizontal displacement > 4 inches'
            },
            {
              type: 'heelLift',
              message: 'Keep heel planted',
              detection: 'Heel elevation > 1 inch from ground'
            }
          ]
        },
        sets: 3,
        reps: 5,
        restBetweenSets: 90
      },
      {
        exercise: {
          name: 'Pull-up',
          trackingKey: 'pullup',
          description: 'A fundamental upper body pulling exercise that builds back and arm strength.',
          targetMuscles: ['Lats', 'Biceps', 'Shoulders', 'Core'],
          instructions: [
            'Hang from bar with hands slightly wider than shoulders',
            'Pull body upward until chin clears the bar',
            'Lower with control to starting position'
          ],
          formTips: [
            'Engage core throughout movement',
            'Avoid swinging or kipping',
            'Fully extend arms at bottom position'
          ],
          trackingPoints: ['shoulder', 'elbow', 'wrist', 'hip'],
          repDetectionMethod: 'Chin-over-bar detection with body alignment monitoring',
          formFeedbackRules: [
            {
              type: 'chinHeight',
              message: 'Pull higher, get chin over bar',
              detection: 'Chin height < bar height at top position'
            },
            {
              type: 'bodySwing',
              message: 'Minimize swinging',
              detection: 'Horizontal displacement > 6 inches during movement'
            },
            {
              type: 'armExtension',
              message: 'Fully extend arms at bottom',
              detection: 'Elbow angle < 170 degrees at bottom position'
            }
          ]
        },
        sets: 3,
        reps: 8,
        restBetweenSets: 90
      }
    ]
  },
  {
    id: 'expert-5',
    name: 'Endurance Challenge',
    type: 'expert',
    description: 'Push your cardiovascular and muscular endurance to the limit with this high-intensity workout.',
    duration: 40,
    exercises: [
      {
        exercise: {
          name: 'Burpee',
          trackingKey: 'burpee',
          description: 'A full-body exercise that combines a squat, push-up, and jump.',
          targetMuscles: ['Quadriceps', 'Chest', 'Shoulders', 'Core', 'Cardiovascular system'],
          instructions: [
            'Start standing, then squat down and place hands on floor',
            'Jump feet back into plank position',
            'Perform a push-up',
            'Jump feet forward to hands',
            'Explosively jump up with arms overhead'
          ],
          formTips: [
            'Keep core engaged throughout movement',
            'Maintain proper push-up form',
            'Land softly from jump with bent knees'
          ],
          trackingPoints: ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle'],
          repDetectionMethod: 'Multi-phase movement pattern with vertical jump detection',
          formFeedbackRules: [
            {
              type: 'pushupForm',
              message: 'Full push-up with chest to ground',
              detection: 'Chest height > 6 inches from ground at bottom of push-up'
            },
            {
              type: 'jumpHeight',
              message: 'Jump higher at the top',
              detection: 'Vertical displacement < 6 inches on jump'
            },
            {
              type: 'tempo',
              message: 'Maintain consistent pace',
              detection: 'Rep duration variance > 20% from average'
            }
          ]
        },
        sets: 4,
        reps: 12,
        restBetweenSets: 60
      },
      {
        exercise: {
          name: 'Mountain Climber',
          trackingKey: 'mountainclimber',
          description: 'A dynamic core exercise that also elevates heart rate.',
          targetMuscles: ['Core', 'Hip flexors', 'Shoulders', 'Cardiovascular system'],
          instructions: [
            'Start in plank position with arms extended',
            'Drive right knee toward chest',
            'Quickly switch legs, driving left knee forward',
            'Continue alternating at a rapid pace'
          ],
          formTips: [
            'Keep hips level throughout movement',
            'Maintain rigid plank position',
            'Move legs as quickly as possible while maintaining form'
          ],
          trackingPoints: ['shoulder', 'hip', 'knee', 'ankle'],
          repDetectionMethod: 'Knee-to-chest proximity with cadence tracking',
          formFeedbackRules: [
            {
              type: 'hipHeight',
              message: 'Keep hips down, don\'t pike up',
              detection: 'Hip height > 4 inches above straight line from shoulder to ankle'
            },
            {
              type: 'kneeHeight',
              message: 'Drive knees higher toward chest',
              detection: 'Knee-to-chest distance > 8 inches at peak'
            },
            {
              type: 'cadence',
              message: 'Increase your pace',
              detection: 'Rep cadence < 1 rep per second'
            }
          ]
        },
        sets: 3,
        reps: 30,
        restBetweenSets: 45
      }
    ]
  }
]
