import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const MyNotes = () => {
  const [note, setNote] = useState(null); // initialize as null
  const { noteId } = useParams();

  useEffect(() => {
    if (noteId) fetchMyNote();
  }, [noteId]);

  const fetchMyNote = async () => {
    try {
      const response = await api.get(`students/notes/${noteId}`);
      console.log(response.data);
      setNote(response.data); // this is the object {Title, Body}
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>TEST</h1>

      {note ? (
        <div>
          <h2>{note.Title}</h2>
          <p>{note.Body}</p>
        </div>
      ) : (
        <p>Loading note...</p>
      )}
    </div>
  );
};

export default MyNotes;
