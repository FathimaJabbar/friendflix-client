// src/components/Login.jsx
import React from "react";
import { auth, provider, signInWithPopup } from "../firebase";

export default function Login() {
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged in App.js will update user state
    } catch (error) {
      alert("Failed to sign in: " + error.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  );
}
