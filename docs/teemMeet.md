Create a React single-page web app for finding weekly team meeting times. It should work like when2meet in "days of the week" mode.  The app should allow users to create a new meeting and specify their availability for each day of the week. An event creator should be able to share a link to the meeting with others, who can then indicate their availability as well. The app should display a grid showing the availability of all participants, and highlight the times when everyone is available.

The app should be built using React and TypeScript, and it should use Firebase for backend services. The app should be hosted on Firebase, using sign-in with Google for authentication, and storing data in the Firebase Realtime Database. The app should also include a simple UI for creating and managing meetings, as well as a grid view for displaying availability. 

When calling `firebase init`, do not enable functions, Github Actions, or app hosting.

Use the following Firebase configuration data:

```javascript
{
  apiKey: "AIzaSyDp9QVoEc3rX33r9VQf4i6ph3mfKygIkto",
  authDomain: "quick-react-fb.firebaseapp.com",
  databaseURL: "https://quick-react-fb.firebaseio.com",
  projectId: "quick-react-fb",
  storageBucket: "quick-react-fb.firebasestorage.app",
  messagingSenderId: "260148191080",
  appId: "1:260148191080:web:8ce6138a8b4accca5840dd",
  measurementId: "G-8Y9JRFH63Q"
};

```
