You are the lead software engineer for a new gym management platform.

Your goal is to build a production-oriented local project that I can run, test and validate entirely on my machine.

IMPORTANT:
I will deploy this project myself later to Firebase / Google Cloud.

You must NOT deploy anything.
You must NOT connect to my production Google Cloud account.
You must NOT create production resources.
You must work only locally.

==================================================

1. # GENERAL WORKING RULES

- Work ONLY on my current local branch.
- DO NOT create branches.
- DO NOT switch branches.
- DO NOT push anything to GitHub.
- DO NOT commit unless I explicitly ask you to.
- DO NOT modify files outside this repository.
- DO NOT run firebase deploy.
- DO NOT run gcloud deployment commands.
- DO NOT access or modify production infrastructure.
- DO NOT require production credentials.
- DO NOT place secrets in source control.

Before making architectural decisions:

1. Inspect the repository.
2. Understand the existing structure.
3. Verify the latest stable Angular version.
4. Verify current recommended Firebase / AngularFire practices.
5. Prefer official documentation and stable APIs.

Engineering principles:

- Keep the implementation simple and maintainable.
- Avoid overengineering.
- Use strict TypeScript.
- Minimize unnecessary dependencies.
- Prefer reusable components.
- Avoid duplicated logic.
- Keep components reasonably small.
- Separate business logic from presentation.
- Use good naming.
- Avoid dead code.
- Avoid TODOs when the functionality can reasonably be completed now.

After each major milestone:

- run build
- run lint if configured
- run tests
- inspect warnings
- inspect errors
- fix issues before continuing

When you believe the work is complete:

- perform a self-review as if reviewing another engineer's PR
- fix issues you find
- run all validations again

Do not stop at the first implementation if it has obvious weaknesses.

================================================== 2. PROJECT GOAL
==================================================

Build the official website and management platform for a gym.

The application has 3 main areas:

1. Public website
2. Student portal
3. Admin portal

Main features:

- Public gym website
- Membership plans
- Social network links
- Authentication
- Student accounts
- Admin management
- Booking / scheduling
- Training plans
- Student fitness profile
- Measurements and progress tracking
- Nutrition plans
- Recipe library
- Per-user feature permissions

================================================== 3. TECHNOLOGY STACK
==================================================

Frontend:

- Latest stable Angular
- Standalone components
- Angular Router
- Angular Signals where appropriate
- RxJS where streams are appropriate
- Reactive Forms
- Strict TypeScript
- SCSS
- Angular CDK where useful
- Lightweight icon library

Avoid NgRx unless there is a real need.

Avoid introducing a heavy UI framework unless there is a strong reason.

Backend / Google ecosystem:

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Cloud Functions for Firebase
- Firebase Security Rules
- Firebase Emulator Suite

Production target:

- Firebase Hosting / Google Cloud

Development target:

- 100% local using Firebase Emulator Suite

I will do the production deployment myself.

================================================== 4. LOCAL-FIRST DEVELOPMENT
==================================================

Everything must work locally.

Configure Firebase Emulator Suite for at least:

- Authentication
- Firestore
- Functions
- Storage

Use Emulator UI if useful.

Create local configuration files as needed:

- firebase.json
- firestore.rules
- firestore.indexes.json
- storage.rules
- Firebase configuration templates
- environment files/examples

Do not include production credentials.

Use placeholder/local values.

The expected local workflow should be something similar to:

npm install

npm run firebase:emulators

npm start

or an equivalent documented workflow.

If useful, create:

npm run dev

that makes local startup easier.

Document all commands clearly.

================================================== 5. ENVIRONMENT CONFIGURATION
==================================================

Create environment configuration for:

- local development
- production

Local development must connect to Firebase Emulators.

Production config must be structured so I can later provide:

- apiKey
- authDomain
- projectId
- storageBucket
- messagingSenderId
- appId

Do not hardcode real credentials.

Make switching between emulator mode and production mode straightforward.

Use a clean configuration abstraction.

================================================== 6. VISUAL IDENTITY
==================================================

The gym visual style should be based on:

- almost black background
- charcoal / dark gray surfaces
- white text
- strong magenta / fuchsia accent
- modern fitness aesthetic

Suggested design direction:

Background:
#080B10
#0D0D12

Accent:
bright magenta / fuchsia

Text:
white / light gray

The UI should feel:

- modern
- energetic
- clean
- professional
- premium
- sporty

Avoid:

- generic Bootstrap admin-panel look
- excessive neon effects
- visual clutter
- overly complex animations

