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
  getDoc,
  getDocs,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  updateDoc,
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCgH1tPmkw2W8uT3qipFawqcT0h44uY-sw",
  authDomain: "friendflix-8ab05.firebaseapp.com",
  projectId: "friendflix-8ab05",
  storageBucket: "friendflix-8ab05.appspot.com",
  messagingSenderId: "112255193703",
  appId: "1:112255193703:web:43380b1005bbb3070b3ac2",
  measurementId: "G-NEXZTYPEVF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Save new user profile
async function saveUserProfile(user) {
  if (!user) return;
  const userDoc = doc(db, "users", user.uid);
  const docSnap = await getDoc(userDoc);

  if (!docSnap.exists()) {
    await setDoc(userDoc, {
      displayName: user.displayName || "Friend",
      photoURL: user.photoURL || "",
      bio: "Looking for movie buddies.",
      selectedMovies: [],
    });
  } else if (!docSnap.data().photoURL) {
    await setDoc(userDoc, { photoURL: user.photoURL || "" }, { merge: true });
  }
}

// Update user bio
async function updateUserBio(userId, bio) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { bio });
}

// Update user photo
async function updateUserPhoto(userId, photoURL) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { photoURL });
}

// Google sign in
async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  await saveUserProfile(user);
}

// Logout
async function logout() {
  await firebaseSignOut(auth);
}

// Save selected movies to Firestore
async function saveSelectedMovies(movies) {
  const user = auth.currentUser;
  if (!user) return;
  const userDoc = doc(db, "users", user.uid);
  await setDoc(userDoc, { selectedMovies: movies }, { merge: true });
}

const TMDB_GENRES = {
  28: { name: "Action", emoji: "" },
  12: { name: "Adventure", emoji: "" },
  16: { name: "Animation", emoji: "" },
  35: { name: "Comedy", emoji: "" },
  80: { name: "Crime", emoji: "" },
  99: { name: "Documentary", emoji: "" },
  18: { name: "Drama", emoji: "" },
  10751: { name: "Family", emoji: "" },
  14: { name: "Fantasy", emoji: "" },
  36: { name: "History", emoji: "" },
  27: { name: "Horror", emoji: "" },
  10402: { name: "Music", emoji: "" },
  9648: { name: "Mystery", emoji: "" },
  10749: { name: "Romance", emoji: "" },
  878: { name: "Sci-Fi", emoji: "" },
  53: { name: "Thriller", emoji: "" },
  10752: { name: "War", emoji: "" },
  37: { name: "Western", emoji: "" },
};

function calculateBadge(movies) {
  if (!movies || !movies.length) return { name: "Cinephile", emoji: "" };
  const genreCounts = {};
  movies.forEach((m) => {
    if (m && m.genre_ids) {
      m.genre_ids.forEach((id) => {
        genreCounts[id] = (genreCounts[id] || 0) + 1;
      });
    }
  });

  if (Object.keys(genreCounts).length === 0) return { name: "Cinephile", emoji: "" };

  const topGenreId = Object.keys(genreCounts).reduce((a, b) =>
    genreCounts[a] > genreCounts[b] ? a : b
  );
  return TMDB_GENRES[topGenreId] || { name: "Cinephile", emoji: "" };
}

// Safe matching function
async function findFriendMatches(userId, selectedMovies) {
  if (!selectedMovies || !selectedMovies.length) return [];

  try {
    const currentUserDoc = await getDoc(doc(db, "users", userId));
    const currentUserData = currentUserDoc.exists() ? currentUserDoc.data() : {};
    const blockedByMe = currentUserData.blockedUsers || [];

    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const matches = [];

    snapshot.forEach((docSnap) => {
      if (docSnap.id === userId) return;

      const data = docSnap.data();
      const blockedByThem = data.blockedUsers || [];
      if (blockedByMe.includes(docSnap.id) || blockedByThem.includes(userId)) {
        return;
      }

      if (!Array.isArray(data.selectedMovies) || data.selectedMovies.length === 0) {
        return;
      }

      // Safe comparison handling IDs as numbers or strings
      const commonMovies = data.selectedMovies.filter((movie) => {
        const theirId = String(movie?.id || movie);
        return selectedMovies.some((m) => String(m?.id || m) === theirId);
      });

      if (commonMovies.length >= 1) {
        const matchPercentage = Math.min(
          100,
          Math.round((commonMovies.length / selectedMovies.length) * 100)
        );
        const userBadge = calculateBadge(data.selectedMovies);

        matches.push({
          userId: docSnap.id,
          uid: docSnap.id, // Ensures Chat.jsx never gets undefined ID
          displayName: data.displayName || "Cinephile",
          photoURL: data.photoURL || "",
          bio: data.bio || "Looking for movie buddies.",
          commonMovies,
          matchPercentage,
          badge: userBadge,
        });
      }
    });

    return matches;
  } catch (error) {
    console.error("Error in findFriendMatches:", error);
    return [];
  }
}

