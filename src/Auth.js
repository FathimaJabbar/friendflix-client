// src/Auth.js
import { auth, provider, signInWithPopup } from "./firebase";

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Signed in user:", result.user);
  } catch (error) {
    console.error("Failed to sign in:", error);
  }
}