Create design tokens / CSS variables for:

- primary color
- accent
- background
- surface
- text
- muted text
- success
- warning
- error
- spacing
- radius
- shadows

The branding should be easy to change later.

================================================== 7. RESPONSIVE DESIGN
==================================================

The platform must be mobile-first.

Prioritize student experience on:

- 375px
- 390px
- 430px

Also support:

- tablet
- desktop
- large desktop

Student portal should prioritize mobile.

Admin can prioritize desktop slightly more, while remaining usable on mobile.

================================================== 8. PUBLIC WEBSITE
==================================================

Create a public-facing website.

Pages / sections:

HOME

Hero section with:

- gym name wich is "Disfrutando del proceso fit"
- strong motivational headline
- CTA: "Conocé nuestros planes"
- CTA: "Ingresar"
- CTA: "Agendate"

Sections:

- benefits
- training methodology
- gym features
- membership plans
- testimonials placeholder
- contact
- location placeholder
- social networks

PLANS

Create reusable membership plan cards.

Plans must eventually come from Firestore.

Plan fields:

- name
- description
- price
- frequency
- features
- highlighted
- active
- displayOrder

SOCIAL NETWORKS

Support configurable links for:

- Instagram
- Facebook
- WhatsApp

CONTACT

Include:

- WhatsApp CTA
- Instagram
- address placeholder
- opening hours placeholder

LOGIN

Students and admins use the same login page.

================================================== 9. AUTHENTICATION
==================================================

Use Firebase Authentication.

Primary roles:

ADMIN
STUDENT

Users should NOT have public self-registration initially.

Admin creates student accounts.

The admin flow must NOT create Firebase Auth users directly from Angular with privileged permissions.

Use a trusted backend flow through Firebase Cloud Functions and Firebase Admin SDK.

Suggested flow:

Angular Admin UI
→ Callable Cloud Function
→ Firebase Admin SDK
→ Firebase Auth user created
→ Firestore profile created
→ role / claims configured

Prefer a secure onboarding approach.

Possible options:

- temporary password
- invite flow
- password reset / set-password flow

Choose the best maintainable option and document it.

================================================== 10. AUTHORIZATION
==================================================

Do NOT rely only on Angular guards.

Use multiple layers.

Frontend:

- auth guard
- role guard
- feature-access guard where needed
- conditional navigation

Backend:

- Firestore Security Rules
- Storage Security Rules
- Cloud Function authorization
- role verification

Use Firebase custom claims or another secure Firebase-compatible approach for:

- ADMIN
- STUDENT

Sensitive backend operations must verify authorization server-side.

Students must NEVER be able to access another student's private data.

================================================== 11. USER MODEL
==================================================

Each student should have a profile.

Possible fields:

- id
- firstName
- lastName
- email
- phone
- birthDate
- active
- joinDate
- notes
- role
- createdAt
- updatedAt

Make non-essential fields optional.

Admin should be able to:

- create student
- edit student
- enable / disable student
- search student
- view profile
- assign permissions
- assign training plan
- assign nutrition plan
- manage measurements

================================================== 12. FEATURE ACCESS
==================================================

Some features must be enabled per user.

At minimum:

- nutritionEnabled
- recipesEnabled

Potential future permissions:

- progressPhotosEnabled
- customTrainingEnabled
- advancedMetricsEnabled

When a feature is disabled:

- hide navigation
- block routes
- enforce access at backend/security-rules level where relevant

Do not rely on hidden UI alone.

================================================== 13. STUDENT PORTAL
==================================================

Create authenticated student portal navigation.

Sections:

- Inicio
- Agenda
- Mi progreso
- Mi ficha
- Entrenamiento
- Nutrición
- Recetario
- Mi cuenta

Nutrición and Recetario should only appear when enabled for that student.

The student dashboard should show useful cards such as:

- next booking
- current training plan
- current weight
- change since previous measurement
- progress summary
- nutrition access status
- upcoming gym sessions

================================================== 14. BOOKING / AGENDA
==================================================

Students must be able to book gym sessions.

Admin defines:

- days
- dates
- time slots
- capacity
- enabled / disabled state

Example:

Monday
08:00
capacity: 10

Monday
09:00
capacity: 8

Students can:

- see available days
- see available time slots
- see available capacity
- create booking
- cancel booking
- see upcoming bookings
- see previous bookings

Prevent:

- duplicate booking
- booking full slot
- booking disabled slot
- booking past slot
- invalid booking requests

================================================== 15. BOOKING SECURITY / CONCURRENCY
==================================================

