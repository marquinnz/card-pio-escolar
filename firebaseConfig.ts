import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyA-vsYDuyQHuGpjeTEXOXAfrCKkAf1F0yk",

  authDomain: "cardapio-escolar-eb5ea.firebaseapp.com",

  projectId: "cardapio-escolar-eb5ea",

  storageBucket: "cardapio-escolar-eb5ea.firebasestorage.app",

  messagingSenderId: "39525532715",

  appId: "1:39525532715:web:02f4ea3d6600060201166e"

};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);