# Micky App

A heavily animated Expo mobile app with Tasks, Projects, and Private sections.

## Quick Start (Development)
```bash
npm install
npx expo start
```
Scan the QR code with Expo Go on Android.

## Build APK via EAS (Recommended)

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo account (free at expo.dev)
```bash
eas login
```

### 3. Build the APK
```bash
npm install
eas build --platform android --profile preview
```
EAS builds on their servers and gives you a download link for the APK. No Android Studio needed.

## GitHub Actions (Automated Builds)

1. Push this project to a GitHub repository
2. Go to **Settings → Secrets and variables → Actions**
3. Add secret: `EXPO_TOKEN`
   - Get it from: https://expo.dev/accounts/YOUR_USERNAME/settings/access-tokens
4. Push to `main` branch → APK builds automatically
5. Download from **Actions → Build APK → micky-apk** artifact

## App Features

### Tasks Tab
- Microsoft To-Do style task management
- Weekly calendar strip — tap any day to see tasks
- Priority levels (High/Medium/Low) with color coding
- Repeating tasks (daily/weekly/monthly/custom)
- Deadlines with start & end dates
- Categories and tags
- Calendar date picker + time picker

### Projects Tab
- Timeline-based project tracking
- Animated progress cards
- Color-coded projects
- Mark project as complete

### Private Tab (passcode: 2452)
- **Diary** — personal journal entries
- **Money Tracker** — Arabic category tracking:
  - دولاب / محفظة جلد / جراب موبايل / محفظة الكترونيه / حساب بنكى / اخرى
  - Total balance + change delta
  - Table view of all entries

## Tech Stack
- Expo 54 + Expo Router
- React Native Reanimated (animations)
- AsyncStorage (local data, no server needed)
- Inter font family
- Gold (#FFC000) + Black dark theme