Booking capacity is a critical business rule.

Do NOT trust Angular for capacity validation.

Prevent this race condition:

A slot has 1 available place.

Student A books.
Student B books at the same time.

Only one must succeed.

Implement booking using:

- callable Cloud Function
- Firestore Transaction

Suggested functions:

createBooking()
cancelBooking()

The backend must validate:

- user is authenticated
- user has STUDENT role
- slot exists
- slot is enabled
- slot is not in the past
- capacity is not exceeded
- user does not already have a booking
- booking state is valid

Never trust client-provided capacity counters.

Cancellation must update capacity consistently.

================================================== 16. ADMIN BOOKING MANAGEMENT
==================================================

Admin should be able to:

- create slots
- edit slots
- enable / disable slots
- define capacity
- see bookings
- inspect students booked
- inspect remaining capacity

Admin dashboard should show:

- today's bookings
- upcoming bookings
- active students
- available slots
- full slots

================================================== 17. STUDENT FITNESS PROFILE
==================================================

Each student should have a fitness profile.

Measurements must be historical.

Never overwrite old measurements.

Possible measurement fields:

- date
- weight
- height
- bodyFatPercentage
- muscleMass
- waist
- chest
- hip
- arm
- thigh
- notes

Not all fields are mandatory.

Admin can add new measurements over time.

Student can see historical progression.

================================================== 18. PROGRESS TRACKING
==================================================

Student should see charts for:

- weight over time
- body fat over time
- muscle mass over time

Use a reusable chart solution.

Show clear comparisons such as:

Current weight
Previous weight
Difference

Example:

Current:
96.4 kg

Previous:
98.1 kg

Change:
-1.7 kg

Preserve historical data.

================================================== 19. TRAINING PLANS / FICHA
==================================================

Admin can assign training plans to students.

A training plan contains:

- name
- description
- startDate
- optional endDate
- active state

Training plan contains workout days.

Example:

Día A
Pecho / Tríceps

Exercises:

- exercise name
- sets
- repetitions
- rest
- notes
- optional target weight

Día B
Piernas

etc.

Student should normally have one active training plan but should retain history.

Design the data model so reusable templates could be supported later.

================================================== 20. NUTRITION
==================================================

Nutrition is optional per user.

Use:

nutritionEnabled

If false:

- student cannot access nutrition section
- navigation should hide it
- backend/security rules should enforce access

If true:

Admin can assign a nutrition plan.

Nutrition plan may contain:

- title
- description
- objective
- startDate
- optional endDate
- notes

Meals may include:

- breakfast
- mid-morning
- lunch
- afternoon snack
- dinner
- optional additional meals

Each meal can contain:

- name
- description
- foods
- quantities
- notes

Design this flexibly.

================================================== 21. RECIPES
==================================================

Recipe access is optional per student.

Use:

recipesEnabled

Recipe library fields:

- title
- image
- description
- ingredients
- instructions
- preparationTime
- calories optional
- protein optional
- carbohydrates optional
- fat optional
- category
- tags
- active/archive state

Example categories:

- breakfast
- lunch
- snack
- dinner
- high protein
- low calorie

Student can:

- browse
- search
- filter
- open recipe detail

Admin can:

- create
- edit
- archive/delete

Use Firebase Storage for recipe images.

================================================== 22. FIRESTORE DATA MODEL
==================================================

Before implementation, design Firestore based on actual access patterns.

Do NOT blindly model it like SQL.

Possible structure:

users/{userId}

users/{userId}/measurements/{measurementId}

users/{userId}/trainingPlans/{planId}

users/{userId}/nutritionPlans/{planId}

scheduleSlots/{slotId}

scheduleSlots/{slotId}/bookings/{bookingId}

recipes/{recipeId}

membershipPlans/{planId}

gymSettings/{documentId}

You may improve this structure.

Think carefully about:

- query patterns
- security rules
- indexes
- duplication tradeoffs
- read costs
- scalability
- maintainability

Document the reasoning.

================================================== 23. FIRESTORE RULES
==================================================

Create real Firestore Security Rules.

Public user should only access public information.

Examples:

Public can read:

- active membership plans
- public gym configuration

Student can read:

- own profile
- own measurements
- own training data
- own nutrition data if allowed
- public recipes if feature access permits
- schedule availability
- own bookings

Student cannot read:

- another student's measurements
- another student's nutrition
- another student's private profile
- another student's private training plan

Admin can manage gym data as required.

Sensitive operations such as:

- role assignment
- admin creation
- student creation
- privilege changes