// Restored getChatId helper
function getChatId(userA, userB) {
  return [String(userA), String(userB)].sort().join("_");
}

// Send a chat message
async function sendMessage(chatId, senderId, text, type = "text", eventDetails = null, senderPhoto = "") {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const msgData = {
    senderId,
    senderPhoto,
    text,
    type,
    timestamp: new Date(),
  };
  if (eventDetails) msgData.eventDetails = eventDetails;
  await addDoc(messagesRef, msgData);

  const chatRef = doc(db, "chats", chatId);
  await setDoc(chatRef, {
    lastMessage: type === "event" ? "Scheduled a movie session" : text,
    lastMessageTime: new Date(),
    lastSenderId: senderId,
  }, { merge: true });
}

// Send a group message
async function sendGroupMessage(chatId, senderId, senderName, text, type = "text", eventDetails = null, senderPhoto = "") {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const msgData = {
    senderId,
    senderName,
    senderPhoto,
    text,
    type,
    timestamp: new Date(),
  };
  if (eventDetails) msgData.eventDetails = eventDetails;
  await addDoc(messagesRef, msgData);

  const chatRef = doc(db, "chats", chatId);
  await setDoc(chatRef, {
    lastMessage: type === "event" ? `${senderName} scheduled a movie session` : `${senderName}: ${text}`,
    lastMessageTime: new Date(),
    lastSenderId: senderId,
  }, { merge: true });
}

// Listen to chat messages
function listenToChatMessages(chatId, callback) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
}

// Listen to group messages
function listenToGroupMessages(chatId, callback) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
}

// Create or get chat document
async function createOrGetChat(currentUserId, otherUserId) {
  const chatId = getChatId(currentUserId, otherUserId);
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);

  if (!chatDoc.exists()) {
    await setDoc(chatRef, {
      messages: [],
      participants: [currentUserId, otherUserId],
    });
  }

  return chatId;
}

// Block user
async function blockUser(currentUserId, targetUserId) {
  const userDoc = doc(db, "users", currentUserId);
  const docSnap = await getDoc(userDoc);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const blocked = data.blockedUsers || [];
    if (!blocked.includes(targetUserId)) {
      await setDoc(userDoc, { blockedUsers: [...blocked, targetUserId] }, { merge: true });
    }
  }
}

// Report user
async function reportUser(currentUserId, targetUserId, reason) {
  const reportsRef = collection(db, "reports");
  await addDoc(reportsRef, {
    reporterId: currentUserId,
    reportedId: targetUserId,
    reason: reason,
    timestamp: new Date(),
  });
}

// Create custom group
async function createCustomGroup(groupName, participantIds, creatorId) {
  const chatsRef = collection(db, "chats");
  const newGroup = await addDoc(chatsRef, {
    name: groupName,
    participants: participantIds,
    creatorId: creatorId,
    isCustomGroup: true,
    createdAt: new Date(),
  });
  return newGroup.id;
}

// Listen to user groups
function listenToUserGroups(userId, callback) {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId),
    where("isCustomGroup", "==", true)
  );
  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(groups);
  });
}

// Listen to all user chats
function listenToAllUserChats(userId, callback) {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("participants", "array-contains", userId));
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(chats);
  });
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
  blockUser,
  reportUser,
  sendGroupMessage,
  listenToGroupMessages,
  createCustomGroup,
  listenToUserGroups,
  updateUserBio,
  updateUserPhoto,
  listenToAllUserChats,
};