import React, { useEffect, useState } from 'react';

const SharedNotesComponent = ({ currentStudentId }) => {
    const [sharedNotes, setSharedNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:8080/students/${currentStudentId}/shared-with-me`)
            .then(res => res.json())
            .then(data => {
                setSharedNotes(data);
                setLoading(false);
            })
            .catch(err => console.error("Error:", err));
    }, [currentStudentId]);

    if (loading) return <p>Se încarcă notele partajate...</p>;

    return (
        <div className="shared-notes-list">
            <h2>Note Primite de la Colegi</h2>
            {sharedNotes.length === 0 ? (
                <p>Nu ai primit nicio notă încă.</p>
            ) : (
                sharedNotes.map(item => (
                    <div key={item.sharingId} style={cardStyle}>
                        <h3>{item.Note.title}</h3>
                        <p>{item.Note.body}</p>
                        <hr />
                        <small>Trimis de: <strong>@{item.Note.Student.username}</strong></small>
                        <br />
                        <small>Permisiune: {item.permission ? "Editare" : "Doar citire"}</small>
                    </div>
                ))
            )}
        </div>
    );
};

const cardStyle = {
    border: '1px solid #ccc',
    padding: '15px',
    margin: '10px 0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
};

export default SharedNotesComponent;