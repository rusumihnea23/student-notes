import { useState, useEffect } from "react";
import { useParams,useNavigate } from "react-router-dom";
import api from "../services/api";

const MyNotes = () => {
  const [note, setNote] = useState(null); // initialize as null
  const { noteId } = useParams();
const navigate = useNavigate();
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

 const deleteNote = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/students/notes/${noteId}`);
      
      navigate("/mynotes"); // go back to notes list
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

 const editNote = async () => {
   

    try {
      await api.patch(`/students/notes/${noteId}`);
      
      navigate("/mynotes"); //nu e implementat corect deocamdata
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  return (
    <div>
      {note ? (
        <>
          <h2>{note.Title}</h2>
          <p>{note.Body}</p>

          <button
            onClick={deleteNote}
            className="btn btn-danger mt-3"
          >
            Delete Note
          </button>
          <button
            // onClick={deleteNote}
            className="btn btn-sucess mt-3"
          >
            Edit Note
          </button>
        </>
      ) : (
        <p>Loading note...</p>
      )}
    </div>
  );
};

export default MyNotes;
