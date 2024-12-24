import express, { json } from "express"; const app = express(); app.use(json())
import { connectToDatabase } from "./db.js"; let db
import jwt from 'jsonwebtoken'; const { sign } = jwt;
import rateLimit from 'express-rate-limit'
import { compare, hash, genSalt } from 'bcrypt'

startServer(3333)

async function startServer(PORT){

    try{
        db = await connectToDatabase()
        
        app.listen(PORT, ()=>{ console.log(`‎ \n Server backend avviato | Port: ${PORT} \n ---------------------------------------------------------`) })

        //* API list
        app.get('/test', (req, res) => { console.log('API works'); res.send('API works') })


    }catch(error){
        console.error('Errore avviando il server backend:', error)
    }
}
