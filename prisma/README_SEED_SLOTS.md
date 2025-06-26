# Slot Seeding Script

This script allows you to generate slots for a specific month and year in the database.

## Prerequisites

Before running this script, make sure:

1. The main seed script (`seed.ts`) has been run at least once to create the necessary pools, trainers, and caretakers.
2. The database connection is properly configured in your environment.

## Usage

You can run the script with or without parameters:

### With Parameters

```bash
npx ts-node prisma/seedSlots.ts [month] [year]
```

Example:
```bash
npx ts-node prisma/seedSlots.ts 7 2025
```
This will create slots for July 2025.

### Without Parameters

```bash
npx ts-node prisma/seedSlots.ts
```

When run without parameters, the script will automatically generate slots for the next month.

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
- `olympic-01-07-2025-0900` (Olympic Pool, July 1st 2025, 9:00 AM)
- `community-15-07-2025-1400` (Community Pool, July 15th 2025, 2:00 PM)
- `leisure-31-07-2025-1800` (Leisure Pool, July 31st 2025, 6:00 PM)

## Notes

- The script skips creating slots for dates in the past.
- If no trainers are found in the database, slots will be created without trainers.
- The script assigns trainers and caretakers based on availability in the database.
