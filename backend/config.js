import{Sequelize}from 'sequelize';


const database=new Sequelize({
    storage:'storage.db',
    dialect:'sqlite'
});

export async function syncDb() {
    try{
        await database.authenticate();
        await database.sync({alter:true});
        
    }
    catch(error){
        console.error(error);
    }
}





export{
    database
}