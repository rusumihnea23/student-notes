import { Model,DataTypes } from "sequelize";
import { database } from "../config.js";

class StudyGroup extends Model{};

StudyGroup.init(
    {
        groupId:{ type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false
        },
        description:{
            type:DataTypes.STRING,
            allowNull:false
        },
        owner:{
            type:DataTypes.STRING,
            allowNull:false
        }
    },
    {
        sequelize:database,
        modelName:'StudyGroup',
        tableName:'StudyGroups',
        timestamps:true
    }
)

export{
    StudyGroup
}