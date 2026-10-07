# When3Meet

When3Meet helps a team find a weekly meeting time that works for everyone. Create a meeting, share its link, and let signed-in participants select their available hours. The app highlights times that work for all respondents and saves each person's most recent weekly schedule to their account for reuse.

## Local development

```sh
npm install
npm run dev
```

## Firebase setup

The app uses Firebase Authentication with email/password and the Realtime Database. Its Firebase project configuration is in `src/services/firebase.ts`; database access is isolated in `src/services/`.

In the Firebase console, enable the Email/Password sign-in provider and create a Realtime Database for the configured project. `database.rules.json` restricts user profile and saved-schedule access to the owning account and requires authentication for meeting data. Deploy the existing Hosting and database rules with:

```sh
npx firebase-tools deploy --only hosting,database
```

The Firebase project is selected in `.firebaserc`. The app uses Firebase Hosting's existing `firebase.json` configuration; no Functions or app hosting setup is needed.

## Checks

```sh
npm run lint
npm run build
```
