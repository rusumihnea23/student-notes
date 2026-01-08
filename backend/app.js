import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors'
import {authRoutes} from './routes/auth.js'
import { authenticateToken } from './auth/authMiddleware.js';
dotenv.config();


const app=express();
app.use(express.json());
app.use(cors());

const PORT=8000;

import {seedStudents}from './model/student.js'
import { syncDb } from './config.js';
import { Attachment,Student,Label,Note,NoteSharing,StudyGroup,Subject } from './tableRelationships/relationships.js';


async function start() {
    try {
        await syncDb();
        await seedStudents();
        
        app.listen(PORT, () => {
            console.log("Server is listening on port: ", PORT)
        })
    } catch (error) {
        console.error(error);
    }
}

//HTTPS METHODS

app.use('/api/auth', authRoutes);

app.get("/",async(req,res)=>{



})
app.get("/api",async(req,res)=>{


res.status(400).json({exemplu:"mama"});

})
//Student
app.post("/students",async(req,res)=>{
    //endpoint ce creaza student
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
    //endpoint ce sterge un student 
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
app.patch('/students/:studentId/username',authenticateToken,async (req,res)=>{
    //editeaza username student
try {
 let student=await Student.findOne({
        where:{studentId:req.params.studentId}
    })
    if(!student)
        return res.status(404).json({message:`student doesn't exist`});

    const newUsername=req.body.username;
    
    if(newUsername===undefined||!newUsername||newUsername.trim().length===0||newUsername===""|| typeof newUsername!=="string")
        res.status(400).json({message:"malformed username"});
    if(Object.keys(req.body).length>1)
         res.status(400).json({message:"malformed request"});
    student.username=newUsername;

    await student.save();
    return res.status(200).json({message:"username updated succesfully"});    
} catch (err) {
    return res.status(500).json({ message: "something went wrong" })
}

})


//Notes 1 
app.get("/students/mynotes", authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id; // get studentId from JWT

    const student = await Student.findOne({ where: { studentId:studentId } });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const notes = await Note.findAll({ where: { studentId } });

    return res.status(200).json({ notes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});






app.post("/students/:studentId/notes",async(req,res)=>{
//endpoint care creaza o notita
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
    //editeaza notita titlu
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
    //endpoint care editeaza notita body
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
    //endpoint care sterge o notita
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

//Subjects

app.post("/students/:studentId/subjects",async(req,res)=>{
// endpoint care creeaza subiecte 

 let student=await Student.findByPk(
   req.params.studentId)
    
    if(!student)
        return res.status(404).json({message:`student doesn't exist`});

    const body=req.body;

    if(Object.keys(body).length>1||Object.keys(body).length===0)
        return res.status(400).json({message:"Malformed request"});

    if(!body.name||body.name===""||body.name.trim().length===0)
    return res.status(400).json({message:"Malformed subject"});

    const subject=await Subject.create({name:body.name});

 
    return res.status(201).json({message:"subject created succesfully"});    

})

app.patch("/students/subjects/:subjectId",async(req,res)=>{
// endpoint care editeaza subiect
try {
 let subject=await Subject.findByPk(req.params.subjectId)
    if(!subject)
        return res.status(404).json({message:`subject doesn't exist`});

    const newName=req.body.name;
    
    if(newName===undefined||!newName||newName.trim().length===0||newName===""|| typeof newName!=="string")
       return res.status(400).json({message:"Malformed name"});
    subject.name=newName;

    await subject.save();
    return res.status(200).json({message:"subject updated succesfully"});    
} catch (err) {
    return res.status(500).json({ message: "Something went wrong" })
}

})

app.delete("/students/subjects/:subjectId",async(req,res)=>{
    //endpoint care sterge un subiect 
try {
     let subject=await Subject.findByPk(req.params.subjectId)
    if(!subject)
        return res.status(404).json({message:`subject doesn't exist`});
        await subject.destroy();
    return res.status(200).json({message:"subject deleted"});

} catch (err) {
    return res.status(500).json({ message: "Something went wrong" })
}


})


app.patch("/students/:studentId/notes/:noteId/subjects/:subjectId",async(req,res)=>{
//endpoint care adauga subiectul la notita
try {
 let note=await Note.findOne({
        where:{noteId:req.params.noteId,studentId:req.params.studentId}
    })
    if(!note)
        return res.status(404).json({message:`Note doesn't exist`});

let subject=await Subject.findByPk(
   req.params.subjectId
)
    if (!subject)
        return res.status(404).json({ message: "Subject doesn't exist" });

    if (note.subjectId === subject.subjectId)
        return res.status(400).json({ message: "Subject already assigned" });

    note.subjectId=subject.subjectId; 
    await note.save();
    return res.status(201).json({message:"subject assigned succesfully"});    
} catch (err) {
    return res.status(500).json({ message: "Something went wrong" })
}})

//Labels


app.post("/students/:studentId/labels",async(req,res)=>{
    // endpoint care creeaza label 
try {
 let student=await Student.findByPk(
   req.params.studentId)
    
    if(!student)
        return res.status(404).json({message:`student doesn't exist`});

    if(Object.keys(req.body).length>1||Object.keys(req.body).length===0)
        return res.status(400).json({message:"Malformed request"});

    if(!req.body.tag||req.body.tag===""||req.body.tag.trim().length===0)
    return res.status(400).json({message:"Malformed subject"});

    const label=await Label.create({tag:req.body.tag});

 
    return res.status(201).json({message:"label created succesfully"});       
} catch (err) {
    return res.status(500).json({ message: "Something went wrong" })
}})

app.delete("/students/labels/:labelId",async(req,res)=>{
    //endpoint care sterge un label 
try {
     let label=await Label.findByPk(req.params.labelId)
    if(!label)
        return res.status(404).json({message:`label doesn't exist`});
    
    await label.destroy();
    return res.status(200).json({message:"label deleted"});

} catch (err) {
    return res.status(500).json({ message: "Something went wrong" })
}})

app.patch("/students/labels/:labelId",async(req,res)=>{
// endpoint care editeaza label
try {
 let label=await Label.findByPk(req.params.labelId)
    if(!label)
        return res.status(404).json({message:`label doesn't exist`});

    let newTag=req.body.tag;
    
    if(newTag===undefined||!newTag||newTag.trim().length===0||newTag===""|| typeof newTag!=="string")
       return res.status(400).json({message:"Malformed tag"});

    label.tag=newTag;

    await label.save();
    return res.status(200).json({message:"label updated succesfully"});    
} catch (err) {
    return res.status(500).json({ message: "Something went wrong" })
}

//de facut endpoint care editeaza un label 
//de facut endpoint care iti returneaza toate labelurile


}) 

app.patch("/students/:studentId/notes/:noteId/:labelId",async(req,res)=>{
//endpoint care adauga label la notita
try {
 let note=await Note.findOne({
        where:{noteId:req.params.noteId,studentId:req.params.studentId}
    })
    if(!note)
        return res.status(404).json({message:`Note doesn't exist`});

let label=await Label.findByPk(
   req.params.labelId
)
    if (!label) {
      return res.status(404).json({ message: "label doesn't exist" });
    }
     await note.addLabels(label, { through: { unique: true } });

    return res.status(201).json({message:"label assigned succesfully"});    
} catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
}})

//Notes2

app.get("/students/:studentId/notes/:noteId/labels",async(req,res)=>{
    //toate labelurile unei notite
 let note=await Note.findOne({
        where:{noteId:req.params.noteId,studentId:req.params.studentId}
    })
    if(!note)
        return res.status(404).json({message:`Note doesn't exist`});
 const labels = await note.getLabels({attributes:["tag","body"]});
    return res.status(200).json(labels);


})

app.get("/students/:studentId/labels/:labelId",async(req,res)=>{
//endponit care returneaza notitele bazat pe un label 
 let label=await Label.findByPk(req.params.labelId)
    if(!label)
        return res.status(404).json({message:`label doesn't exist`});
 const notes = await label.getNotes({
    attributes:["title","body"]
 });

    return res.status(200).json(notes);

})


app.get("/students/:studentId/subjects/:subjectId",async(req,res)=>{
//endponit care returneaza notitele bazat pe un subiect 
 let subject=await Subject.findByPk(req.params.subjectId)
    if(!subject)
        return res.status(404).json({message:`subject doesn't exist`});
 const notes = await subject.getNotes({
    attributes:["title","body"]
 });

    return res.status(200).json(notes);

})

//Attachments
app.post("/students/:studentId/notes/:noteId/attachments", async(req,res)=>{
    //endpoint care creeaza atasament
   try{
    let student=await Student.findByPk(
   req.params.studentId)
    if(!student)
        return res.status(404).json({message:`student doesn't exist`});
    const body=req.body;
    const note = await Note.findOne({
     where: { studentId: req.params.studentId, noteId:req.params.noteId}});   
    
    if(!note)
        return res.status(404).json({message:`note doesn't exist`});

   
    if(!req.body.type||req.body.type===""||req.body.type.trim().length===0)
    return res.status(400).json({message:"Malformed subject"});
    if(!req.body.filePath||req.body.filePath===""||req.body.filePath.trim().length===0)
    return res.status(400).json({message:"Malformed subject"});

    const attachment=await Attachment.create({type:req.body.type,filePath:req.body.filePath, noteId:note.noteId});

 
    return res.status(201).json({message:"attachment created succesfully"});   
   }
   catch(err){return res.status(500).json({ message: "Something went wrong",error: err.message })}
})

app.delete("/students/:studentId/notes/:noteId/attachments/:attachmentId",async(req,res)=>{
    //sterge atasament
   try {
        const note = await Note.findOne({
            where: { noteId:req.params.noteId,studentId: req.params.studentId }
       })

       const attachment = await Attachment.findOne({
            where: { attachmentId:req.params.attachmentId, noteId: note.noteId }
       })

   
    await attachment.destroy();
    return res.status(200).json({message:"attachment deleted"});
    } catch (err) {
    return res.status(404).json({error:err.message});     
    }
})

//de reparat sters label, adaugat label unei notite  -> comportament ciudat, baza de date considera NoteLabelings cu key unice si nu stiu de ce cateodata merge cateodata nu  

//Note sharing
app.post("/students/:studentId/notes/:noteId/noteSharing",async(req,res)=>{
    //endpoint care creeaza un notesharing
     try{
    let student=await Student.findByPk(
   req.params.studentId)
    if(!student)
        return res.status(404).json({message:`student doesn't exist`});
    const body=req.body;
    const note = await Note.findOne({
     where: { studentId: req.params.studentId, noteId:req.params.noteId}});   
    
    if(!note)
        return res.status(404).json({message:`note doesn't exist`});
   
    if(!body.permission||body.permission===""||body.permission.trim().length===0)
    return res.status(400).json({message:"Malformed subject"});   
    if(!body.username||body.username===""||body.username.trim().length===0)
    return res.status(400).json({message:"Malformed subject"});

    const receivingStudent= await  Student.findOne({
        where:{username:body.username}
    });
    if(!receivingStudent)
        return res.status(404).json({message:'user doesnt exist'});

    const noteSharing=await NoteSharing.create({permission:body.permission,username:body.username, noteId:note.noteId,studemtId:student.studentId});

    return res.status(201).json({message:"Note shared succesfully"});   
   }
   catch(err){return res.status(500).json({ message: "Something went wrong",error: err.message })}
})

app.delete("/students/:studentId/notes/:noteId/noteSharing/:sharingId",async(req,res)=>{
    //endpoint sterge note sharing
   try {
        const note = await Note.findOne({
            where: { noteId:req.params.noteId,studentId: req.params.studentId }
       })

       const noteSharing = await NoteSharing.findOne({
            where: { sharingId:req.params.sharingId, noteId: note.noteId }
       })

    await noteSharing.destroy();
    return res.status(200).json({message:"noteSharing deleted"});
    } catch (err) {
    return res.status(404).json({error:err.message});     
    }
})

app.get("/students/:studentId/noteSharing",async(req,res)=>{
    let student=await Student.findByPk(req.params.studentId)
    if(!student)
        return res.status(404).json({message:'student doesnt exist'});
    const noteSharings=await NoteSharing.findAll({
        where:{username:student.username}
    })
        return res.status(200).json(noteSharings);
})

start();