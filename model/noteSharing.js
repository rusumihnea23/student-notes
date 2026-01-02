import { Model,DataTypes } from "sequelize";
import { database } from "../config.js";

class NoteSharing extends Model{};

NoteSharing.init(
    {
        sharingId:{ type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        permission:{
            type:DataTypes.BOOLEAN,
            allowNull:false
        },
        username:{
            type:DataTypes.STRING,
            allowNull:false
        }

    },
    {
        sequelize:database,
        modelName:'NoteSharing',
        tableName:'NoteSharing',
        timestamps:true
    }
)

export{
    NoteSharing
}