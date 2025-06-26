# Prisma Database Setup and Seeding

This directory contains the Prisma schema and seed script for the application.

## Schema

The `schema.prisma` file defines the database models for the application, including:

- User authentication models (User, Account, Session, VerificationToken, Authenticator)
- Custom models for the swimming pool booking system (Pool, Slot, Booking, Family, Trainer, Feedback, FitnessTest)

## Seed Script

The `seed.ts` file contains a script to populate the database with initial data for testing and development purposes.

### What the Seed Script Creates

- Users with different roles (ADMIN, SUPERADMIN, MANAGER, USER, TRAINER, CARETAKER)
- Trainer profiles linked to users with TRAINER role
- Swimming pools with location and image information
- Slots for the next 7 days with different times and trainers
- Family groups with members
- Bookings for slots with different statuses
- Feedback for trainers
- Fitness test results

## Usage

### Running the Seed Script

To run the seed script and populate the database with initial data:

```bash
npm run seed
```

### Resetting the Database

To reset the database and re-run the seed script:

```bash
npm run db:reset
```

This will:
1. Reset the database (drop all tables and recreate them)
2. Run the seed script to populate the database with initial data

### Modifying the Seed Data

If you need to modify the seed data, edit the `seed.ts` file. You can add more users, pools, slots, etc. as needed.

## Database Connection

The database connection is configured using the `DATABASE_URL` environment variable in the `.env` file.
