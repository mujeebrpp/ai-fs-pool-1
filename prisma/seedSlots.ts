import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Seed slots for a specific month and year
 * @param month Month (1-12)
 * @param year Year (e.g., 2025)
 */
async function seedSlots(month: number, year: number) {
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }

  console.log(`Starting seeding slots for ${month}/${year}...`);

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

  // Calculate the number of days in the month
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Create slots for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    
    // Skip creating slots for past dates
    const today = new Date();
    if (date < today) {
      continue;
    }

    // Create slots for each pool
    for (const pool of pools) {
      // Create short pool name for ID (first word of pool name)
      const shortPoolName = pool.name.split(' ')[0].toLowerCase();
      
      // Morning slot (9:00 - 10:00)
      const morningStart = new Date(date);
      morningStart.setHours(9, 0, 0, 0);
      const morningEnd = new Date(date);
      morningEnd.setHours(10, 0, 0, 0);
      
      // Format date as DD-MM-YYYY
      const formattedDate = format(date, 'dd-MM-yyyy');
      
      // Create unique ID: shortPoolName-DD-MM-YYYY-startTime
      const morningId = `${shortPoolName}-${formattedDate}-0900`;
      
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
      
      // Afternoon slot (14:00 - 15:00)
      const afternoonStart = new Date(date);
      afternoonStart.setHours(14, 0, 0, 0);
      const afternoonEnd = new Date(date);
      afternoonEnd.setHours(15, 0, 0, 0);
      
      // Create unique ID: shortPoolName-DD-MM-YYYY-startTime
      const afternoonId = `${shortPoolName}-${formattedDate}-1400`;
      
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
      
      // Evening slot (18:00 - 19:00)
      const eveningStart = new Date(date);
      eveningStart.setHours(18, 0, 0, 0);
      const eveningEnd = new Date(date);
      eveningEnd.setHours(19, 0, 0, 0);
      
      // Create unique ID: shortPoolName-DD-MM-YYYY-startTime
      const eveningId = `${shortPoolName}-${formattedDate}-1800`;
      
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
    }
  }

  console.log(`Created slots for ${month}/${year}`);
}

/**
 * Main function to run the seed
 */
async function main() {
  try {
    // Get month and year from command line arguments
    const args = process.argv.slice(2);
    let month: number;
    let year: number;
    
    if (args.length >= 2) {
      month = parseInt(args[0], 10);
      year = parseInt(args[1], 10);
    } else {
      // Default to next month if no arguments provided
      const today = new Date();
      month = today.getMonth() + 2; // +2 because getMonth() is 0-indexed and we want next month
      year = today.getFullYear();
      
      // Handle December -> January transition
      if (month > 12) {
        month = 1;
        year++;
      }
    }
    
    await seedSlots(month, year);
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
