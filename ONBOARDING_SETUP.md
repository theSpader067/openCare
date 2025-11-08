# Onboarding Feature Setup

## Changes Made

### 1. Database Schema Updates (`prisma/schema.prisma`)
Added the following fields to the User model:
- `specialty` (String, optional): Medical specialty
- `hospital` (String, optional): Hospital/Healthcare institution
- `year` (String, optional): Training year or specialist status
- `onboardingCompleted` (Boolean, default: false): Tracks if user has completed onboarding

**Required Action**: Run the following command to apply the schema changes:
```bash
npx prisma migrate dev --name add_onboarding_fields
```

Or if you just want to generate the Prisma client:
```bash
npx prisma generate
```

### 2. Enhanced Login Page (`src/app/login/page.tsx`)
- Made the OpenCare logo and company name more prominent
- Larger badge (h-16 w-16 instead of h-12 w-12)
- Bigger "OpenCare" heading (text-4xl font-bold)
- Updated redirect logic to check if user has completed onboarding

### 3. Enhanced Signup Page (`src/app/signup/page.tsx`)
- Made the OpenCare logo and company name more prominent
- Added visual hierarchy with the logo on the left
- Larger badge and heading to match login page

### 4. Created Onboarding Page (`src/app/onboarding/page.tsx`)
A new page that appears after email verification where users fill in:
- **Specialty**: 24 medical specialty options (Cardiologie, Chirurgie générale, etc.)
- **Hospital**: 20 hospital options (APHP hospitals, CHU centers, etc.)
- **Year**: Training/experience level (1ère-5ème année, Spécialiste)

### 5. Created Onboarding API Route (`src/app/api/auth/onboarding/route.ts`)
POST endpoint that:
- Validates user session
- Requires all three fields (specialty, hospital, year)
- Updates the user record with onboarding information
- Sets `onboardingCompleted` to true

### 6. Updated NextAuth Configuration (`src/app/api/auth/[...nextauth]/route.ts`)
- Added session callback to include `onboardingCompleted` in the session
- User can now access their onboarding status from `session.user.onboardingCompleted`

## User Flow

### Signup and Email Verification
1. User signs up with name, email, and password
2. Verification email is sent
3. User clicks link to verify email
4. User is redirected to login page

### Login
1. User logs in with email and password
2. System checks if `onboardingCompleted` is true
   - If **false**: Redirect to `/onboarding`
   - If **true**: Redirect to `/dashboard`

### Onboarding
1. User fills in specialty, hospital, and year
2. User clicks "Continuer vers le tableau de bord"
3. Data is saved to database
4. User is redirected to `/dashboard`

## File Structure
```
src/
├── app/
│   ├── login/
│   │   └── page.tsx (enhanced)
│   ├── signup/
│   │   └── page.tsx (enhanced)
│   ├── onboarding/
│   │   └── page.tsx (new)
│   └── api/
│       └── auth/
│           ├── [...nextauth]/
│           │   └── route.ts (updated)
│           └── onboarding/
│               └── route.ts (new)
└── lib/
    └── prisma.ts (used in API routes)

prisma/
└── schema.prisma (updated)
```

## Environment Variables
No new environment variables needed. The existing NextAuth configuration is used.

## Testing Checklist
- [ ] Run `npx prisma migrate dev --name add_onboarding_fields`
- [ ] Test signup flow
- [ ] Test email verification
- [ ] Test onboarding page appearance
- [ ] Test filling in all three fields
- [ ] Test redirect to dashboard after onboarding
- [ ] Test login redirects to onboarding if not completed
- [ ] Test login redirects to dashboard if already completed
- [ ] Verify user data is saved in the database

## Notes
- Type assertions with `as any` are used to handle Prisma types that haven't been regenerated yet
- Once you run `npx prisma generate`, the TypeScript errors will resolve naturally
- The onboarding form has validation: all fields are required before submission
- Users can modify their information later in settings (future feature)
