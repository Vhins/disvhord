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
        app.post('/userCreateAccount', (req, res) => { handleApi_userCreateAccount(req, res) })
        app.post('/checkUserTokenValidity', (req, res) => { handleApi_checkUserTokenValidity(req, res) })


    }catch(error){
        console.error('Errore avviando il server backend:', error)
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_userCreateAccount(req, res){
    const { user_email, user_password, user_handle, user_displayName } = req.body
    console.debug("createAccountData | ", '| user_email: ', user_email, '| user_password: ', user_password, '| user_handle: ', user_handle, '| user_displayName: ', user_displayName)

    if (!isValidEmail(user_email) || !isValidDisplayNameOrHandle(user_handle) || !isValidDisplayNameOrHandle(user_displayName)) {
        console.log('Account non creato, email / handle / displayname non valido')
        res.status(400).json({ message: 'Account non creato, email / handle / displayname non valid' })
        console.log("---------------------------------------------------------")
        return
    }
    
    let isHandleAlredyTakenDB = await db.collection('users_info').findOne({ user_handle: user_handle })
    if (isHandleAlredyTakenDB !== null){
        console.log('Account non creato, handle gia usato')
        res.status(400).json({ message: 'account non creato, handle gia usato'})
        console.log("---------------------------------------------------------")
        return
    }
    
    let isEmailAlredyPresentDB = await db.collection('users_info').findOne({ user_email: user_email })
    if (isEmailAlredyPresentDB !== null){
        console.log('Account non creato, email gia registrata')
        res.status(400).json({ message: 'account non creato, email gia registrata'})
        console.log("---------------------------------------------------------")
        return
    }


    let saltHashedPassword = await generaSaltHashedPassword(user_password)
    
    const new_user_id = await generateID()
    const new_token = generaTokenJWT(new_user_id)

    const user_info_doc = {
        "user_id": new_user_id,
        "user_email": user_email,
        "user_handle": user_handle,
        "user_password": saltHashedPassword,
        "token": new_token
    }
    
    const user_interface_doc = {
        "user_id": new_user_id,
        "user_handle": user_handle,
        "user_displayName": user_displayName,
        "user_logo": 'default',
        "friends": [],
        "pending_friend_requests": [],
        "blocked": [],
        "chats": [],
        "servers_joined": [],
        "servers_owned": [],
        "posts": [],
        "notifications": []
    }

    const op = await db.collection('users_info').insertOne(user_info_doc)
    const op2 = await db.collection('users_interface').insertOne(user_interface_doc)

    if(op.acknowledged == false || op == null && op2.acknowledged == false || op2 == null){
        console.log('Errore del server, account non creato')
        res.status(404).json({ message: 'Errore del server, account non creato'})
        console.log("---------------------------------------------------------")
        return
    }

    console.log('Account creato correttamente')
    res.status(201).json({ message: 'account creato correttamente', token: new_token, id: new_user_id})
    
    console.log("---------------------------------------------------------")
    return
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

async function generaSaltHashedPassword(user_password){
    return await hash(user_password, await genSalt())
}

let lastCreatedID = null

async function generateID(){
    if(lastCreatedID != null){
        lastCreatedID += 1
        await db.collection('general_info').updateOne({unique: 'unique'}, {$set: {lastCreatedID: lastCreatedID}})
        return lastCreatedID
    }else{
        const dbGeneral = await db.collection('general_info').findOne({unique: 'unique'})
        lastCreatedID = dbGeneral.lastCreatedID + 1
        await db.collection('general_info').updateOne({unique: 'unique'}, {$set: {lastCreatedID: lastCreatedID}})
        return lastCreatedID
    }
}

function generaTokenJWT(user_id){
    return sign({ user_id: user_id, timestamp: new Date().getTime()}, "90628be6876cdbed544203e26c89ce931b10e1ca4163d41f7b6f4131b2c77bae0f9998d6fefa65d4570effdc12a36fce2bdf87ad3821714d1326798eff1d85ad")
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

function isValidDisplayNameOrHandle(name) {
    const nameRegex = /^[a-zA-Z0-9_.-]*$/
    return nameRegex.test(name)
}