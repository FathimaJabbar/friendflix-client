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
        setBio(data.bio || "I'm looking for movie buddies!");
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
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <h2>Your Profile</h2>
        <div style={{ width: "80px" }}></div>
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
            style={{ position: "absolute", bottom: "0", right: "0", padding: "5px 10px", borderRadius: "50%" }}
            onClick={() => setIsEditingPhoto(!isEditingPhoto)}
          >
            📸
          </button>
        </div>
        <div className="profile-info">
          <h3>{user.displayName}</h3>
          
          {isEditingPhoto && (
            <div className="glass-card" style={{ padding: "20px", marginTop: "15px", borderRadius: "16px" }}>
              <p style={{ margin: "0 0 10px 0", fontSize: "0.9rem", fontWeight: "600" }}>Upload from your device</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 1024 * 1024) {
                        alert("File is too large! Please pick an image under 1MB.");
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
                    padding: "10px", 
                    borderRadius: "8px", 
                    color: "white",
                    width: "100%" 
                  }}
                />
                <button className="btn-primary" onClick={handleSavePhoto} disabled={saving} style={{ width: "100%" }}>
                  {saving ? "Uploading..." : "Save Profile Picture"}
                </button>
              </div>

              <p style={{ margin: "0 0 10px 0", fontSize: "0.9rem", fontWeight: "600" }}>Or pick a preset:</p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
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
                    style={{ width: "45px", height: "45px", cursor: "pointer", borderRadius: "50%", border: photoURL === url ? "2px solid #00c6ff" : "1px solid rgba(255,255,255,0.1)" }}
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
                  placeholder="Write a short bio..."
                />
                <button className="btn-primary save-bio-btn" onClick={handleSaveBio} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <div className="bio-display">
                <p>"{bio}"</p>
                <button className="btn-secondary edit-bio-btn" onClick={() => setIsEditingBio(true)}>
                  ✎ Edit Bio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="movies-heading">Favorite Movies ({selectedMovies.length})</h3>
      {selectedMovies.length === 0 ? (
        <p className="no-movies">No movies selected yet. Go to Swipe Mode!</p>
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
