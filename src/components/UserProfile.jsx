import React, { useState, useEffect } from "react";
import { db, updateUserBio, updateUserPhoto } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./UserProfile.css";

export default function UserProfile({ user, selectedMovies = [], onBack }) {
  const [bio, setBio] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBio(data.bio || "Looking for movie buddies.");
        setPhotoURL(data.photoURL || user.photoURL || "");
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveBio = async () => {
    setSaving(true);
    await updateUserBio(user.uid, bio);
    setSaving(false);
    setIsEditingBio(false);
  };

  const handleSavePhoto = async () => {
    setSaving(true);
    await updateUserPhoto(user.uid, photoURL);
    setSaving(false);
    setIsEditingPhoto(false);
  };

  return (
    <div className="profile-container glass-panel page-wrapper">
      <div className="profile-header">
        <button className="nav-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back</span>
        </button>
        <h2>Your Profile</h2>
        <div style={{ width: "68px" }}></div>
      </div>

      <div className="profile-top">
        <div style={{ position: "relative" }}>
          <img 
            src={photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} 
            alt="Avatar" 
            className="profile-avatar"
          />
          <button 
            className="btn-secondary" 
            style={{ position: "absolute", bottom: "0", right: "0", padding: "6px 8px", borderRadius: "50%", background: "#181820" }}
            onClick={() => setIsEditingPhoto(!isEditingPhoto)}
            title="Edit Photo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        </div>
        <div className="profile-info">
          <h3>{user.displayName}</h3>
          
          {isEditingPhoto && (
            <div className="glass-card" style={{ padding: "18px", marginTop: "14px", borderRadius: "16px" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", fontWeight: "600" }}>Upload Image</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 1024 * 1024) {
                        alert("File is too large! Please choose an image under 1MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPhotoURL(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ 
                    background: "rgba(255,255,255,0.05)", 
                    padding: "8px", 
                    borderRadius: "8px", 
                    color: "white",
                    width: "100%",
                    fontSize: "0.85rem"
                  }}
                />
                <button className="btn-primary" onClick={handleSavePhoto} disabled={saving} style={{ width: "100%" }}>
                  {saving ? "Saving..." : "Save Picture"}
                </button>
              </div>

              <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", fontWeight: "600" }}>Presets</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {[
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                  "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
                  "https://cdn-icons-png.flaticon.com/512/219/219983.png",
                  "https://cdn-icons-png.flaticon.com/512/219/219969.png",
                  "https://cdn-icons-png.flaticon.com/512/219/219988.png",
                ].map((url, i) => (
                  <img 
                    key={i}
                    src={url} 
                    alt="preset" 
                    style={{ 
                      width: "42px", 
                      height: "42px", 
                      cursor: "pointer", 
                      borderRadius: "50%", 
                      border: photoURL === url ? "2px solid var(--accent-primary, #e50914)" : "1px solid rgba(255,255,255,0.12)" 
                    }}
                    onClick={() => { setPhotoURL(url); }}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="bio-section">
            {isEditingBio ? (
              <div className="bio-edit">
                <textarea 
                  className="bio-textarea"
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={150}
                  placeholder="Tell people about your film taste..."
                />
                <button className="btn-primary save-bio-btn" onClick={handleSaveBio} disabled={saving}>
                  {saving ? "Saving..." : "Save Bio"}
                </button>
              </div>
            ) : (
              <div className="bio-display">
                <p>"{bio}"</p>
                <button className="btn-secondary edit-bio-btn" onClick={() => setIsEditingBio(true)}>
                  Edit Bio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="movies-heading">Favorite Movies ({selectedMovies.length})</h3>
      {selectedMovies.length === 0 ? (
        <p className="no-movies" style={{ color: "var(--text-secondary)" }}>No movies added yet.</p>
      ) : (
        <div className="profile-movie-grid">
          {selectedMovies.map((movie) => (
            <div key={movie.id} className="profile-movie-card">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                title={movie.title}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}