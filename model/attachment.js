import { Model,DataTypes } from "sequelize";
import { database } from "../config.js";

class Attachment extends Model{};

Attachment.init(
    {
        attachmentId:{ type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        type:{
            type:DataTypes.STRING,
            allowNull:false
        },
        filePath:{
            type:DataTypes.STRING,
            allowNull:false
        }
    },
    {
        sequelize:database,
        modelName:'Attachment',
        tableName:'Attachments',
        timestamps:true
    }
)

export{
    Attachment
}