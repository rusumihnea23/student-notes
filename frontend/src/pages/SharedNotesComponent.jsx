import React, { useEffect, useState } from "react";
import api from "../services/api";

const SharedNotesComponent = () => {
  const [sharedNotes, setSharedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  api.get("/students/noteSharing")
    .then(res => {
      setSharedNotes(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
}, []);

  if (loading) return <p>Loading Notes...</p>;

  return (
    <div className="shared-notes-list">
      <h2>Notes from Colleagues</h2>

      {sharedNotes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        sharedNotes.map((item) => (
          <div key={item.sharingId} style={cardStyle}>
            <h3>{item.Note.title}</h3>
            <p>{item.Note.body}</p>
            <hr />
            <small>
              Send from: <strong>@{item.Note.Student.username}</strong>
            </small>
            <br />
            <small>
              Permission: {item.permission ? "Edit" : "Read Only"}
            </small>
          </div>
        ))
      )}
    </div>
  );
};

const cardStyle = {
  border: "1px solid #ccc",
  padding: "15px",
  margin: "10px 0",
  borderRadius: "8px",
  backgroundColor: "#f9f9f9",
};

export default SharedNotesComponent;
