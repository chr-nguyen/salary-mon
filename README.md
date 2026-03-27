# Salary-mon

Salary-mon is a mobile-first time tracker that turns real work sessions into RPG-style character growth.

You log in, start a focus session, let the timer run while you work, and cash out that session into XP. That XP becomes spendable progression for your Salary-mon, so the app feels closer to a creature-raising game than a plain productivity dashboard.

## What the App Does

- Tracks active work sessions with a simple start/finish timer
- Awards XP based on the minutes worked
- Stores progress per user in Firebase
- Lets players spend saved XP on Salary-mon attributes
- Shows a daily work journal with minutes and XP earned
- Supports account creation with email/password
- Supports Google sign-in, with popup on desktop and redirect fallback on mobile

## Current Gameplay Loop

1. Create an account or sign in.
2. Start a work session when you begin focused work.
3. Finish the session when you are done.
4. Receive XP based on session length.
5. Spend that XP on attributes like `efficiency`, `marketing`, `energy`, `research`, and `talent`.
6. Build a Salary-mon that reflects your own play style over time.

Right now this is a personal progression loop. The long-term direction is social play, including comparing builds and eventually Salary-mon battles.

## What to Expect

- The app is designed first for mobile-sized screens but also works in a desktop browser.
- The first screen is a game-inspired login / account creation screen.
- After signing in, your Firebase user ID becomes your save slot.
- Your Salary-mon is created automatically the first time you log in.
- Session history and pet progression are persisted in Firestore.
- If Firebase Auth or Firestore is not configured correctly, the UI may load but login and saving will not work.

## Local Setup

All commands below should be run from the project root.

### 1. Install dependencies

```bash
yarn install
```

### 2. Create a Firebase project

In the Firebase console:

1. Create a new project.
2. Add a Web app to that project.
3. Copy the Firebase config values for the web app.
4. Enable Authentication.
5. Turn on the `Email/Password` provider.
6. Turn on the `Google` provider if you want Google sign-in.
7. Create a Firestore database.

For local development, make sure your Firebase Auth settings allow your local host if needed. In many setups, `localhost` is already supported, but check your Firebase authorized domains list if Google sign-in does not work.

### 3. Create a local `.env` file

Start from the template:

```bash
cp .env.example .env
```

Then replace the placeholder values in `.env` with your real Firebase config:

```env
PUBLIC_FIREBASE_API_KEY="your-api-key"
PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
PUBLIC_FIREBASE_APP_ID="your-app-id"
PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"
GOOGLE_API_KEY="optional-google-genai-key"
```

`GOOGLE_API_KEY` is only needed if you want to use the existing experimental AI endpoint in `src/pages/api/nano-banana-pro.ts`.

Do not commit `.env` to Git. This repo is configured to ignore it, while `.env.example` stays safe to commit with placeholder values only.

### 4. Start the app

```bash
yarn dev
```

Then open:

```text
http://localhost:4321
```

## Creating a New Account

When the app opens:

1. Choose `New Trainer` to create an email/password account.
2. Enter a display name, email, and password.
3. Submit the form.

Or:

1. Tap `Continue with Google`.
2. Complete the Google sign-in flow.

After sign-in, the app creates your first Salary-mon automatically if one does not already exist.

## Using the App

### Start a work session

Tap `Start Work` when you begin working.

### Finish a work session

Tap `Finish Session` when you are done. The app calculates the session length and awards XP.

### Spend XP

Use the upgrade panel to spend saved XP on different attributes. This is how players create unique Salary-mon builds instead of leveling every stat equally.

### Review history

Use the work journal panel to see recent daily totals for minutes worked, XP earned, and number of sessions.

## Firebase Data Model

The app currently stores data in two main Firestore collections:

- `salaryMons`: one document per user, keyed by Firebase Auth user ID
- `timeEntries`: one document per work session

## Scripts

| Command | What it does |
| :-- | :-- |
| `yarn dev` | Runs the local Astro development server |
| `yarn build` | Builds the project for production |
| `yarn preview` | Serves the built output locally |

## Troubleshooting

### Google sign-in is not working

Check these first:

- The Google provider is enabled in Firebase Auth
- Your Firebase web app config is correct in `.env`
- Your Firebase Auth authorized domains allow your local environment

### The login screen loads, but saving does not work

Check these:

- Firestore is created in the Firebase project
- Firestore rules allow the authenticated user to read and write the needed collections
- The `PUBLIC_FIREBASE_*` environment variables are correct

### The app builds locally but auth still fails

That usually means the frontend can compile, but Firebase is not configured correctly in the console or `.env`.
