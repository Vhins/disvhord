import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'; dotenv.config(); const MONGODB_URI = process.env.MONGODB_URI

const uri = MONGODB_URI
const dbName = "Disvhord"
const client = new MongoClient(uri)

async function connectToDatabase(){
    try{
        await client.connect()
        return client.db(dbName)
    }catch (error){
        console.error('Errore di connessione al MongoDB:', error)
        throw error
    }
}

function getDatabaseConnection() {
    return client.db(dbName)
}

export { connectToDatabase, getDatabaseConnection }
