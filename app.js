import express from 'express'

const app=express();
const PORT=8000;

import {seedStudents}from './model/student.js'
import { syncDb } from './config.js';
import { Attachment,Student,Label,Note,NoteSharing,StudyGroup,Subject } from './tableRelationships/relationships.js';
app.get("/student", async (req, res) => {
    const query = req.query;
    delete query.id;

    const attributes = Student.getAttributes();
    const columns = Object.keys(attributes);


    const books = await Student.findAll();
    res.json(Students);

});

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

start();