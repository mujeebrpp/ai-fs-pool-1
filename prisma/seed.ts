import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Clean up existing data
  await prisma.feedback.deleteMany();
  await prisma.fitnessTest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.family.deleteMany();
  await prisma.authenticator.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.verificationToken.deleteMany();

  console.log('Cleaned up existing data');

  // Create users with different roles
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      role: 'SUPERADMIN',
      emailVerified: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      name: 'Manager User',
      email: 'manager@example.com',
      role: 'MANAGER',
      emailVerified: new Date(),
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
      emailVerified: new Date(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'USER',
      emailVerified: new Date(),
    },
  });

  const trainerUser1 = await prisma.user.create({
    data: {
      name: 'Michael Phelps',
      email: 'trainer1@example.com',
      role: 'TRAINER',
      emailVerified: new Date(),
    },
  });

  const trainerUser2 = await prisma.user.create({
    data: {
      name: 'Katie Ledecky',
      email: 'trainer2@example.com',
      role: 'TRAINER',
      emailVerified: new Date(),
    },
  });

  const caretakerUser = await prisma.user.create({
    data: {
      name: 'Care Taker',
      email: 'caretaker@example.com',
      role: 'CARETAKER',
      emailVerified: new Date(),
    },
  });

  console.log('Created users');

  // Create trainer profiles
  const trainer1 = await prisma.trainer.create({
    data: {
      userId: trainerUser1.id,
      expertise: 'Freestyle, Butterfly',
      bio: 'Olympic gold medalist with 20+ years of experience in competitive swimming.',
    },
  });

  const trainer2 = await prisma.trainer.create({
    data: {
      userId: trainerUser2.id,
      expertise: 'Backstroke, Breaststroke',
      bio: 'Former national champion specializing in teaching proper technique and form.',
    },
  });

  console.log('Created trainer profiles');

  // Create pools
  const pool1 = await prisma.pool.create({
    data: {
      name: 'Olympic Pool',
      location: 'Sports Complex, Downtown',
      images: [
        'https://example.com/pools/olympic1.jpg',
        'https://example.com/pools/olympic2.jpg',
      ],
    },
  });

  const pool2 = await prisma.pool.create({
    data: {
      name: 'Community Pool',
      location: 'Community Center, Westside',
      images: [
        'https://example.com/pools/community1.jpg',
        'https://example.com/pools/community2.jpg',
      ],
    },
  });

  const pool3 = await prisma.pool.create({
    data: {
      name: 'Leisure Pool',
      location: 'Resort Area, Eastside',
      images: [
        'https://example.com/pools/leisure1.jpg',
        'https://example.com/pools/leisure2.jpg',
      ],
    },
  });

  console.log('Created pools');

  // Create slots for the next 7 days
  const today = new Date();
  const slots = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Morning slot for pool1 with trainer1
    const morningStart = new Date(date);
    morningStart.setHours(9, 0, 0, 0);
    const morningEnd = new Date(date);
    morningEnd.setHours(10, 0, 0, 0);
    
    slots.push(
      await prisma.slot.create({
        data: {
          poolId: pool1.id,
          date: date,
          startTime: morningStart,
          endTime: morningEnd,
          capacity: 10,
          trainerId: trainer1.id,
          caretakerId: caretakerUser.id,
        },
      })
    );
    
    // Afternoon slot for pool2 with trainer2
    const afternoonStart = new Date(date);
    afternoonStart.setHours(14, 0, 0, 0);
    const afternoonEnd = new Date(date);
    afternoonEnd.setHours(15, 0, 0, 0);
    
    slots.push(
      await prisma.slot.create({
        data: {
          poolId: pool2.id,
          date: date,
          startTime: afternoonStart,
          endTime: afternoonEnd,
          capacity: 8,
          trainerId: trainer2.id,
        },
      })
    );
    
    // Evening slot for pool3 without trainer
    const eveningStart = new Date(date);
    eveningStart.setHours(18, 0, 0, 0);
    const eveningEnd = new Date(date);
    eveningEnd.setHours(19, 0, 0, 0);
    
    slots.push(
      await prisma.slot.create({
        data: {
          poolId: pool3.id,
          date: date,
          startTime: eveningStart,
          endTime: eveningEnd,
          capacity: 12,
        },
      })
    );
  }

  console.log('Created slots');

  // Create families
  const family1 = await prisma.family.create({
    data: {
      name: 'Doe Family',
      ownerId: user1.id,
      members: {
        connect: [{ id: user2.id }],
      },
    },
  });

  console.log('Created families');

  // Create bookings
  await prisma.booking.create({
    data: {
      userId: user1.id,
      slotId: slots[0].id,
      trainerId: trainer1.id,
      status: 'CONFIRMED',
    },
  });

  await prisma.booking.create({
    data: {
      userId: user2.id,
      slotId: slots[1].id,
      trainerId: trainer2.id,
      status: 'CONFIRMED',
      familyId: family1.id,
    },
  });

  await prisma.booking.create({
    data: {
      userId: user1.id,
      slotId: slots[2].id,
      status: 'COMPLETED',
    },
  });

  console.log('Created bookings');

  // Create feedback
  await prisma.feedback.create({
    data: {
      trainerId: trainer1.id,
      userId: user1.id,
      rating: 5,
      comment: 'Excellent trainer, very helpful and knowledgeable.',
    },
  });

  await prisma.feedback.create({
    data: {
      trainerId: trainer2.id,
      userId: user2.id,
      rating: 4,
      comment: 'Great session, learned a lot about proper technique.',
    },
  });

  console.log('Created feedback');

  // Create fitness tests
  await prisma.fitnessTest.create({
    data: {
      userId: user1.id,
      resultUrl: 'https://example.com/fitness-tests/user1-test1.mp4',
      score: 85,
      notes: 'Good form, needs to work on breathing technique.',
    },
  });

  await prisma.fitnessTest.create({
    data: {
      userId: user2.id,
      resultUrl: 'https://example.com/fitness-tests/user2-test1.mp4',
      score: 92,
      notes: 'Excellent performance, minor improvements needed in turns.',
    },
  });

  console.log('Created fitness tests');

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
