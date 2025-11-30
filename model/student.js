import { Model,DataTypes } from "sequelize";
import { database } from "../config.js";

class Student extends Model{};

Student.init(
    {
        studentId:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false
        },
        username:{
            type:DataTypes.STRING,
            allowNull:false
        },
        email:{
            type:DataTypes.STRING,
            allowNull:false
        },
        password:{
            type:DataTypes.STRING,
            allowNull:false
        },
        studyYear:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        sequelize:database,
        modelName:'Student',
        tableName:'Students',
        timestamps:true
    }
)

export async function seedStudents() {
    try {
        // Optional: avoid seeding twice
        const count = await Student.count();
        if (count > 0) {
            console.log("Seed skipped: students already exist.");
            return;
        }

        await Student.bulkCreate(
        [
            {
            name:"nana",
            username:"nana1",
            email:"cac",
            password:123445,
            studyYear:1
            }
        ],
            { validate: true }
        );

        console.log("Students seeded successfully.");
    } catch (err) {
        console.error("Error seeding students:", err);
    }
}

export{
    Student
}