import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,          // <-- Use getDoc for single document fetch
  getDocs,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCgH1tPmkw2W8uT3qipFawqcT0h44uY-sw",
  authDomain: "friendflix-8ab05.firebaseapp.com",
  projectId: "friendflix-8ab05",
  storageBucket: "friendflix-8ab05.appspot.com",
  messagingSenderId: "112255193703",
  appId: "1:112255193703:web:43380b1005bbb3070b3ac2",
  measurementId: "G-NEXZTYPEVF",
};

// 🔌 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 🧠 Save new user profile
async function saveUserProfile(user) {
  if (!user) return;
  const userDoc = doc(db, "users", user.uid);
  const docSnap = await getDoc(userDoc);  // <-- Corrected here

  if (!docSnap.exists()) {
    await setDoc(userDoc, {
      displayName: user.displayName || "Friend",
      selectedMovies: [],
    });
  }
}

// 🔐 Google sign in
async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  await saveUserProfile(user);
}

// 🔓 Logout
async function logout() {
  await firebaseSignOut(auth);
}

// 🎬 Save selected movies to Firestore
async function saveSelectedMovies(movies) {
  const user = auth.currentUser;
  if (!user) return;
  const userDoc = doc(db, "users", user.uid);
  await setDoc(userDoc, { selectedMovies: movies }, { merge: true });
}

// 🤝 Forced friend matching logic
async function findFriendMatches(userId, selectedMovies) {
  if (!selectedMovies.length) return [];

  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  const matches = [];

  snapshot.forEach((docSnap) => {
    if (docSnap.id === userId) return; // skip current user

    const data = docSnap.data();
    const commonMovies = data.selectedMovies?.filter((movie) =>
      selectedMovies.some((m) => m.id === movie.id)
    );

    if (commonMovies && commonMovies.length >= 1) {
      matches.push({
        userId: docSnap.id,
        displayName: data.displayName || "Friend",
        commonMovies,
      });
    }
  });

  // Add yourself as a match to everyone (only if not the current user)
  if (userId !== "jPvC75Bb8tZ4OJHPPXiu2tYJaVJ2") {
    matches.push({
      userId: "jPvC75Bb8tZ4OJHPPXiu2tYJaVJ2",
      displayName: "Fathima Jabbar",
      commonMovies: [], // or list your movies here if you want
    });
  }

  return matches;
}

// 💬 Chat helper: generate consistent chat ID
function getChatId(userA, userB) {
  return [userA, userB].sort().join("_");
}

// 💬 Send a chat message
async function sendMessage(chatId, senderId, text) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId,
    text,
    timestamp: new Date(),
  });
}

// 📡 Listen for chat messages in realtime
function listenToChatMessages(chatId, callback) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
}

// 🔄 Create or get chat document
async function createOrGetChat(currentUserId, otherUserId) {
  const chatId = getChatId(currentUserId, otherUserId);
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef); // <-- Fixed here to getDoc for document

  if (!chatDoc.exists()) {
    await setDoc(chatRef, {
      messages: [],
      participants: [currentUserId, otherUserId],
    });
  }

  return chatId;
}

export {
  auth,
  db,
  provider,
  signInWithGoogle,
  logout,
  saveSelectedMovies,
  findFriendMatches,
  getChatId,
  listenToChatMessages,
  sendMessage,
  createOrGetChat,
  onAuthStateChanged,
};
