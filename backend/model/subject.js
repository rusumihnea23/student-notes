import { Model,DataTypes } from "sequelize";
import { database } from "../config.js";

class Subject extends Model{};

Subject.init(
    {
        subjectId:{ type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false,
             unique: true
        },
        studentId:{ type:DataTypes.INTEGER,
            
        }
    },
    {
        sequelize:database,
        modelName:'Subject',
        tableName:'Subjects',
        timestamps:true
    }
)

export{
    Subject
}