import React, { useState, useEffect } from "react";
import { listenToUserGroups } from "../firebase";
import "./UserGroups.css";

const UserGroups = ({ user, onJoinGroup, onBack, onCreateNew }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToUserGroups(user.uid, (fetchedGroups) => {
      setGroups(fetchedGroups);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="user-groups-container glass-panel page-wrapper">
      <div className="groups-header">
        <h2>Your Friend Groups 👥</h2>
        <button className="btn-primary" onClick={onCreateNew} style={{ padding: "10px 20px", borderRadius: "30px" }}>
          + New Group
        </button>
      </div>

      {loading ? (
        <p style={{ padding: "40px", color: "var(--text-secondary)" }}>Loading your groups...</p>
      ) : groups.length === 0 ? (
        <div className="no-groups">
          <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
            You aren't in any friend groups yet.
          </p>
          <button className="btn-secondary" onClick={onCreateNew}>Create your first group!</button>
        </div>
      ) : (
        <div className="groups-list">
          {groups.map((group) => (
            <div key={group.id} className="group-item" onClick={() => onJoinGroup(group)}>
              <div className="group-avatar">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className="group-details">
                <h3>{group.name}</h3>
                <p>{group.participants.length} members · Created {group.createdAt?.toDate().toLocaleDateString()}</p>
              </div>
              <button className="btn-secondary open-chat-btn">Open Chat</button>
            </div>
          ))}
        </div>
      )}

      <button className="btn-secondary back-btn" onClick={onBack} style={{ marginTop: "40px", width: "100%", maxWidth: "300px" }}>
        Back to Menu
      </button>
    </div>
  );
};

export default UserGroups;
