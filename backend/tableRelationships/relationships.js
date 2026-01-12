import{Student}from '../model/student.js'
import{Attachment}from '../model/attachment.js'
import{Label}from '../model/label.js'
import{Note}from '../model/note.js'
import{NoteSharing}from '../model/noteSharing.js'
import{StudyGroup}from '../model/studyGroup.js'
import{Subject}from '../model/subject.js'

Student.belongsToMany(StudyGroup, {
    as: 'StudyGroups',
    through: 'Colleagues',
    foreignKey:'studentId',
    otherKey: 'groupId'
})

StudyGroup.belongsToMany(Student, {
    as: 'Students',
    through: 'Colleagues',
    foreignKey: 'groupId',
    otherKey: 'studentId'
})

Note.belongsToMany(Label, {
    as: 'Labels',
    through: 'NoteLabelings',
    foreignKey: 'noteId',
    otherKey: 'labelId',
    onDelete: 'CASCADE', // Add this
    hooks: true          // Add this to ensure Sequelize handles the cleanup
});

Label.belongsToMany(Note, {
    as: 'Notes',
    through: 'NoteLabelings',
    foreignKey: 'labelId',
    otherKey: 'noteId',
    onDelete: 'CASCADE'  // Recommended here too
});

// Student.hasMany(NoteSharing, {
//     as: 'NoteSharings',
//     foreignKey: "studentId",
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE'
// })
// NoteSharing.belongsTo(Student, { as: 'Student', foreignKey: "studentId" })

// Student.hasMany(NoteSharing, {
//     as: 'NoteSharings',
//     foreignKey: "studentId",
// })
// NoteSharing.belongsTo(Note, { as: 'Note', foreignKey: "noteId" })

Student.hasMany(Note, {
    as: 'Notes',
    foreignKey: "studentId",
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
Note.belongsTo(Student, { as: 'Student', foreignKey: "studentId" })

Note.hasMany(Attachment, {
    as: 'Attachments',
    foreignKey: "noteId",
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
Attachment.belongsTo(Note, { as: 'Note', foreignKey: "noteId" })

Subject.hasMany(Note, {
    as: 'Notes',
    foreignKey: "subjectId",
    
    onUpdate: 'CASCADE'
})
Note.belongsTo(Subject, { as: 'Subject', foreignKey: "subjectId" })


// who shared
Student.hasMany(NoteSharing, {
  foreignKey: "studentId",
  as: "SharedNotes"
});
NoteSharing.belongsTo(Student, {
  foreignKey: "studentId",
  as: "Sender"
});

// who received
Student.hasMany(NoteSharing, {
  foreignKey: "sharedWithStudentId",
  as: "ReceivedNotes"
});
NoteSharing.belongsTo(Student, {
  foreignKey: "sharedWithStudentId",
  as: "Receiver"
});

// note relation
Note.hasMany(NoteSharing, {
  foreignKey: "noteId",
  onDelete: "CASCADE",
  hooks: true
});
NoteSharing.belongsTo(Note, { foreignKey: "noteId" });




export {Attachment,Student,Label,Note,NoteSharing,StudyGroup,Subject}