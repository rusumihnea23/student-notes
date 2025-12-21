import express from 'express'

const app=express();
app.use(express.json())
const PORT=8000;

import {seedStudents}from './model/student.js'
import { syncDb } from './config.js';
import { seedNotes } from './model/note.js';
import { Attachment,Student,Label,Note,NoteSharing,StudyGroup,Subject } from './tableRelationships/relationships.js';


async function start() {
    try {
        await syncDb();
        await seedStudents();
        await seedNotes();
        app.listen(PORT, () => {
            console.log("Server is listening on port: ", PORT)
        })
    } catch (error) {
        console.error(error);
    }
}

//HTTPS METHODS


app.get("/",async(req,res)=>{


res.send('Start Page');

})
//Student
app.post("/students",async(req,res)=>{
const body=req.body;
if(Object.keys(body).length===0)
    return res.status(400).json({ message: "body is missing" });
if(body.name===undefined||body.username===undefined||body.email===undefined||body.password===undefined||body.studyYear===undefined)
    return res.status(400).json({ message: "malformed request" });
const { name, username, email, password } = body;
if (
  !name || !username || !email || !password ||
  name.trim().length === 0 ||
  username.trim().length === 0 ||
  email.trim().length === 0 ||
  password.trim().length === 0
)
 return res.status(400).json({ message: "cannot pass empty strings" });
if(typeof body.studyYear!="number"|| body.studyYear<1|| body.studyYear>5)
    return res.status(400).json({ message: "study year must be between 1 and 5" });
if(body.email.includes("@stud.ase.ro")==false)
    return res.status(400).json({message:"only Ase students may use this website"});
const student = await Student.create(body);
return res.status(201).json({message:`student with Id: ${student.studentId} created succesfully`});
})

app.delete("/students/:studentId",async(req,res)=>{
    try {

       const student = await Student.findOne({
            where: { studentId: req.params.studentId }
       })

   
    await student.destroy();
    return res.status(200).json({message:"student deleted"});
    } catch (err) {
    return res.status(404).json({error:err.message});     
    }
});
//De facut editeaza student -> editeaza parola ,editeaza nume ,editeaza an

//Notes


app.post("/students/:studentId/notes",async(req,res)=>{

const student = await Student.findOne({
     where: { studentId: req.params.studentId }});    

if (!student) {
 return res.status(404).json({ message: "student not found" });
    }
const body=req.body;
if(Object.keys(body).length===0)
    return res.status(400).json({ message: "body is missing" });

let noteTitle=body.title;
const noteBody = body.body;

if(noteBody==undefined||noteBody.trim().length===0||Object.keys(body).length>2)
    return res.status(400).json({message: "malformed Request" })
if(noteTitle===undefined||!noteTitle)
noteTitle="New Note";

const note=await Note.create({title:noteTitle,body:noteBody,studentId:student.studentId});
return res.status(201).json({message:`note with Id: ${note.noteId} created succesfully`});

});

app.get('/students/:studentId/notes/:noteId',async(req,res)=>{

    const note=await Note.findOne({
        where:{noteId:req.params.noteId,studentId:req.params.studentId}
    })
    if(!note)
        return res.status(404).json({message:`note doesn't exist`});

    return res.status(200).json({Title:note.title,Body:note.body});
})

app.patch('/students/:studentId/notes/:noteId/title',async (req,res)=>{
try {
 let note=await Note.findOne({
        where:{noteId:req.params.noteId,studentId:req.params.studentId}
    })
    if(!note)
        return res.status(404).json({message:`note doesn't exist`});

    const newTitle=req.body.title;
    
    if(newTitle===undefined||!newTitle||newTitle.trim().length===0||newTitle===""|| typeof newTitle!=="string")
        res.status(400).json({message:"malformed title"});
    if(Object.keys(req.body).length>1)
         res.status(400).json({message:"malformed request"});
    note.title=newTitle;

    await note.save();
    return res.status(200).json({message:"title updated succesfully"});    
} catch (err) {
    return res.status(500).json({ message: "something went wrong" })
}

})

app.patch('/students/:studentId/notes/:noteId/body',async (req,res)=>{
try {
 let note=await Note.findOne({
        where:{noteId:req.params.noteId,studentId:req.params.studentId}
    })
    if(!note)
        return res.status(404).json({message:`Note doesn't exist`});

    const newBody=req.body.body;
    
    if(newBody===undefined||!newBody||newBody.trim().length===0||newBody===""|| typeof newBody!=="string")
        res.status(400).json({message:"Malformed body"});
    note.body=newBody;

    await note.save();
    return res.status(200).json({message:"body updated succesfully"});    
} catch (err) {
    return res.status(500).json({ message: "Something went wrong" })
}

})
app.delete('/students/:studentId/notes/:noteId',async (req,res)=>{
   try {

       const note = await Note.findOne({
            where: { noteId:req.params.noteId,studentId: req.params.studentId }
       })

   
    await note.destroy();
    return res.status(200).json({message:"note deleted"});
    } catch (err) {
    return res.status(404).json({error:err.message});     
    }


})

start();