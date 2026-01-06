import { Model,DataTypes } from "sequelize";
import { database } from "../config.js";

class Label extends Model{};

Label.init(
    {
        labelId:{ type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        tag:{
            type:DataTypes.STRING,
            allowNull:false
        }
    },
    {
        sequelize:database,
        modelName:'Label',
        tableName:'Labels',
        timestamps:true
    }
)

export{
    Label
}