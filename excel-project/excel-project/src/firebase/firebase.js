import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD9bVvaxWf9-KIMg64BAS0piMekdxRc4_c",
    authDomain: "excel-project-6d4f7.firebaseapp.com",
    projectId: "excel-project-6d4f7",
    storageBucket: "excel-project-6d4f7.firebasestorage.app",
    messagingSenderId: "704962618240",
    appId: "1:704962618240:web:32f3c9a8a59a783d4cd765"
};

const app = initializeApp(firebaseConfig);

export default getFirestore(app);