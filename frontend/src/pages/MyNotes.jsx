import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const MyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterType, setFilterType] = useState("subject"); // subject or date
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [dateOrder, setDateOrder] = useState("desc"); // asc or desc
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyNotes();
    fetchSubjects();
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

  const deleteNote = async (noteId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/students/notes/${noteId}`);
      const updatedNotes = notes.filter((n) => n.noteId !== noteId);
      setNotes(updatedNotes);
      applyFilters(updatedNotes, filterType, selectedSubject, dateOrder);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterTypeChange = (e) => {
    const type = e.target.value;
    setFilterType(type);
    applyFilters(notes, type, selectedSubject, dateOrder);
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    applyFilters(notes, filterType, subjectId, dateOrder);
  };

  const handleDateOrderChange = (e) => {
    const order = e.target.value;
    setDateOrder(order);
    applyFilters(notes, filterType, selectedSubject, order);
  };

  const applyFilters = (allNotes, type, subjectId, order) => {
    let filtered = [...allNotes];

    // Subject filter
    if (type === "subject" && subjectId !== "all") {
      filtered = filtered.filter((note) => note.subjectId === parseInt(subjectId));
    }

    // Date filter
    if (type === "date") {
      filtered.sort((a, b) => {
        if (order === "asc") return new Date(a.createdAt) - new Date(b.createdAt);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    setFilteredNotes(filtered);
  };

  return (
    <div>
      <h4 className="mb-2">My Notes</h4>

      {/* Compact Filter Menu */}
      <div className="d-flex align-items-center mb-3" style={{ gap: "10px", fontSize: "0.9rem" }}>
        <label htmlFor="filterType" className="mb-0">Filter by:</label>
        <select
          id="filterType"
          className="form-select form-select-sm"
          value={filterType}
          onChange={handleFilterTypeChange}
          style={{ width: "150px" }}
        >
          <option value="subject">Subject</option>
          <option value="date">Date Added</option>
          <option value="label" disabled>Label (coming soon)</option>
        </select>

        {filterType === "subject" && (
          <>
            <label htmlFor="subjectFilter" className="mb-0">Subject:</label>
            <select
              id="subjectFilter"
              className="form-select form-select-sm"
              value={selectedSubject}
              onChange={handleSubjectChange}
              style={{ width: "150px" }}
            >
              <option value="all">All Subjects</option>
              {subjects.map((subj) => (
                <option key={subj.subjectId} value={subj.subjectId}>
                  {subj.name}
                </option>
              ))}
            </select>
          </>
        )}

        {filterType === "date" && (
          <>
            <label htmlFor="dateOrder" className="mb-0">Order:</label>
            <select
              id="dateOrder"
              className="form-select form-select-sm"
              value={dateOrder}
              onChange={handleDateOrderChange}
              style={{ width: "120px" }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </>
        )}
      </div>

      {filteredNotes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <div
          className="d-grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
        >
          {filteredNotes.map((note) => (
            <div
              key={note.noteId}
              onClick={() => navigate(`/students/notes/${note.noteId}`)}
              className="bg-primary text-white rounded position-relative d-flex align-items-center justify-content-center"
              style={{
                height: "150px",
                textAlign: "center",
                cursor: "pointer",
                padding: "10px",
                wordBreak: "break-word",
              }}
            >
              {note.title}
              <button
                onClick={(e) => deleteNote(note.noteId, e)}
                className="btn btn-danger btn-sm position-absolute"
                style={{ top: "5px", right: "5px", padding: "0 6px", fontSize: "0.8rem" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNotes;
