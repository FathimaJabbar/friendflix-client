// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCgH1tPmkw2W8uT3qipFawqcT0h44uY-sw",
  authDomain: "friendflix-8ab05.firebaseapp.com",
  projectId: "friendflix-8ab05",
  storageBucket: "friendflix-8ab05.firebasestorage.app",
  messagingSenderId: "112255193703",
  appId: "1:112255193703:web:43380b1005bbb3070b3ac2",
  measurementId: "G-NEXZTYPEVF",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

async function saveUserProfile(user) {
  if (!user) return;
  const userDoc = doc(db, "users", user.uid);
  const docSnap = await getDoc(userDoc);

  if (!docSnap.exists()) {
    await setDoc(userDoc, {
      displayName: user.displayName || "Friend",
      selectedMovies: [],
    });
  }
}

async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  await saveUserProfile(user);
}

async function logout() {
  await signOut(auth);
}

async function saveSelectedMovies(movies) {
  const user = auth.currentUser;
  if (!user) return;
  const userDoc = doc(db, "users", user.uid);
  await setDoc(userDoc, { selectedMovies: movies }, { merge: true });
}

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

    // Lower threshold to 1 for better testing, change back to 3 later
    if (commonMovies && commonMovies.length >= 1) {
      matches.push({
        userId: docSnap.id,
        displayName: data.displayName || "Friend",
        commonMovies,
      });
    }
  });

  return matches;
}

export {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  logout,
  saveSelectedMovies,
  findFriendMatches,
  db,
  provider,
};
