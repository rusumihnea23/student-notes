import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const Note = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();

  // --- CORE STATE ---
  const [note, setNote] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [labels, setLabels] = useState([]); // All global labels
  const [noteLabels, setNoteLabels] = useState([]); // Array of labelIds assigned to this note
  const [attachments, setAttachments] = useState([]); // Existing attachments from DB

  // --- EDITING STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  // --- NEW ITEMS STATE (Pending Save) ---
  const [newLabelName, setNewLabelName] = useState("");
  const [labelLoading, setLabelLoading] = useState(false);
  const [newAttachments, setNewAttachments] = useState([]); // Attachments added during this edit session
  const [newAttachment, setNewAttachment] = useState({ type: "", filePath: "" });

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
      setNoteLabels(noteLabelsRes.data.map((l) => l.labelId));
      setAttachments(attRes.data.map((a) => ({ ...a, _key: a.attachmentId })));

      // Initialize form values
      setEditedTitle(noteRes.data.title || "");
      setEditedBody(noteRes.data.body || "");
      setSelectedSubjectId(noteRes.data.subjectId || "");
    } catch (err) {
      console.error("Error fetching note data:", err);
    }
  };

  const normalizeLink = (url) =>
    url.startsWith("http://") || url.startsWith("https://") ? url : "https://" + url;

  // --- LABEL ACTIONS ---

  const toggleLabel = async (labelId) => {
    try {
      if (noteLabels.includes(labelId)) {
        // Unassign label
        await api.delete(`/students/notes/${noteId}/labels/${labelId}`);
        setNoteLabels((prev) => prev.filter((id) => id !== labelId));
      } else {
        // Assign label using your PATCH endpoint
        await api.patch(`/students/notes/${noteId}/labels/${labelId}`);
        setNoteLabels((prev) => [...prev, labelId]);
      }
    } catch (err) {
      console.error("Error toggling label:", err);
    }
  };

  const handleAddNewLabel = async () => {
    if (!newLabelName.trim()) return;

    if (labels.some((l) => l.tag.toLowerCase() === newLabelName.trim().toLowerCase())) {
      alert("Label already exists");
      return;
    }

    setLabelLoading(true);
    try {
      // 1. Create label globally
      const res = await api.post("/students/labels", { tag: newLabelName.trim() });
      const newLabel = res.data;

      setLabels((prev) => [...prev, newLabel]);

      // 2. Assign to this note immediately via your PATCH endpoint
      await api.patch(`/students/notes/${noteId}/labels/${newLabel.labelId}`);
      setNoteLabels((prev) => [...prev, newLabel.labelId]);

      setNewLabelName("");
    } catch (err) {
      console.error("Error adding label:", err);
    } finally {
      setLabelLoading(false);
    }
  };

  const deleteGlobalLabel = async (e, labelId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this label globally from all notes?")) return;
    try {
      await api.delete(`/students/labels/${labelId}`);
      setLabels((prev) => prev.filter((l) => l.labelId !== labelId));
      setNoteLabels((prev) => prev.filter((id) => id !== labelId));
    } catch (err) {
      console.error("Error deleting label:", err);
    }
  };

  // --- ATTACHMENT ACTIONS ---

  const addAttachmentRow = () => {
    if (!newAttachment.type || !newAttachment.filePath) return;
    setNewAttachments([
      ...newAttachments,
      { ...newAttachment, _key: Date.now() + Math.random() },
    ]);
    setNewAttachment({ type: "", filePath: "" });
  };

  const removeAttachment = async (key, isNew) => {
    if (isNew) {
      setNewAttachments(newAttachments.filter((a) => a._key !== key));
    } else {
      if (window.confirm("Delete this attachment permanently?")) {
        try {
          await api.delete(`/students/notes/${noteId}/attachments/${key}`);
          setAttachments(attachments.filter((a) => a._key !== key));
        } catch (err) {
          console.error("Error deleting attachment:", err);
        }
      }
    }
  };

  // --- SAVE ACTION ---

  const saveNote = async () => {
  setLoading(true);
  try {
    
    await api.patch(`/students/notes/${noteId}`, {
      title: editedTitle,
      body: editedBody,
    });

    if (selectedSubjectId && selectedSubjectId !== note.subjectId) {
      await api.patch(`/students/notes/${noteId}/subjects/${selectedSubjectId}`);
    }


    for (const att of newAttachments) {
      await api.post(`/students/notes/${noteId}/attachments`, {
        type: att.type,
        filePath: att.filePath,
      });
    }

    setNewAttachments([]);
    setIsEditing(false);
    fetchAll(); // Refresh view to get updated data
  } catch (err) {
    console.error("Error saving note:", err);
    alert("Failed to save note. Make sure the subject is valid.");
  } finally {
    setLoading(false);
  }
};

  if (!note) return <div className="p-5 text-center">Loading note...</div>;

  return (
    <div className="container py-4">
      {isEditing ? (
        <div className="card p-4 shadow-sm">
          <h3 className="mb-3">Edit Note</h3>
          
          <label className="form-label fw-bold">Title</label>
          <input
            className="form-control mb-2"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Note Title"
          />

          <label className="form-label fw-bold">Body</label>
          <textarea
            className="form-control mb-3"
            rows="6"
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
            placeholder="Write your note content here..."
          />

          {/* SUBJECT SECTION */}
          <div className="mb-4">
            <label className="form-label fw-bold">Subject</label>
            <select
              className="form-select mb-2"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
            >
              <option value="">-- No subject --</option>
              {subjects.map((s) => (
                <option key={s.subjectId} value={s.subjectId}>{s.name}</option>
              ))}
            </select>
            <div className="input-group">
              <input
                className="form-control"
                placeholder="New subject name"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={async () => {
                  if (!newSubjectName.trim()) return;
                  const res = await api.post("/students/subjects", { name: newSubjectName.trim() });
                  setSubjects([...subjects, res.data]);
                  setSelectedSubjectId(res.data.subjectId);
                  setNewSubjectName("");
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* LABELS SECTION (Mirroring AddNote UI) */}
          <div className="mb-4">
            <label className="form-label fw-bold">Labels (Click to toggle)</label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {labels.map((label) => {
                const isSelected = noteLabels.includes(label.labelId);
                return (
                  <div
                    key={label.labelId}
                    onClick={() => toggleLabel(label.labelId)}
                    style={{
                      padding: "5px 15px",
                      borderRadius: "20px",
                      border: isSelected ? "2px solid #0d6efd" : "1px solid #ccc",
                      backgroundColor: isSelected ? "#0d6efd" : "#f8f9fa",
                      color: isSelected ? "#fff" : "#333",
                      cursor: "pointer",
                      position: "relative",
                      transition: "0.2s",
                      userSelect: "none"
                    }}
                  >
                    {label.tag}
                    <span
                      onClick={(e) => deleteGlobalLabel(e, label.labelId)}
                      style={{
                        marginLeft: "10px",
                        fontWeight: "bold",
                        color: isSelected ? "#ffc107" : "#dc3545"
                      }}
                    >
                      &times;
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="input-group">
              <input
                className="form-control"
                placeholder="Create new label"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
              />
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleAddNewLabel}
                disabled={labelLoading}
              >
                {labelLoading ? "..." : "Add"}
              </button>
            </div>
          </div>

          {/* ATTACHMENTS SECTION */}
          <div className="mb-4">
            <label className="form-label fw-bold">Attachments</label>
            <div className="row g-2 mb-2">
              <div className="col-4">
                <input
                  className="form-control"
                  placeholder="Type"
                  value={newAttachment.type}
                  onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value })}
                />
              </div>
              <div className="col-6">
                <input
                  className="form-control"
                  placeholder="File Path / URL"
                  value={newAttachment.filePath}
                  onChange={(e) => setNewAttachment({ ...newAttachment, filePath: e.target.value })}
                />
              </div>
              <div className="col-2">
                <button className="btn btn-dark w-100" onClick={addAttachmentRow}>Add</button>
              </div>
            </div>
            
            <ul className="list-group">
              {[...attachments, ...newAttachments].map((att) => (
                <li key={att._key} className="list-group-item d-flex justify-content-between align-items-center">
                  <span><strong>{att.type}:</strong> {att.filePath}</span>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => removeAttachment(att._key, newAttachments.includes(att))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary px-4" onClick={saveNote} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button className="btn btn-outline-secondary px-4" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* --- VIEW MODE --- */
        <div className="card shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">{note.title || "Untitled Note"}</h2>
            <span className="badge bg-info text-dark py-2 px-3">
              {subjects.find((s) => s.subjectId === selectedSubjectId)?.name || "No Subject"}
            </span>
          </div>

          <p className="lead border-bottom pb-3" style={{ whiteSpace: "pre-wrap" }}>
            {note.body}
          </p>

          <div className="mb-4">
            <h6 className="text-muted">Labels</h6>
            <div className="d-flex flex-wrap gap-2">
              {labels.filter((l) => noteLabels.includes(l.labelId)).map((l) => (
                <span key={l.labelId} className="badge rounded-pill bg-primary px-3 py-2">
                  {l.tag}
                </span>
              ))}
              {noteLabels.length === 0 && <small className="text-muted italic">No labels assigned</small>}
            </div>
          </div>

          <div className="mb-4">
            <h6 className="text-muted">Attachments</h6>
            {attachments.length > 0 ? (
              <ul className="list-group list-group-flush">
                {attachments.map((att) => (
                  <li key={att._key} className="list-group-item ps-0">
                    <span className="fw-bold">{att.type}:</span>{" "}
                    <a href={normalizeLink(att.filePath)} target="_blank" rel="noopener noreferrer">
                      {att.filePath}
                    </a>
                  </li>
                ))}
              </ul>
            ) : <small className="text-muted">No attachments</small>}
          </div>

          <div className="d-flex gap-2 border-top pt-3">
            <button className="btn btn-success px-4" onClick={() => setIsEditing(true)}>Edit Note</button>
            <button
              className="btn btn-outline-danger px-4"
              onClick={async () => {
                if (window.confirm("Delete this note?")) {
                  await api.delete(`/students/notes/${noteId}`);
                  navigate("/mynotes");
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Note;