must not be allowed through ordinary client writes.

================================================== 24. FIREBASE STORAGE
==================================================

Use Firebase Storage for:

- recipe images
- future progress photos
- optional training resources

Create Storage Security Rules.

Recipe images may be public if appropriate.

Private student files/photos must only be readable by:

- the student
- authorized admins

Never make private student content public.

================================================== 25. CLOUD FUNCTIONS
==================================================

Use Cloud Functions only where server-side logic adds value.

Examples:

createStudent()
updateUserRole()
createBooking()
cancelBooking()

Potential future functions:

sendInvitation()
sendBookingReminder()

Cloud Functions must:

- use TypeScript
- validate auth
- validate role
- validate input
- return structured errors
- avoid giant function files

Organize functions by domain.

Example:

functions/src/

auth/
create-student.ts
update-user-role.ts

booking/
create-booking.ts
cancel-booking.ts

shared/
auth.ts
validation.ts
errors.ts

index.ts

Improve this structure if useful.

================================================== 26. ADMIN PORTAL
==================================================

Create /admin with its own layout.

Admin navigation:

- Dashboard
- Students
- Schedule
- Bookings
- Training Plans
- Nutrition
- Recipes
- Membership Plans
- Settings

Dashboard summary cards:

- active students
- today's bookings
- upcoming sessions
- available slots
- full slots
- users with nutrition enabled
- users with recipe access

================================================== 27. MEMBERSHIP PLANS
==================================================

Do not confuse:

- Membership Plan
- Training Plan
- Nutrition Plan

Membership plan fields:

- name
- description
- price
- frequency
- features
- highlighted
- active
- displayOrder

Admin can manage plans.

Public website displays active plans.

================================================== 28. GYM SETTINGS
==================================================

Create configurable gym settings.

Possible fields:

- gymName
- logo
- phone
- WhatsApp
- email
- Instagram
- Facebook
- TikTok
- address
- openingHours
- heroTitle
- heroSubtitle

These should eventually come from Firestore where appropriate.

================================================== 29. ANGULAR ARCHITECTURE
==================================================

Prefer domain-based feature organization.

Suggested structure:

src/app/

core/
auth/
firebase/
guards/
services/

shared/
components/
models/
pipes/
utilities/

features/

public/
home/
plans/
contact/

auth/
login/

student/
dashboard/
booking/
progress/
training/
nutrition/
recipes/
account/

admin/
dashboard/
students/
schedule/
bookings/
training/
nutrition/
recipes/
plans/
settings/

Improve this structure if there is a strong reason.

Use lazy-loaded routes.

Avoid giant services.

================================================== 30. STATE MANAGEMENT
==================================================

Prefer Angular Signals for:

- component state
- UI state
- small feature state

Use RxJS for:

- async streams
- Firebase observables
- event streams
- combining async sources

Do not add NgRx unless there is a demonstrated need.

================================================== 31. REUSABLE UI
==================================================

Create reusable components where useful.

Examples:

- Button
- Card
- PageHeader
- Modal/Dialog
- FormField
- EmptyState
- LoadingState
- ErrorState
- Badge
- UserAvatar
- StatCard
- ConfirmationDialog

Do not build a giant custom component framework.

================================================== 32. UX STATES
==================================================

Relevant screens must handle:

- loading
- success
- error
- empty
- disabled
- unauthorized

Avoid blank pages.

Use user-friendly messages.

================================================== 33. ACCESSIBILITY
==================================================

Follow reasonable accessibility practices:

- semantic HTML
- keyboard navigation
- proper form labels
- focus states
- adequate contrast
- button accessibility
- aria attributes where needed

================================================== 34. TESTING
==================================================

Write meaningful tests.

Prioritize:

- authentication
- authorization
- role guards
- feature guards
- booking logic
- booking capacity
- duplicate booking prevention
- form validation
- important data services
- Cloud Functions
- Firebase Security Rules where practical

Avoid meaningless tests such as only checking that a component exists.

================================================== 35. FIREBASE EMULATOR TESTS
==================================================

Use emulator-backed tests where useful.

Critical scenarios:

Student A cannot read Student B data.

Student cannot promote themselves to admin.

Unauthorized user cannot create students.

Admin can manage expected resources.

Booking capacity cannot be exceeded.

Duplicate bookings are rejected.

Disabled slots cannot be booked.

Past slots cannot be booked.

Private storage files are protected.

================================================== 36. LOCAL SEED DATA
==================================================

Create development-only seed data.

Example users:

Admin:
admin@gym.local

