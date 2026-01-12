import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import NoteView from "../components/notes/NoteView";
import NoteEdit from "../components/notes/NoteEdit";

const Note = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [labels, setLabels] = useState([]);
  const [noteLabels, setNoteLabels] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (noteId) fetchAll();
  }, [noteId]);

  const fetchAll = async () => {
    try {
      const [noteRes, subjectsRes, labelsRes, noteLabelsRes, attRes] =
        await Promise.all([
          api.get(`/students/notes/${noteId}`),
          api.get("/students/subjects"),
          api.get("/students/labels"),
          api.get(`/students/notes/${noteId}/labels`),
          api.get(`/students/notes/${noteId}/attachments`),
        ]);

      setNote(noteRes.data);
      setSubjects(subjectsRes.data);
      setLabels(labelsRes.data);
      setNoteLabels(noteLabelsRes.data.map(l => l.labelId));
      setAttachments(attRes.data.map(a => ({ ...a, _key: a.attachmentId })));
    } catch (err) {
      console.error(err);
    }finally { setLoading(false); }
  };

  if (!note) return <div className="p-5 text-center">Loading note...</div>;

  return (
    <div className="container py-4">
      {isEditing ? (
        <NoteEdit
          note={note}
          subjects={subjects}
          labels={labels}
          noteLabels={noteLabels}
          attachments={attachments}
          setLabels={setLabels}
          setNoteLabels={setNoteLabels}
          setAttachments={setAttachments}
          setIsEditing={setIsEditing}
          setLoading={setLoading}
          loading={loading}
          fetchAll={fetchAll}
        />
      ) : (
        <NoteView
          note={note}
          subjects={subjects}
          labels={labels}
          noteLabels={noteLabels}
          attachments={attachments}
          onEdit={() => setIsEditing(true)}
          onDelete={async () => {
            if (window.confirm("Delete this note?")) {
              await api.delete(`/students/notes/${noteId}`);
              navigate("/mynotes");
            }
          }}
        />
      )}
    </div>
  );
};

export default Note;
