import express, { json } from "express"; const app = express(); app.use(json())
import { connectToDatabase } from "./db.js"; let db
import jwt from 'jsonwebtoken'; const { sign } = jwt;
import rateLimit from 'express-rate-limit'
import { compare, hash, genSalt } from 'bcrypt'

startServer(3333)

async function startServer(PORT){

    try{
        db = await connectToDatabase()
        
        app.listen(PORT, ()=>{ console.debug(`‎ \n Server backend avviato | Port: ${PORT} \n ---------------------------------------------------------`) })

        app.use((req, res, next) => {        
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Body')
            next()
        })

        //* API list
        app.get('/test', (req, res) => { console.debug('API works'); res.send('API works') })
        app.post('/checkUserTokenValidity', (req, res) => { handleApi_checkUserTokenValidity(req, res) })


    }catch(error){
        console.error('Errore avviando il server backend:', error)
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_checkUserTokenValidity(req, res){
    const { privateToken, user_id } = req.body
    const user_info = await db.collection('users_info').findOne({user_id: Number(user_id)})

    if (user_info === null){
        console.debug('Utente non trovato')
        res.status(404).json({ message: 'Utente non trovato' })
        console.debug("---------------------------------------------------------")
        return
    }

    if (user_info.token === privateToken){
        console.debug('Token valido')
        res.status(202).json({ message: 'Token valido' })
        return
    } else {
        console.debug('Token non valido')
        res.status(401).json({ message: 'Token non valido' })
        console.debug("---------------------------------------------------------")
        return
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


