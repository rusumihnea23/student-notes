import { Model,DataTypes } from "sequelize";
import { database } from "../config.js";

class Note extends Model{};

Note.init(
    {
        noteId:{ type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
       title:{
        type:DataTypes.STRING,
        allowNull:false
       },
       body:{
        type:DataTypes.STRING,
        allowNull:false
       }
    },
    {
        sequelize:database,
        modelName:'Note',
        tableName:'Notes',
        timestamps:true
    }
)

export async function seedNotes() {
    try {
        // Optional: avoid seeding twice
        const count = await Note.count();
        if (count > 0) {
            console.log("Seed skipped: notes already exist.");
            return;
        }

        await Note.bulkCreate(
            [
                {
                    title: "Clean Code",
                   body:'body'
                },
                {
                    title: "The Pragmatic Programmer",
                     body:'body'
                },
                {
                    title: "You Don't Know JS Yet",
                    body:'body'
                },
                {
                    title: "Refactoring",
                     body:'body'
                },
            ],
            { validate: true }
        );

        console.log("Notes seeded successfully.");
    } catch (err) {
        console.error("Error seeding notes:", err);
    }
}


export{
    Note,
}