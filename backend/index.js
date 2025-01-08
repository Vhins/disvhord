import express, { json } from "express"; const app = express(); app.use(json())
import http from "http"; const server = http.createServer(app);
import { Server } from "socket.io"; 
const io = new Server(server, { cors: { origin: "http://localhost:4200", methods: ["GET", "POST"]}});
import { connectToDatabase } from "./db.js"; let db
import jwt from 'jsonwebtoken'; const { sign } = jwt;
import rateLimit from 'express-rate-limit'
import { compare, hash, genSalt } from 'bcrypt'
const secretJWT = "90628be6876cdbed544203e26c89ce931b10e1ca4163d41f7b6f4131b2c77bae0f9998d6fefa65d4570effdc12a36fce2bdf87ad3821714d1326798eff1d85ad"

startServer(3333)

const users = {}

async function startServer(PORT){

    try{
        db = await connectToDatabase()

        io.listen(3332)
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
        app.post('/userLogin', (req, res) => { handleApi_userLogin(req, res) })
        app.post('/checkUserTokenValidity', (req, res) => { handleApi_checkUserTokenValidity(req, res) })

        app.post('/basicUserInterfaceData', verifyJWT, (req, res) => { handleApi_basicUserInterfaceData(req, res) })
        app.post('/ChatInfoMessages', verifyJWT, (req, res) => { handleApi_ChatInfoMessages(req, res) })


        //* Socket.io
        io.on('connection', (socket) => {

            socket.on('connected', (token) => {
                const decoded = jwt.verify(token, secretJWT)
                console.log('connesso tramite socket.io, user_id:', decoded.user_id)
                users[decoded.id] = socket.user_id
            })

            socket.on('personal_message', async (data) => {
                console.log('message: ' + data.content, 'sender: ' + data.sender, users[data.sender], 'receiver: ' + data.receiver, users[data.receiver])

                if (users[data.receiver] !== null) {
                    const message = {
                        "message_id": 33,
                        "content": data.content,
                        "attachments": null,
                        "sender": data.sender,
                        "receiver": data.receiver,
                        "timestamp": new Date().getTime()
                    }
                
                    const op = await db.collection('chats').updateOne(
                        { chat_id: 4},
                        { $push: { messages: message }}
                    )

                    const senderSocketId = users[data.sender]
                    const receiverSocketId = users[data.receiver]
                    io.to(senderSocketId).emit('personal_message_received', data)
                    io.to(receiverSocketId).emit('personal_message_received', data)
                }
                
            })

            socket.on('disconnect', () => {
                for (let userId in users) {
                    if (users[userId] === socket.id) { delete users[userId]; break }
                }
            })

        })

    }catch(error){
        console.error('Errore avviando il server backend:', error)
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_userCreateAccount(req, res){
    const { user_email, user_password, user_handle, user_displayName } = req.body

    if (!isValidEmail(user_email) || !isValidHandle(user_handle) || !isValidDisplayName(user_displayName)) {
        res.status(400).json({ message: 'Account non creato, email / handle / displayname non valid' })
        return
    }
    
    let isHandleAlredyTakenDB = await db.collection('users_info').findOne({ user_handle: user_handle })
    if (isHandleAlredyTakenDB !== null){
        res.status(400).json({ message: 'account non creato, handle gia usato'})
        return
    }
    
    let isEmailAlredyPresentDB = await db.collection('users_info').findOne({ user_email: user_email })
    if (isEmailAlredyPresentDB !== null){
        res.status(400).json({ message: 'account non creato, email gia registrata'})
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
        res.status(404).json({ message: 'Errore del server, account non creato'})
        return
    }

    res.status(201).json({ message: 'account creato correttamente', token: new_token, id: new_user_id})
    
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_userLogin(req, res){

    const { email, password } = req.body

    if(password == null || password == null){
        res.status(401).json({ message: 'Credenziali errate/ Utente inesistente' })
        return
    }

    const userDB = await db.collection('users_info').findOne({ user_email: email })
    if(userDB == null){
        res.status(400).json({ message: 'Dati inviati nulli' })
        return
    }

    let comparePassword = await compare(password, userDB.user_password)

    if(comparePassword){
        const newToken = generaTokenJWT(userDB.user_id)

        await db.collection('users_info').updateOne({ user_id: userDB.user_id }, {$set: {token: newToken}})

        res.status(200).json({ message: 'Loggato con successo!', token: newToken, id: userDB.user_id})
    }else{
        res.status(401).json({ message: 'Credenziali errate/ Utente inesistente' })
    }

}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function verifyJWT(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: "Token non fornito!" })
    }

    try {
        const decoded = jwt.verify(token, secretJWT)
        req.JWTdata = decoded

        const user_info = await db.collection('users_info').findOne({user_id: Number(decoded.user_id)})

        if (user_info === null){
            res.status(404).json({ message: 'Utente non trovato' })
            return
        }
    
        if (user_info.token === token){
            next()
        } else {
            res.status(401).json({ message: 'Token non valido' })
            return
        }
    } catch (error) {
        return res.status(403).json({ error: "Token non valido!" })
    }
}


