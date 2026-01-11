import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const AddNote = () => {
  const navigate = useNavigate();

  // Note fields
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  // Attachments
  const [attachments, setAttachments] = useState([]);
  const [newAttachment, setNewAttachment] = useState({ type: "", filePath: "" });

  // Subjects
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [subjectLoading, setSubjectLoading] = useState(false);

  // Labels
  const [labels, setLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [labelLoading, setLabelLoading] = useState(false);

  // Fetch subjects & labels on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, labelsRes] = await Promise.all([
          api.get("/students/subjects"),
          api.get("/students/labels"),
        ]);
        setSubjects(subjectsRes.data);
        setLabels(labelsRes.data);
      } catch (err) {
        console.error("Error fetching subjects or labels:", err);
      }
    };
    fetchData();
  }, []);

  // --- ACTIONS ---

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    setSubjectLoading(true);
    try {
      const res = await api.post("/students/subjects", { name: newSubjectName.trim() });
      setSubjects([...subjects, res.data]);
      setSelectedSubjectId(res.data.subjectId);
      setNewSubjectName("");
    } catch (err) {
      alert("Failed to add subject");
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return;
    if (labels.some((l) => l.tag.toLowerCase() === newLabelName.trim().toLowerCase())) {
      alert("Label already exists");
      return;
    }
    setLabelLoading(true);
    try {
      const res = await api.post("/students/labels", { tag: newLabelName.trim() });
      const newLabel = res.data;
      setLabels([...labels, newLabel]);
      setSelectedLabels([...selectedLabels, newLabel.labelId]); 
      setNewLabelName("");
    } catch (err) {
      alert("Failed to add label");
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
      setSelectedLabels((prev) => prev.filter((id) => id !== labelId));
    } catch (err) {
      console.error("Error deleting label:", err);
    }
  };

  const toggleLabel = (labelId) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const addAttachment = () => {
    if (!newAttachment.type || !newAttachment.filePath) return;
    setAttachments([...attachments, { ...newAttachment, _key: Date.now() + Math.random() }]);
    setNewAttachment({ type: "", filePath: "" });
  };

  const removeAttachment = (key) => {
    setAttachments(attachments.filter((att) => att._key !== key));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return alert("Note body cannot be empty");

    setLoading(true);
    try {
      const res = await api.post("/students/notes", { title, body });
      const noteId = res.data.noteId;

      if (selectedSubjectId) {
        await api.patch(`/students/notes/${noteId}/subjects/${selectedSubjectId}`);
      }
      for (const labelId of selectedLabels) {
        await api.patch(`/students/notes/${noteId}/labels/${labelId}`);
      }
      for (const att of attachments) {
        await api.post(`/students/notes/${noteId}/attachments`, {
          type: att.type,
          filePath: att.filePath,
        });
      }

      navigate(`/students/notes/${noteId}`);
    } catch (err) {
      alert("Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm p-4">
        <h3 className="mb-4">Create New Note</h3>

        {/* TITLE & BODY */}
        <div className="mb-3">
          <label className="form-label fw-bold">Title</label>
          <input
            className="form-control mb-2"
            type="text"
            placeholder="Note Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="form-label fw-bold">Body</label>
          <textarea
            className="form-control mb-3"
            rows="6"
            placeholder="Write your note content here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        {/* SUBJECT SECTION */}
        <div className="mb-4">
          <label className="form-label fw-bold">Subject</label>
          <select
            className="form-select mb-2"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            <option value="">-- No subject --</option>
            {subjects.map((subj) => (
              <option key={subj.subjectId} value={subj.subjectId}>
                {subj.name}
              </option>
            ))}
          </select>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Create new subject"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleAddSubject}
              disabled={subjectLoading}
            >
              {subjectLoading ? "..." : "Add"}
            </button>
          </div>
        </div>

        {/* LABELS SECTION */}
        <div className="mb-4">
          <label className="form-label fw-bold">Labels (Click to toggle)</label>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {labels.map((label) => {
              const isSelected = selectedLabels.includes(label.labelId);
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
              type="text"
              className="form-control"
              placeholder="Create new label"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddLabel}
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
                type="text"
                className="form-control"
                placeholder="Type"
                value={newAttachment.type}
                onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value })}
              />
            </div>
            <div className="col-6">
              <input
                type="text"
                className="form-control"
                placeholder="File Path / URL"
                value={newAttachment.filePath}
                onChange={(e) => setNewAttachment({ ...newAttachment, filePath: e.target.value })}
              />
            </div>
            <div className="col-2">
              <button type="button" className="btn btn-dark w-100" onClick={addAttachment}>
                Add
              </button>
            </div>
          </div>

          <ul className="list-group">
            {attachments.map((att) => (
              <li key={att._key} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>{att.type}:</strong> {att.filePath}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeAttachment(att._key)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* FINAL ACTIONS */}
        <div className="d-flex gap-2 border-top pt-3">
          <button className="btn btn-primary px-4" onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Save Note"}
          </button>
          <button className="btn btn-outline-secondary px-4" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNote;