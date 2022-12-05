import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth"


const firebaseConfig = {
  apiKey: "AIzaSyCmLU5rIGlLeGLj7A7jgLcuTUZNOMQtfh4",
  authDomain: "mgtu-frontend.firebaseapp.com",
  projectId: "mgtu-frontend",
  storageBucket: "mgtu-frontend.appspot.com",
  messagingSenderId: "673579989891",
  appId: "1:673579989891:web:7a14147b0a48cae02e54b6",
  measurementId: "G-Q6EDYKJY8P"
};

const app = initializeApp(firebaseConfig);

const auth = await getAuth();
signInAnonymously(auth)

export default getFirestore(app);