async function handleApi_checkUserTokenValidity(req, res){
    const { user_id } = req.body
    const authHeader = req.headers['authorization']
    const privateToken = authHeader && authHeader.split(' ')[1]

    const user_info = await db.collection('users_info').findOne({user_id: Number(user_id)})

    if (user_info === null){
        res.status(404).json({ message: 'Utente non trovato' })
        return
    }

    if (user_info.token === privateToken){
        res.status(202).json({ message: 'Token valido' })
    } else {
        res.status(401).json({ message: 'Token non valido' })
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
    return sign({ user_id: user_id, timestamp: new Date().getTime()}, secretJWT)
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

function isValidHandle(name) {
    const nameRegex = /^[a-zA-Z0-9_.-]*$/
    return nameRegex.test(name)
}

function isValidDisplayName(name) {
    const nameRegex = /^[a-zA-Z0-9_.-]+( [a-zA-Z0-9_.-]+)*$/
    return nameRegex.test(name)
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_basicUserInterfaceData(req, res){
    const { user_id } = req.body

    if (user_id === null) {
        res.status(404).json({ message: 'nessun id fornito' })
        return
    }

    const user_interfaceDB = await db.collection('users_interface').findOne({ user_id: Number(user_id) })
    if (user_interfaceDB === null) {
        res.status(200).json({ message: 'user esistente dati_interface ottenuti', user_interfaceDB: user_interfaceDB })
        return
    }
    delete user_interfaceDB._id
    delete user_interfaceDB.blocked
    delete user_interfaceDB.servers_owned


    const friends_info = []
    for (const friend of user_interfaceDB.friends) {
        const friend_info = await db.collection('users_interface').findOne({ user_id: friend })
        if (friend_info === null) continue

        friends_info.push({
            user_id: friend_info.user_id,
            user_displayName: friend_info.user_displayName,
            user_logo: friend_info.user_logo
        })
    }
    user_interfaceDB.friends = friends_info


    const chats_info = []
    for (const chat of user_interfaceDB.chats) {
        const chat_info = await db.collection('chats').findOne({ chat_id: chat })
        if (chat_info === null) continue

        let user_chat_info 
        if (chat_info.users_id[0] === Number(user_id)) {
            user_chat_info = await db.collection('users_interface').findOne({ user_id: chat_info.users_id[1] })
        } else {
            user_chat_info = await db.collection('users_interface').findOne({ user_id: chat_info.users_id[0] })
        }


        chats_info.push({
            chat_id: chat_info.chat_id,
            chat_user_id: user_chat_info.user_id,
            user_displayName: user_chat_info.user_displayName,
            user_logo: user_chat_info.user_logo
        })
    }
    user_interfaceDB.chats = chats_info


    const servers_info = []
    for (const server of user_interfaceDB.servers_joined) {
        const server_info = await db.collection('servers').findOne({ server_id: server })
        if (server_info === null) continue

        servers_info.push({
            server_id: server_info.server_id,
            name: server_info.name,
            logo: server_info.logo
        })
    }
    user_interfaceDB.servers_joined = servers_info


    if(user_interfaceDB !== null){
        res.status(200).json({ message: 'user esistente dati_interface ottenuti', user_interfaceDB: user_interfaceDB })
    }else{
        res.status(401).json({ message: 'user non esistente nel database' })
        return
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_ChatInfoMessages(req, res) {
    const { chat_id } = req.body
    const JWTdata = req.JWTdata

    if (chat_id === null) {
        res.status(404).json({ message: 'chat_id non fornito' })
        return
    }

    const chat_info = await db.collection('chats').findOne({ chat_id: chat_id })

    let user_chat_info

    if (Number(JWTdata.user_id) === Number(chat_info.users_id[1])) {
        user_chat_info = await db.collection('users_interface').findOne({ user_id: chat_info.users_id[0] })
    } else {
        user_chat_info = await db.collection('users_interface').findOne({ user_id: chat_info.users_id[1] })
    }

    res.status(200).json({ chatMessages: chat_info.messages, chatInfo: {user_id: user_chat_info.user_id, user_displayName: user_chat_info.user_displayName, user_logo: user_chat_info.user_logo}})
    return
}
