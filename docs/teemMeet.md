Create a React single-page web app for finding weekly team meeting times. It should work like when2meet in "days of the week" mode.  The app should allow users to create a new meeting and specify their availability for each day of the week. An event creator should be able to share a link to the meeting with others, who can then indicate their availability as well. The app should display a grid showing the availability of all participants, and highlight the times when everyone is available.

The app should be built using React and TypeScript, and it should use Firebase for backend services. The app should be hosted on Firebase, using sign-in with email/password for authentication, and storing data in the Firebase Realtime Database. The app should also include a simple UI for creating and managing meetings, as well as a grid view for displaying availability. 

Here are the improvements needed: Make when2meet mobile friendly; Save previous schedule for reuse (associated with email saved in database)

When calling `firebase init`, do not enable functions, Github Actions, or app hosting.

Use the following Firebase configuration data:

```javascript
{
  apiKey: "AIzaSyBENrKu3l9oviZQmmvAd5HQWqGyFu1s_WY",
  authDomain: "when3meet-544231.firebaseapp.com",
  databaseURL: "https://when3meet-544231-default-rtdb.firebaseio.com",
  projectId: "when3meet-544231",
  storageBucket: "when3meet-544231.firebasestorage.app",
  messagingSenderId: "704328051008",
  appId: "1:704328051008:web:74febed9e22ca9ae9372a5"
};

```
