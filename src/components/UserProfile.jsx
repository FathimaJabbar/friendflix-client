import React from "react";

export default function UserProfile({ user }) {
  if (!user) return <p>No user logged in.</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Hello, {user.displayName || "Friend"}!</h2>
      <p>Email: {user.email}</p>
      <p>User ID: {user.uid}</p>
      {/* Add more profile details here if you want */}
    </div>
  );
}
