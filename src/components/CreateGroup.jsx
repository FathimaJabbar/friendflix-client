import React, { useState } from "react";
import { createCustomGroup } from "../firebase";
import "./CreateGroup.css";

const CreateGroup = ({ user, matches, onBack, onSuccess }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleFriend = (id) => {
    if (selectedFriends.includes(id)) {
      setSelectedFriends(selectedFriends.filter((f) => f !== id));
    } else {
      setSelectedFriends([...selectedFriends, id]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }
    if (selectedFriends.length === 0) {
      alert("Please select at least one friend.");
      return;
    }

    setLoading(true);
    try {
      const participantIds = [...selectedFriends, user.uid];
      const groupId = await createCustomGroup(groupName, participantIds, user.uid);
      onSuccess(groupId, groupName);
    } catch (err) {
      console.error(err);
      alert("Error creating group. Check your Firebase permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-container glass-panel page-wrapper">
      <h2>👥 Create Friend Group</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>
        Invite your matches to a custom group chat!
      </p>

      <div className="input-wrapper">
        <input
          type="text"
          className="group-name-input"
          placeholder="Group Name (e.g. Friday Movie Night)"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>

      <div className="friends-selection-list">
        <h3>Select Friends to Invite:</h3>
        {matches.length === 0 ? (
          <p style={{ padding: "20px", color: "var(--text-secondary)" }}>
            No matches to invite yet. Go find some friends first!
          </p>
        ) : (
          <div className="friends-grid">
            {matches.map((friend) => (
              <div 
                key={friend.userId} 
                className={`friend-select-item ${selectedFriends.includes(friend.userId) ? "selected" : ""}`}
                onClick={() => toggleFriend(friend.userId)}
              >
                <div className="friend-info">
                  <span className="name">{friend.displayName}</span>
                  <span className="badge">{friend.badge?.emoji} {friend.badge?.name}</span>
                </div>
                <div className="checkbox">
                  {selectedFriends.includes(friend.userId) ? "✓" : "+"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="create-group-actions">
        <button className="btn-secondary" onClick={onBack} disabled={loading}>Cancel</button>
        <button 
          className="btn-primary" 
          onClick={handleCreate}
          disabled={loading}
          style={{ padding: "12px 40px" }}
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </div>
    </div>
  );
};

export default CreateGroup;
