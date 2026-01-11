import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const MyNotes = () => {
  const [notes, setNotes] = useState([]); // Master list
  const [filteredNotes, setFilteredNotes] = useState([]); // Display list
  const [subjects, setSubjects] = useState([]);
  const [labels, setLabels] = useState([]);
  const [filterType, setFilterType] = useState("subject");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [dateOrder, setDateOrder] = useState("desc");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyNotes();
    fetchSubjects();
    fetchLabels();
  }, []);

  const fetchMyNotes = async () => {
    try {
      const response = await api.get("/students/mynotes");
      setNotes(response.data.notes);
      setFilteredNotes(response.data.notes);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/students/subjects");
      setSubjects(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLabels = async () => {
    try {
      const response = await api.get("/students/labels");
      setLabels(response.data);
    } catch (err) {
      console.error(err);
    }
  };

const deleteNote = async (noteId, e) => {
  e.stopPropagation(); // Prevents navigating to the note details when clicking delete
  
  if (!window.confirm("Are you sure you want to delete this note?")) return;

  try {
    await api.delete(`/students/notes/${noteId}`);

    // Update the master list (notes)
    const updatedMasterList = notes.filter((n) => n.noteId !== noteId);
    setNotes(updatedMasterList);

    // Update the display list (filteredNotes) immediately
    setFilteredNotes((prevFiltered) => prevFiltered.filter((n) => n.noteId !== noteId));
    
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Could not delete note. It might have been deleted already.");
  }
};

  // --- HANDLERS ---

  const handleFilterTypeChange = (e) => {
    const type = e.target.value;
    setFilterType(type);
    // Reset selections when switching types
    setSelectedSubject("all");
    setSelectedLabel("all");
    applyFilters(notes, type, "all", "all", dateOrder);
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    applyFilters(notes, filterType, subjectId, selectedLabel, dateOrder);
  };

  const handleLabelChange = (e) => {
    const labelId = e.target.value;
    setSelectedLabel(labelId);
    applyFilters(notes, filterType, selectedSubject, labelId, dateOrder);
  };

  const handleDateOrderChange = (e) => {
    const order = e.target.value;
    setDateOrder(order);
    applyFilters(notes, filterType, selectedSubject, selectedLabel, order);
  };

  // --- REPAIRED FILTER LOGIC ---

  const applyFilters = async (allNotes, type, subjectId, labelId, order) => {
    // CASE 1: Filter by Label (Using the dedicated endpoint)
    if (type === "label") {
      if (labelId === "all") {
        setFilteredNotes(allNotes);
      } else {
        try {
          // Use your perfect endpoint
          const response = await api.get(`/students/labels/${labelId}/filter`);
          // Ensure the backend returns noteId, title, etc.
          setFilteredNotes(response.data);
        } catch (err) {
          console.error("Filter error:", err);
          setFilteredNotes([]);
        }
      }
      return; // Exit early
    }

    // CASE 2: Local Filtering for Subjects/Date
    let filtered = [...allNotes];

    if (type === "subject" && subjectId !== "all") {
      filtered = filtered.filter((note) => note.subjectId == subjectId);
    }

    if (type === "date") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    setFilteredNotes(filtered);
  };

  return (
    <div className="container mt-3">
      <h4 className="mb-3">My Notes</h4>

      {/* Filter Menu */}
      <div className="d-flex align-items-center mb-4 flex-wrap" style={{ gap: "10px", fontSize: "0.9rem" }}>
        <div className="d-flex align-items-center gap-2">
          <label className="fw-bold mb-0">Filter by:</label>
          <select
            className="form-select form-select-sm"
            value={filterType}
            onChange={handleFilterTypeChange}
            style={{ width: "130px" }}
          >
            <option value="subject">Subject</option>
            <option value="date">Date Added</option>
            <option value="label">Label</option>
          </select>
        </div>

        {filterType === "subject" && (
          <div className="d-flex align-items-center gap-2">
            <label className="fw-bold mb-0">Subject:</label>
            <select
              className="form-select form-select-sm"
              value={selectedSubject}
              onChange={handleSubjectChange}
              style={{ width: "150px" }}
            >
              <option value="all">All Subjects</option>
              {subjects.map((subj) => (
                <option key={subj.subjectId} value={subj.subjectId}>{subj.name}</option>
              ))}
            </select>
          </div>
        )}

        {filterType === "label" && (
          <div className="d-flex align-items-center gap-2">
            <label className="fw-bold mb-0">Label:</label>
            <select
              className="form-select form-select-sm"
              value={selectedLabel}
              onChange={handleLabelChange}
              style={{ width: "150px" }}
            >
              <option value="all">All Labels</option>
              {labels.map((lbl) => (
                <option key={lbl.labelId} value={lbl.labelId}>{lbl.tag}</option>
              ))}
            </select>
          </div>
        )}

        {filterType === "date" && (
          <div className="d-flex align-items-center gap-2">
            <label className="fw-bold mb-0">Sort:</label>
            <select
              className="form-select form-select-sm"
              value={dateOrder}
              onChange={handleDateOrderChange}
              style={{ width: "130px" }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        )}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center p-5 border rounded bg-light">
          <p className="text-muted mb-0">No notes found for this selection.</p>
        </div>
      ) : (
        <div
          className="d-grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
        >
          {filteredNotes.map((note) => (
            <div
              key={note.noteId}
              onClick={() => navigate(`/students/notes/${note.noteId}`)}
              className="bg-primary text-white rounded shadow-sm position-relative d-flex align-items-center justify-content-center"
              style={{
                height: "150px",
                textAlign: "center",
                cursor: "pointer",
                padding: "15px",
                wordBreak: "break-word",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span className="fw-bold">{note.title || "Untitled Note"}</span>
              <button
                onClick={(e) => deleteNote(note.noteId, e)}
                className="btn btn-danger btn-sm position-absolute shadow-sm"
                style={{ top: "8px", right: "8px", borderRadius: "50%", width: "24px", height: "24px", padding: "0" }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNotes;