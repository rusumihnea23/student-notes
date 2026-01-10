import { useState } from "react";
import api from "../services/api";

const NewNote = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/students/notes", {
        title,
        body,
      });

      console.log("Note created:", response.data);
      setTitle("");
      setBody("");
    } catch (err) {
      console.error("Error creating note:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <input
        className="form-control mb-2"
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="form-control mb-2"
        placeholder="Write your note..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Adding..." : "Add Note"}
      </button>
    </form>
  );
};

export default NewNote;
