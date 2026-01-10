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
        const subjectsRes = await api.get("/students/subjects");
        setSubjects(subjectsRes.data);

        const labelsRes = await api.get("/students/labels");
        setLabels(labelsRes.data);
      } catch (err) {
        console.error("Error fetching subjects or labels:", err);
      }
    };
    fetchData();
  }, []);

  // Add new subject
  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;

    if (subjects.some((s) => s.name.toLowerCase() === newSubjectName.trim().toLowerCase())) {
      alert("Subject already exists");
      return;
    }

    setSubjectLoading(true);
    try {
      const res = await api.post("/students/subjects", { name: newSubjectName.trim() });
      const newSubject = res.data;
      setSubjects([...subjects, newSubject]);
      setSelectedSubjectId(newSubject.subjectId);
      setNewSubjectName("");
    } catch (err) {
      console.error("Error adding subject:", err);
      alert("Failed to add subject");
    } finally {
      setSubjectLoading(false);
    }
  };

  // Add new label
  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return;

    if (labels.some((l) => l.tag.toLowerCase() === newLabelName.trim().toLowerCase())) {
      alert("Label already exists");
      return;
    }

    setLabelLoading(true);
    try {
      const res = await api.post("/students/labels", { tag: newLabelName.trim() });
      const newLabel = res.data; // { labelId, tag }
      newLabel._key = Date.now() + Math.random();

      setLabels([...labels, newLabel]);
      setSelectedLabels([...selectedLabels, newLabel.labelId]); // auto-select
      setNewLabelName("");
    } catch (err) {
      console.error("Error adding label:", err);
      alert("Failed to add label");
    } finally {
      setLabelLoading(false);
    }
  };

  // Toggle label selection
  const toggleLabel = (labelId) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  // Remove attachment
  const removeAttachment = (key) => {
    setAttachments(attachments.filter((att) => att._key !== key));
  };

  // Add attachment
  const addAttachment = () => {
    if (!newAttachment.type || !newAttachment.filePath) return;
    setAttachments([...attachments, { ...newAttachment, _key: Date.now() + Math.random() }]);
    setNewAttachment({ type: "", filePath: "" });
  };

  // Submit note
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) {
      alert("Note body cannot be empty");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Create note
      const res = await api.post("/students/notes", { title, body });
      const noteId = res.data.noteId;

      // 2️⃣ Add attachments
      for (const att of attachments) {
        await api.post(`/students/notes/${noteId}/attachments`, {
          type: att.type,
          filePath: att.filePath,
        });
      }

      // 3️⃣ Assign subject
      if (selectedSubjectId) {
        await api.patch(`/students/notes/${noteId}/subjects/${selectedSubjectId}`);
      }

      // 4️⃣ Assign labels
      for (const labelId of selectedLabels) {
        await api.patch(`/students/notes/${noteId}/labels/${labelId}`);
      }

      // 5️⃣ Navigate to note view
      navigate(`/students/notes/${noteId}`);
    } catch (err) {
      console.error("Error creating note:", err);
      alert("Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      {/* TITLE & BODY */}
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

      {/* SUBJECT */}
      <div className="mb-3">
        <label className="form-label">Subject (optional)</label>
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
            className="btn btn-secondary"
            onClick={handleAddSubject}
            disabled={subjectLoading}
          >
            {subjectLoading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* LABELS */}
      <div className="mb-3">
        <label className="form-label">Labels (optional)</label>
        <div className="d-flex flex-wrap gap-2 mb-2">
          {labels.map((label) => {
            const selected = selectedLabels.includes(label.labelId);
            const key = label.labelId ?? label._key;

            return (
              <div
                key={key}
                onClick={() => toggleLabel(label.labelId)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  border: selected ? "2px solid #0d6efd" : "1px solid #ccc",
                  backgroundColor: selected ? "#0d6efd" : "#f0f0f0",
                  color: selected ? "#fff" : "#333",
                  cursor: "pointer",
                  userSelect: "none",
                  position: "relative",
                  transition: "0.2s",
                }}
              >
                {label.tag}
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                    backgroundColor: "red",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Remove label from selection only for new note
                    setSelectedLabels(selectedLabels.filter((id) => id !== label.labelId));
                  }}
                >
                  ×
                </span>
              </div>
            );
          })}
        </div>
        <div className="input-group mt-2">
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
            {labelLoading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* ATTACHMENTS */}
      <div className="mb-2">
        <input
          type="text"
          className="form-control mb-1"
          placeholder="Attachment type"
          value={newAttachment.type}
          onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value })}
        />
        <input
          type="text"
          className="form-control mb-1"
          placeholder="Attachment file path or URL"
          value={newAttachment.filePath}
          onChange={(e) => setNewAttachment({ ...newAttachment, filePath: e.target.value })}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={addAttachment}
        >
          Add Attachment
        </button>
      </div>

      <ul className="list-group mb-3">
        {attachments.map((att) => (
          <li key={att._key} className="list-group-item d-flex justify-content-between">
            {att.type}: {att.filePath}
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => removeAttachment(att._key)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Adding..." : "Add Note"}
      </button>
    </form>
  );
};

export default AddNote;
