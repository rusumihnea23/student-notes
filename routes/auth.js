import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {Student} from '../model/student.js';
const authRoutes = express.Router();


//Register
authRoutes.post("/register/students",async(req,res)=>{
    //endpoint ce creaza/inregistreaza student
const body=req.body;
if(Object.keys(body).length===0)
    return res.status(400).json({ message: "body is missing" });
if(body.name===undefined||body.username===undefined||body.email===undefined||body.password===undefined||body.studyYear===undefined)
    return res.status(400).json({ message: "All fields are required" });
const { name, username, email, password,studyYear } = body;
if (
  !name || !username || !email || !password ||
  name.trim().length === 0 ||
  username.trim().length === 0 ||
  email.trim().length === 0 ||
  password.trim().length === 0
)
 return res.status(400).json({ message: "All fields are required" });

const userExists = await Student.findOne({where: { email: email }});
    if (userExists!==null) {
      return res.status(400).json({ message: 'User already exists' });
    }

if(typeof body.studyYear!="number"|| body.studyYear<1|| body.studyYear>5)
    return res.status(400).json({ message: "study year must be between 1 and 5" });
if(body.email.includes("@stud.ase.ro")==false)
    return res.status(400).json({message:"only Ase students may use this website"});
const hashedPassword = await bcrypt.hash(password, 10);
const student = await Student.create({
  name: name,
  username: username,
  email: email,
  password: hashedPassword,
  studyYear: studyYear
});
return res.status(201).json({message:`student with Id: ${student.studentId} created succesfully`});
})

authRoutes.post('/login/students', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Student.findOne({where:{ email }});
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

      const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({  error: err.message });
  }

});


export {authRoutes}