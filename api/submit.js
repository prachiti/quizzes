import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWgopUFoAufk9FtR47Ig78LnHtUUue7-U",
  authDomain: "learnwithme-96332.firebaseapp.com",
  projectId: "learnwithme-96332",
  storageBucket: "learnwithme-96332.appspot.com",
  messagingSenderId: "118368378369",
  appId: "1:118368378369:web:b2f144abc8b31ba7cf2a00",
  measurementId: "G-BJL3N8P92C"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export default async (req, res) => {
  if (req.method === 'POST') {
    const { username, answer } = req.body;
    try {
      // Store answer in Firebase Firestore
      await addDoc(collection(db, 'answers'), { username, answer });
      res.status(200).json({ message: 'Answer submitted successfully' });
    } catch (err) {
      console.error('Failed to insert answer', err);
      res.status(500).json({ error: 'Error storing answer' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
