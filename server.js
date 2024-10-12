// Install required packages using: npm install express socket.io firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
const express = require('express');
const socketIo = require('socket.io');
const path = require('path');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWgopUFoAufk9FtR47Ig78LnHtUUue7-U",
  authDomain: "learnwithme-96332.firebaseapp.com",
  projectId: "learnwithme-96332",
  storageBucket: "learnwithme-96332.appspot.com",
  messagingSenderId: "118368378369",
  appId: "1:118368378369:web:b2f144abc8b31ba7cf2a00",
  measurementId: "G-BJL3N8P92C"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const analytics = getAnalytics(firebaseApp);

const app = express();
const server = require('http').createServer(app);
const io = socketIo(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit', async (req, res) => {
  const { username, answer } = req.body;

  try {
    // Store answer in Firebase Firestore
    await addDoc(collection(db, 'answers'), { username, answer });
    // Notify all clients of the new answer
    io.emit('new_answer', { username, answer });
    res.redirect('/');
  } catch (err) {
    console.error('Failed to insert answer', err);
    res.status(500).send('Error storing answer');
  }
});

io.on('connection', async (socket) => {
  try {
    // Send all previous answers to the newly connected client
    const snapshot = await getDocs(collection(db, 'answers'));
    snapshot.forEach((doc) => {
      socket.emit('new_answer', { username: doc.data().username, answer: doc.data().answer });
    });
  } catch (err) {
    console.error('Failed to retrieve answers', err);
  }
});

module.exports = app;
