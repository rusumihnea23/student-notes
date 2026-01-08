import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const MyNotes = () => {
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate(); // hook to programmatically navigate

  useEffect(() => {
    fetchMyNotes();
  }, []);

  const fetchMyNotes = async () => {
    try {
      const response = await api.get("/students/mynotes");
      console.log(response);
      setNotes(response.data.notes);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h4 className="mb-3">My Notes</h4>

      {notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <div
          className="d-grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          }}
        >
          {notes.map((note) => (
            <div
              key={note._id}
              onClick={() => navigate(`/students/notes/${note.noteId}`)} // navigate on click
              className="bg-primary text-white d-flex align-items-center justify-content-center rounded"
              style={{
                height: "150px",
                textAlign: "center",
                cursor: "pointer",
                padding: "10px",
                wordBreak: "break-word",
              }}
            >
              {note.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNotes;
