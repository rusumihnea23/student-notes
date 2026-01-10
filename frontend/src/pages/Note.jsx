import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const Note = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();

  // Core note data
  const [note, setNote] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState("");

  // Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  // New attachments
  const [newAttachment, setNewAttachment] = useState({ type: "", filePath: "" });
  const [newAttachments, setNewAttachments] = useState([]);

  useEffect(() => {
    if (noteId) fetchAll();
  }, [noteId]);

  const fetchAll = async () => {
    try {
      const [noteRes, subjectsRes, attRes] = await Promise.all([
        api.get(`/students/notes/${noteId}`),
        api.get("/students/subjects"),
        api.get(`/students/notes/${noteId}/attachments`)
      ]);

      const noteData = noteRes.data;
      setNote(noteData);
      setAttachments(attRes.data);
      setSubjects(subjectsRes.data);

      setEditedTitle(noteData.title || "");
      setEditedBody(noteData.body || "");
      setSelectedSubjectId(noteData.subjectId || "");

      // Fetch subject name separately if exists
      if (noteData.subjectId) {
        const subjRes = await api.get(`/students/subjects/${noteData.subjectId}`);
        setSubjectName(subjRes.data.name);
      } else {
        setSubjectName("");
      }
    } catch (err) {
      console.error("Error fetching note or subjects:", err);
    }
  };

  const normalizeLink = (url) =>
    url.startsWith("http://") || url.startsWith("https://") ? url : "https://" + url;

  const renderAttachment = (att) =>
    att.type.toLowerCase() === "link" ? (
      <a href={normalizeLink(att.filePath)} target="_blank" rel="noopener noreferrer">
        {att.filePath}
      </a>
    ) : (
      att.filePath
    );

  const addNewAttachment = () => {
    if (newAttachment.type && newAttachment.filePath) {
      setNewAttachments([...newAttachments, newAttachment]);
      setNewAttachment({ type: "", filePath: "" });
    }
  };

  const deleteAttachment = async (attachmentId) => {
    if (!window.confirm("Delete attachment?")) return;
    try {
      await api.delete(`/students/notes/${noteId}/attachments/${attachmentId}`);
      setAttachments(attachments.filter(a => a.attachmentId !== attachmentId));
    } catch (err) {
      console.error(err);
    }
  };

  const createSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      const res = await api.post("/students/subjects", { name: newSubjectName });
      setSubjects([...subjects, res.data]);
      setSelectedSubjectId(res.data.subjectId);
      setSubjectName(res.data.name);
      setNewSubjectName("");
    } catch (err) {
      console.error(err);
    }
  };

  const saveNote = async () => {
    try {
      // Update note
      await api.patch(`/students/notes/${noteId}`, {
        title: editedTitle,
        body: editedBody
      });

      // Update subject if changed
      if (selectedSubjectId && selectedSubjectId !== note.subjectId) {
        await api.patch(`/students/notes/${noteId}/subjects/${selectedSubjectId}`);
      }

      // Add new attachments
      for (const att of newAttachments) {
        await api.post(`/students/notes/${noteId}/attachments`, att);
      }

      setNewAttachments([]);
      setIsEditing(false);
      fetchAll();
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  const deleteNote = async () => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.delete(`/students/notes/${noteId}`);
      navigate("/mynotes");
    } catch (err) {
      console.error(err);
    }
  };

  if (!note) return <p>Loading note...</p>;

  return (
    <div>
      {isEditing ? (
        <>
          <input
            className="form-control mb-2"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Title"
          />
          <textarea
            className="form-control mb-2"
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
            placeholder="Body"
          />

          {/* SUBJECT EDIT */}
          <div className="mb-3">
            <label className="form-label">Change subject</label>
            <select
              className="form-select mb-2"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
            >
              <option value="">-- No subject --</option>
              {subjects
                .filter(s => s.subjectId !== note.subjectId)
                .map(s => (
                  <option key={s.subjectId} value={s.subjectId}>
                    {s.name}
                  </option>
                ))}
            </select>

            <div className="input-group">
              <input
                className="form-control"
                placeholder="Create new subject"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
              />
              <button className="btn btn-secondary" type="button" onClick={createSubject}>
                Add
              </button>
            </div>
          </div>

          {/* ATTACHMENTS */}
          <h5>Attachments</h5>
          <ul className="list-group mb-2">
            {attachments.map(att => (
              <li key={att.attachmentId} className="list-group-item d-flex justify-content-between">
                <span>{att.type}: {renderAttachment(att)}</span>
                <button className="btn btn-sm btn-danger" onClick={() => deleteAttachment(att.attachmentId)}>Delete</button>
              </li>
            ))}
          </ul>

          <input
            className="form-control mb-1"
            placeholder="Attachment type"
            value={newAttachment.type}
            onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value })}
          />
          <input
            className="form-control mb-2"
            placeholder="File path or URL"
            value={newAttachment.filePath}
            onChange={(e) => setNewAttachment({ ...newAttachment, filePath: e.target.value })}
          />
          <button className="btn btn-secondary btn-sm mb-3" onClick={addNewAttachment}>Add Attachment</button>

          <button className="btn btn-primary me-2" onClick={saveNote}>Save</button>
          <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <h2>{note.title}</h2>
          <p>{note.body}</p>

          {subjectName && <p><strong>Subject:</strong> {subjectName}</p>}

          <button className="btn btn-success me-2" onClick={() => setIsEditing(true)}>Edit</button>
          <button className="btn btn-danger" onClick={deleteNote}>Delete</button>

          <h4 className="mt-4">Attachments</h4>
          {attachments.length ? (
            <ul className="list-group">
              {attachments.map(att => (
                <li key={att.attachmentId} className="list-group-item">
                  {att.type}: {renderAttachment(att)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No attachments</p>
          )}
        </>
      )}
    </div>
  );
};

export default Note;
