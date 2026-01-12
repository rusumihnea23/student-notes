import { useState } from "react";
import api from "../../services/api";

const NoteEdit = ({
  note,
  subjects,
  labels,
  noteLabels,
  attachments,
  setLabels,
  setNoteLabels,
  setAttachments,
  setIsEditing,
  fetchAll,
  loading,
  setLoading,
}) => {
  // --- FORM STATE ---
  const [title, setTitle] = useState(note.title || "");
  const [body, setBody] = useState(note.body || "");
  const [subjectId, setSubjectId] = useState(note.subjectId || "");
  const [newSubjectName, setNewSubjectName] = useState("");

  const [newLabelName, setNewLabelName] = useState("");
  const [labelLoading, setLabelLoading] = useState(false);

  const [newAttachments, setNewAttachments] = useState([]);
  const [newAttachment, setNewAttachment] = useState({ type: "", filePath: "" });

  // --- LABEL ACTIONS ---
  const toggleLabel = async (labelId) => {
    try {
      if (noteLabels.includes(labelId)) {
        await api.delete(`/students/notes/${note.noteId}/labels/${labelId}`);
        setNoteLabels((prev) => prev.filter((id) => id !== labelId));
      } else {
        await api.patch(`/students/notes/${note.noteId}/labels/${labelId}`);
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
      const res = await api.post("/students/labels", { tag: newLabelName.trim() });
      const newLabel = res.data;
      setLabels((prev) => [...prev, newLabel]);
      await api.patch(`/students/notes/${note.noteId}/labels/${newLabel.labelId}`);
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
    setNewAttachments((prev) => [
      ...prev,
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
          await api.delete(`/students/notes/${note.noteId}/attachments/${key}`);
          setAttachments(attachments.filter((a) => a._key !== key));
        } catch (err) {
          console.error("Error deleting attachment:", err);
        }
      }
    }
  };

  // --- SAVE NOTE ---
  const saveNote = async () => {
    setLoading(true);
    try {
      // Update title/body
      await api.patch(`/students/notes/${note.noteId}`, { title, body });

      // Update subject if changed
      if (subjectId && subjectId !== note.subjectId) {
        await api.patch(`/students/notes/${note.noteId}/subjects/${subjectId}`);
      }

      // Add new attachments
      for (const att of newAttachments) {
        await api.post(`/students/notes/${note.noteId}/attachments`, {
          type: att.type,
          filePath: att.filePath,
        });
      }

      setNewAttachments([]);
      setIsEditing(false);
      fetchAll();
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Failed to save note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 shadow-sm">
      <h3 className="mb-3">Edit Note</h3>

      {/* Title */}
      <input
        className="form-control mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />

      {/* Body */}
      <textarea
        className="form-control mb-3"
        rows="6"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      {/* Subject */}
      <div className="mb-3">
        <select
          className="form-select mb-2"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          <option value="">-- No subject --</option>
          {subjects.map((s) => (
            <option key={s.subjectId} value={s.subjectId}>
              {s.name}
            </option>
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
              subjects.push(res.data);
              setSubjectId(res.data.subjectId);
              setNewSubjectName("");
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Labels */}
      <div className="mb-3">
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
                  userSelect: "none",
                }}
              >
                {label.tag}
                <span
                  onClick={(e) => deleteGlobalLabel(e, label.labelId)}
                  style={{
                    marginLeft: "10px",
                    fontWeight: "bold",
                    color: isSelected ? "#ffc107" : "#dc3545",
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

      {/* Attachments */}
      <div className="mb-3">
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
            <button className="btn btn-dark w-100" onClick={addAttachmentRow}>
              Add
            </button>
          </div>
        </div>

        <ul className="list-group">
          {[...attachments, ...newAttachments].map((att) => (
            <li
              key={att._key}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>
                <strong>{att.type}:</strong> {att.filePath}
              </span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() =>
                  removeAttachment(att._key, newAttachments.includes(att))
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Save / Cancel */}
      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={saveNote} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button className="btn btn-outline-secondary" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default NoteEdit;
