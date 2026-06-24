import mongoose from "mongoose";
import {DATABASE_URL} from "./env";

//connect from backend to mongoDB
const connect = async () => {
    try{
        await mongoose.connect(DATABASE_URL,{
            dbName: "db-acara"
        })

        return Promise.resolve("Database connected successfully");

    }catch (error) {
    
        return Promise.reject(`Failed to connect to database: ${error}`);
    }
}

export default connect;