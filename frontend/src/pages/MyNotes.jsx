import { useState, useEffect } from "react";
import api from "../services/api";

const MyNotes = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchMyNotes();
  }, []);

  const fetchMyNotes = async () => {
    try {
  
      const response = await api.get("/students/mynotes");
      console.log(response)
      setNotes(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <p>TEST</p>
      <ul>
{        console.log(notes)}
        {notes.map((note, index) =>{ return(
          <li key={index}>
            <strong>Titlu:</strong> {note.title} <br />
            <strong>Body:</strong> {note.body}
          </li>
        )})}
      </ul>
    </div>
  );
};

export default MyNotes;
