import { useState, useEffect } from "react";
import api from "../../services/api";

const normalizeLink = (url) =>
  url.startsWith("http") ? url : "https://" + url;

const NoteView = ({
  note,
  subjects,
  labels,
  noteLabels,
  attachments,
  onEdit,
  onDelete
}) => {
  const [showShare, setShowShare] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [permission, setPermission] = useState("read"); // example: read/write
  const [sharing, setSharing] = useState(false);

  // Fetch students when modal opens
  useEffect(() => {
    if (showShare) {
      api.get("/students")
        .then(res => setStudents(res.data))
        .catch(err => console.error("Failed to fetch students", err));
    }
  }, [showShare]);

  const handleShare = async () => {
  if (!selectedStudent) {
    return alert("Please select a student to share with.");
  }
console.log("selectedStudent raw:", selectedStudent);
  const studentId = Number(selectedStudent); // ensure it's a number
  if (isNaN(studentId)) {
    return alert("Invalid student selected.");
  }

  setSharing(true);

  try {
    // Get token from localStorage (adjust if you store it elsewhere)
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }

    const response = await api.post(
      "/notesharing",
      {
        noteId: note.noteId,
        sharedWithStudentId: studentId,
        permission: permission === "write" // boolean
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("Note shared successfully!");
    setShowShare(false);
    setSelectedStudent(""); // reset selection
  } catch (err) {
    console.error("Error sharing note:", err);
    alert(err.response?.data?.message || "Failed to share note.");
  } finally {
    setSharing(false);
  }
};

  return (
    <div className="card shadow-sm p-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>{note.title || "Untitled Note"}</h2>
        <span className="badge bg-info">
          {subjects.find(s => s.subjectId === note.subjectId)?.name || "No Subject"}
        </span>
      </div>

      <p style={{ whiteSpace: "pre-wrap" }}>{note.body}</p>

      <h6 className="text-muted mt-4">Labels</h6>
      <div className="d-flex gap-2 flex-wrap">
        {labels
          .filter(l => noteLabels.includes(l.labelId))
          .map(l => (
            <span key={l.labelId} className="badge bg-primary">
              {l.tag}
            </span>
          ))}
      </div>

      <h6 className="text-muted mt-4">Attachments</h6>
      {attachments.length ? (
        <ul className="list-group list-group-flush">
          {attachments.map(att => (
            <li key={att._key} className="list-group-item ps-0">
              <strong>{att.type}:</strong>{" "}
              <a href={normalizeLink(att.filePath)} target="_blank" rel="noreferrer">
                {att.filePath}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <small className="text-muted">No attachments</small>
      )}

      <div className="d-flex gap-2 mt-4">
        <button className="btn btn-success" onClick={onEdit}>Edit</button>
        <button className="btn btn-outline-danger" onClick={onDelete}>Delete</button>
        <button className="btn btn-primary" onClick={() => setShowShare(true)}>Share</button>
      </div>

      {/* --- Share Modal --- */}
      {showShare && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Share Note</h5>
              <div className="mb-2">
                <label className="form-label">Select Student</label>
                <select
  value={selectedStudent}
  onChange={(e) => setSelectedStudent(e.target.value)}
>
  <option value="">Select a student</option>
  {students.map((s) => (
    <option key={s.studentId} value={s.studentId}>
      {s.name} ({s.email})
    </option>
  ))}
</select>
              </div>

              <div className="mb-3">
                <label className="form-label">Permission</label>
                <select
                  className="form-select"
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                >
                  <option value="read">Read</option>
                  
                </select>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button className="btn btn-secondary" onClick={() => setShowShare(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleShare} disabled={sharing}>
                  {sharing ? "Sharing..." : "Share"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteView;
