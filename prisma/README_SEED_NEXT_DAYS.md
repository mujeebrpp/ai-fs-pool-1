# Next Days Slot Seeding Script

This script allows you to generate slots for the next specified number of days in the database.

## Prerequisites

Before running this script, make sure:

1. The main seed script (`seed.ts`) has been run at least once to create the necessary pools, trainers, and caretakers.
2. The database connection is properly configured in your environment.

## Usage

You can run the script with or without parameters:

### With Parameters

```bash
npx ts-node prisma/seedNextDays.ts [days]
```

Example:
```bash
npx ts-node prisma/seedNextDays.ts 14
```
This will create slots for the next 14 days.

### Without Parameters

```bash
npx ts-node prisma/seedNextDays.ts
```

When run without parameters, the script will automatically generate slots for the next 7 days.

### Using npm script

```bash
npm run seed:next-days [days]
```

## Generated Slots

The script creates three slots per day for each pool in the database:
- Morning slot: 9:00 - 10:00 AM
- Afternoon slot: 2:00 - 3:00 PM
- Evening slot: 6:00 - 7:00 PM

## Slot IDs

Each slot is assigned a unique ID with the following format:
```
[shortPoolName]-[DD-MM-YYYY]-[startTime]
```

For example:
- `olympic-25-06-2025-0900` (Olympic Pool, June 25th 2025, 9:00 AM)
- `community-26-06-2025-1400` (Community Pool, June 26th 2025, 2:00 PM)
- `leisure-27-06-2025-1800` (Leisure Pool, June 27th 2025, 6:00 PM)

## Notes

- The script checks if slots already exist before creating them, so it's safe to run multiple times.
- If no trainers are found in the database, slots will be created without trainers.
- The script assigns trainers and caretakers based on availability in the database.
