import firebase from "firebase";
//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics"; //FOR NEVER FIREBASE version you can use this

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDS5DahE5UF0HObXwPwEYtHVsQ4ROjk36Y",
    authDomain: "retrolove.firebaseapp.com",
    projectId: "retrolove",
    storageBucket: "retrolove.appspot.com",
    messagingSenderId: "25500097656",
    appId: "1:25500097656:web:03a3029c9d0440b24a218d",
    measurementId: "G-2GDV603LT4",
  };

  const firebaseApp = firebase.initializeApp(firebaseConfig);
  //const analytics = firebase.getAnalytics(firebaseApp);
  const database = firebaseApp.firestore();

  export default database;