import { Model, DataTypes } from "sequelize";
import { database } from "../config.js";


class NoteSharing extends Model {}

NoteSharing.init(
  {
    sharingId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    noteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Notes",
        key: "noteId",
      },
      onDelete: "CASCADE",
    },

    studentId: { // sender
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sharedWithStudentId: { // receiver
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    permission: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    modelName: "NoteSharing",
    tableName: "NoteSharing",
  }
);


export { NoteSharing };
