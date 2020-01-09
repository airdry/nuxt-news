import firebase from "firebase/app";
import "firebase/firestore";

if (!firebase.apps.length) {
  var config = {
    apiKey: "AIzaSyC0P_b-AbAP_9ZaFzCgZ8aRF1WE4CRagAQ",
    authDomain: "nuxt-news-app-d11f1.firebaseapp.com",
    databaseURL: "https://nuxt-news-app-d11f1.firebaseio.com",
    projectId: "nuxt-news-app-d11f1",
    storageBucket: "nuxt-news-app-d11f1.appspot.com",
    messagingSenderId: "316027059380",
    appId: "1:316027059380:web:b55f16e5c30586d8cd2be1"
  };
  firebase.initializeApp(config);
}

const db = firebase.firestore();

export default db;
