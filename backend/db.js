import { MongoClient } from 'mongodb'

const uri = 'mongodb://localhost:27017'
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

export { connectToDatabase }