Students:
student1@gym.local
student2@gym.local

Create sample:

- membership plans
- schedule slots
- bookings
- measurements
- training plan
- nutrition plan
- recipes
- gym settings

Seed scripts must ONLY target emulators.

Do not allow seed scripts to accidentally write to production.

Fail safely if emulator configuration is missing.

Do not include real passwords in committed source files.

If demo passwords are needed for local testing, document them clearly as local-only development credentials.

================================================== 37. README
==================================================

Create a high-quality README.

Include:

- project overview
- architecture
- technology stack
- prerequisites
- installation
- Angular setup
- Firebase Emulator setup
- environment setup
- local startup
- local seed
- test commands
- build commands
- project structure
- security model
- deployment preparation

Clearly separate:

LOCAL DEVELOPMENT

and

PRODUCTION DEPLOYMENT

================================================== 38. PRODUCTION DEPLOYMENT DOCUMENTATION
==================================================

Do NOT deploy.

Only document how I can later deploy it myself.

Explain:

1. Create Firebase project
2. Enable Firebase Authentication
3. Enable Firestore
4. Enable Storage
5. Configure Cloud Functions
6. Set environment values
7. Select Firebase project
8. Configure Firestore indexes
9. Deploy Firestore rules
10. Deploy Storage rules
11. Deploy Cloud Functions
12. Build Angular production
13. Configure Firebase Hosting
14. Deploy Hosting

These are instructions only.

Never execute them.

================================================== 39. SECURITY PRINCIPLES
==================================================

Security is important.

Never trust the frontend for:

- roles
- permissions
- booking capacity
- admin operations
- ownership checks

Validate sensitive operations server-side.

Apply principle of least privilege.

Review:

- Firestore Rules
- Storage Rules
- custom claims
- Cloud Function checks

before considering the implementation complete.

================================================== 40. EXECUTION STRATEGY
==================================================

Do not implement everything randomly.

Follow milestones.

MILESTONE 1

Foundation:

- inspect repository
- latest Angular setup
- project architecture
- Firebase integration
- emulator setup
- environments
- theme/design system
- public layout
- authentication foundation
- admin/student routing foundation

MILESTONE 2

Public site:

- home
- plans
- social networks
- contact
- responsive design

MILESTONE 3

Authentication / users:

- login
- roles
- custom claims
- student creation
- account management
- guards
- Firestore rules

MILESTONE 4

Admin / student foundations:

- admin dashboard
- student dashboard
- student management
- profile

MILESTONE 5

Schedule / booking:

- slots
- admin schedule management
- booking function
- cancellation
- Firestore transactions
- booking UI
- capacity validation

MILESTONE 6

Progress:

- measurements
- measurement history
- charts
- comparisons

MILESTONE 7

Training:

- training plans
- training days
- exercises
- assignment
- student view

MILESTONE 8

Nutrition:

- feature permission
- nutrition plans
- meals
- assignment
- student view

MILESTONE 9

Recipes:

- feature permission
- recipe CRUD
- Firebase Storage images
- search/filter
- student view

MILESTONE 10

Quality:

- tests
- security review
- accessibility
- responsive polish
- error states
- documentation
- code cleanup

================================================== 41. SELF-REVIEW
==================================================

After completing the implementation, review the entire project as if it were another developer's PR.

Look for:

- duplicated code
- poor TypeScript typing
- any usage
- Angular anti-patterns
- security holes
- weak Firestore Rules
- weak Storage Rules
- missing authorization checks
- booking race conditions
- missing error states
- missing loading states
- poor responsive behavior
- poor accessibility
- unnecessary complexity
- Firestore query issues
- missing indexes
- inconsistent naming
- dead code
- build warnings
- test gaps

Fix the problems you find.

Then run:

- build
- lint
- unit tests
- integration tests
- emulator-based tests where configured

Do not finish while avoidable errors remain.

================================================== 42. FINAL OUTPUT
==================================================

When you finish, do NOT deploy anything.

Provide me with a concise summary containing:

1. What was implemented
2. Angular architecture
3. Firebase architecture
4. Firestore data model
5. Authentication model
6. Authorization model
7. Security Rules approach
8. Cloud Functions created
9. Booking concurrency strategy
10. Commands to run locally
11. Demo users / local test setup
12. Test commands
13. Remaining improvements
14. Instructions for my future manual Firebase deployment

Remember:

- local branch only
- no commits unless explicitly requested
- no push
- no Firebase deploy
- no Google Cloud deploy
- no production credentials
- local development only
