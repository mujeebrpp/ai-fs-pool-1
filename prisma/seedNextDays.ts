import { PrismaClient } from '@prisma/client';
import { format, addDays } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Seed slots for the next specified number of days
 * @param days Number of days to seed slots for
 */
async function seedNextDays(days: number) {
  console.log(`Starting seeding slots for the next ${days} days...`);

  // Get all pools from the database
  const pools = await prisma.pool.findMany();
  if (pools.length === 0) {
    throw new Error('No pools found in the database. Please run the main seed file first.');
  }

  // Get all trainers from the database
  const trainers = await prisma.trainer.findMany({
    include: {
      user: true,
    },
  });
  if (trainers.length === 0) {
    console.warn('No trainers found in the database. Slots will be created without trainers.');
  }

  // Get a caretaker from the database
  const caretaker = await prisma.user.findFirst({
    where: {
      role: 'CARETAKER',
    },
  });

  // Create slots for each day
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = addDays(today, i);
    
    // Create slots for each pool
    for (const pool of pools) {
      // Create short pool name for ID (first word of pool name)
      const shortPoolName = pool.name.split(' ')[0].toLowerCase();
      
      // Format date as DD-MM-YYYY
      const formattedDate = format(date, 'dd-MM-yyyy');
      
      // Morning slot (9:00 - 10:00)
      const morningStart = new Date(date);
      morningStart.setHours(9, 0, 0, 0);
      const morningEnd = new Date(date);
      morningEnd.setHours(10, 0, 0, 0);
      
      // Create unique ID: shortPoolName-DD-MM-YYYY-startTime
      const morningId = `${shortPoolName}-${formattedDate}-0900`;
      
      // Check if slot already exists
      const existingMorningSlot = await prisma.slot.findUnique({
        where: { id: morningId },
      });
      
      if (!existingMorningSlot) {
        await prisma.slot.create({
          data: {
            id: morningId,
            poolId: pool.id,
            date: date,
            startTime: morningStart,
            endTime: morningEnd,
            capacity: 10,
            trainerId: trainers.length > 0 ? trainers[0].id : null,
            caretakerId: caretaker?.id || null,
          },
        });
        console.log(`Created morning slot for ${pool.name} on ${formattedDate}`);
      }
      
      // Afternoon slot (14:00 - 15:00)
      const afternoonStart = new Date(date);
      afternoonStart.setHours(14, 0, 0, 0);
      const afternoonEnd = new Date(date);
      afternoonEnd.setHours(15, 0, 0, 0);
      
      // Create unique ID: shortPoolName-DD-MM-YYYY-startTime
      const afternoonId = `${shortPoolName}-${formattedDate}-1400`;
      
      // Check if slot already exists
      const existingAfternoonSlot = await prisma.slot.findUnique({
        where: { id: afternoonId },
      });
      
      if (!existingAfternoonSlot) {
        await prisma.slot.create({
          data: {
            id: afternoonId,
            poolId: pool.id,
            date: date,
            startTime: afternoonStart,
            endTime: afternoonEnd,
            capacity: 8,
            trainerId: trainers.length > 1 ? trainers[1].id : (trainers.length > 0 ? trainers[0].id : null),
          },
        });
        console.log(`Created afternoon slot for ${pool.name} on ${formattedDate}`);
      }
      
      // Evening slot (18:00 - 19:00)
      const eveningStart = new Date(date);
      eveningStart.setHours(18, 0, 0, 0);
      const eveningEnd = new Date(date);
      eveningEnd.setHours(19, 0, 0, 0);
      
      // Create unique ID: shortPoolName-DD-MM-YYYY-startTime
      const eveningId = `${shortPoolName}-${formattedDate}-1800`;
      
      // Check if slot already exists
      const existingEveningSlot = await prisma.slot.findUnique({
        where: { id: eveningId },
      });
      
      if (!existingEveningSlot) {
        await prisma.slot.create({
          data: {
            id: eveningId,
            poolId: pool.id,
            date: date,
            startTime: eveningStart,
            endTime: eveningEnd,
            capacity: 12,
          },
        });
        console.log(`Created evening slot for ${pool.name} on ${formattedDate}`);
      }
    }
  }

  console.log(`Created slots for the next ${days} days`);
}

/**
 * Main function to run the seed
 */
async function main() {
  try {
    // Get number of days from command line arguments or default to 7
    const args = process.argv.slice(2);
    const days = args.length > 0 ? parseInt(args[0], 10) : 7;
    
    await seedNextDays(days);
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
main();
