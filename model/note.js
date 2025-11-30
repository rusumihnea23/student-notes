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

export{
    Note
}