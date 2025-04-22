import express, { json } from "express"; const app = express(); app.use(json())
import http from "http"; const server = http.createServer(app);
import { Server } from "socket.io"; 
const io = new Server(server, { cors: { origin: "http://localhost:4200", methods: ["GET", "POST"]}});
import { connectToDatabase } from "./db.js"; let db
import rateLimit from 'express-rate-limit'
import { PeerServer } from 'peer'
import * as UTILS from './utility.js'

startServer(3333)

const users = {}

async function startServer(PORT){

    try{
        db = await connectToDatabase()
        await UTILS.setDBConnection()

        io.listen(3332)
        const peerServer = PeerServer({ path: '/peerjs', port: 3331, secure: false, allow_discovery: true })
        app.listen(PORT, ()=>{ console.debug(`‎ \n Server backend avviato | Port: ${PORT} \n ---------------------------------------------------------`) })

        const limiter = rateLimit({ windowMs: 1000 * 60, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false })
        app.use(limiter)
        
        app.use((req, res, next) => {        
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Body')
            rateLimit
            next()
        })

        //* API list
        app.get('/test', (req, res) => { console.debug('API works'); res.send('API works') })
        app.post('/userCreateAccount', (req, res) => { handleApi_userCreateAccount(req, res) })
        app.post('/userLogin', (req, res) => { handleApi_userLogin(req, res) })
        app.post('/checkUserTokenValidity', (req, res) => { handleApi_checkUserTokenValidity(req, res) })

        app.post('/basicUserInterfaceData', UTILS.verifyJWT, (req, res) => { handleApi_basicUserInterfaceData(req, res) })
        app.post('/ChatInfoMessages', UTILS.verifyJWT, (req, res) => { handleApi_ChatInfoMessages(req, res) })
        app.post('/tryToSendFriendRequest', UTILS.verifyJWT, (req, res) => { handleApi_tryToSendFriendRequest(req, res) })
        app.post('/acceptFriendRequest', UTILS.verifyJWT, (req, res) => { handleApi_acceptFriendRequest(req, res) })
        app.post('/deleteFriendRequest', UTILS.verifyJWT, (req, res) => { handleApi_deleteFriendRequest(req, res) })
        app.post('/removeFriend', UTILS.verifyJWT, (req, res) => { handleApi_removeFriend(req, res) })
        app.post('/blockUser', UTILS.verifyJWT, (req, res) => { handleApi_blockUser(req, res) })
        app.post('/removeBlockFromUser', UTILS.verifyJWT, (req, res) => { handleApi_removeBlockFromUser(req, res) })


        //* Socket.io
        io.on('connection', (socket) => {

            socket.on('connected', (token) => {
                const decoded = UTILS.compareVerifyJWT(token)
                users[decoded.user_id] = socket.id
            })

            socket.on('personal_message', async (data) => {
                if (users[data.receiver] !== null) {

                    data.content = UTILS.sanitizeMessage(data.content)
                    if (data.attachments) {
                        data.attachments = UTILS.sanitizeMessage(data.attachments)
                        data.attachments.replace(/javascript:/g, '')
                    }

                    const message = {
                        "message_id": await UTILS.generateID(),
                        "content": data.content,
                        "attachments": null,
                        "sender": data.sender,
                        "receiver": data.receiver,
                        "timestamp": new Date().getTime()
                    }

                    if (data.attachments) {
                        message.attachments = data.attachments
                    }

                    let op1 = await db.collection('chats').findOne({users_id: [data.sender, data.receiver]})
                    let op2 = await db.collection('chats').findOne({users_id: [data.receiver, data.sender]})

                    if (Number(op1?.chat_id) !== Number(data.chat_id) && Number(op2?.chat_id) !== Number(data.chat_id)) {
                        console.debug('id chat non corrisponde ai due utenti')
                        return
                    }
                
                    const op = await db.collection('chats').updateOne(
                        { chat_id: data.chat_id},
                        { $push: { messages: message }}
                    )

                    const senderSocketId = users[data.sender]
                    const receiverSocketId = users[data.receiver]
                    io.to(senderSocketId).emit('personal_message_received', message)
                    io.to(receiverSocketId).emit('personal_message_received', message)
                }
                
            })

            socket.on('delete_message', async (data) => {

                if (users[data.message_id] !== null) {

                    let op = await db.collection('chats').findOne( { chat_id: data.chat_id }, { projection: { messages: { $elemMatch: { message_id: data.message_id } } } })
                    if (op == null) {
                        return
                    }

                    
                    if (data.sender !== op.messages[0].sender) {
                        return
                    }
                    
                    const currentTimestamp = Date.now()
                    if (currentTimestamp - op.messages[0].timestamp > 10 * 60 * 1000) {
                        data.content = "[[Questo messaggio è stato eliminato dal creatore]]"
                        await db.collection('chats').updateOne( 
                            { chat_id: data.chat_id, "messages.message_id": data.message_id }, 
                            { $set: { "messages.$.content": data.content, "messages.$.attachments": null }} 
                        )
                    } else {
                        await db.collection('chats').updateOne( { chat_id: data.chat_id }, { $pull: { messages: { message_id: data.message_id } } })
                    }


                    const senderSocketId = users[data.sender]
                    const receiverSocketId = users[data.receiver]
                    io.to(senderSocketId).emit('personal_message_deleted', {"message_id": data.message_id, "content": data.content})
                    io.to(receiverSocketId).emit('personal_message_deleted', {"message_id": data.message_id, "content": data.content})
                }
                
            })

            socket.on('edit_message', async (data) => {

                if (users[data.message_id] !== null) {

                    data.content = UTILS.sanitizeMessage(data.content)

                    let op = await db.collection('chats').findOne( { chat_id: data.chat_id }, { projection: { messages: { $elemMatch: { message_id: data.message_id } } } })
                    if (op == null) {
                        return
                    }

                    const currentTimestamp = Date.now()
                    if (currentTimestamp - op.messages[0].timestamp > 10 * 60 * 1000) {
                        return
                    }

                    if (data.sender !== op.messages[0].sender) {
                        return
                    }

                    await db.collection('chats').updateOne( { chat_id: data.chat_id, "messages.message_id": data.message_id }, { $set: { "messages.$.content": data.content }} )

                    const senderSocketId = users[data.sender]
                    const receiverSocketId = users[data.receiver]
                    io.to(senderSocketId).emit('personal_message_edited', {"message_id": data.message_id, "content": data.content})
                    io.to(receiverSocketId).emit('personal_message_edited', {"message_id": data.message_id, "content": data.content})
                }
                
            })

            socket.on('start_personal_call', async (data) => {
                const receiverSocketId = users[data.receiver]

                if (receiverSocketId !== undefined) {
                    io.to(receiverSocketId).emit('personal_call_started', data)
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


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_userCreateAccount(req, res){
    const { user_email, user_password, user_handle, user_displayName } = req.body

    if (!UTILS.isValidEmail(user_email) || !UTILS.isValidHandle(user_handle) || !UTILS.isValidDisplayName(user_displayName)) {
        return res.sendStatus(400).json({ message: 'Account non creato, email / handle / displayname non valid' })
    }
    
    let isHandleAlredyTakenDB = await db.collection('users_info').findOne({ user_handle: user_handle })
    if (isHandleAlredyTakenDB !== null){
        return res.sendStatus(400).json({ message: 'account non creato, handle gia usato'})
    }
    
    let isEmailAlredyPresentDB = await db.collection('users_info').findOne({ user_email: user_email })
    if (isEmailAlredyPresentDB !== null){
        return res.sendStatus(400).json({ message: 'account non creato, email gia registrata'})
    }


    let saltHashedPassword = await UTILS.generaSaltHashedPassword(user_password)
    
    const new_user_id = await UTILS.generateID()
    const new_token = UTILS.generaTokenJWT(new_user_id)

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
        "notifications": {},
        "friend_requests_sent": []
    }

    const op = await db.collection('users_info').insertOne(user_info_doc)
    const op2 = await db.collection('users_interface').insertOne(user_interface_doc)

    if(op.acknowledged == false || op == null && op2.acknowledged == false || op2 == null){
        return res.status(404).json({ message: 'Errore del server, account non creato'})
    }

    res.status(201).json({ message: 'account creato correttamente', token: new_token, id: new_user_id})
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_userLogin(req, res){

    const { email, password } = req.body

    if(password == null || password == null){
        return res.status(401).json({ message: 'Credenziali errate/ Utente inesistente' })
    }

    const userDB = await db.collection('users_info').findOne({ user_email: email })
    if(userDB == null){
        return res.status(400).json({ message: 'Dati inviati nulli' })
    }

    let comparePassword = await UTILS.comparePassword(password, userDB.user_password)

    if(comparePassword){
        const newToken = UTILS.generaTokenJWT(userDB.user_id)

        await db.collection('users_info').updateOne({ user_id: userDB.user_id }, {$set: {token: newToken}})

        return res.status(200).json({ message: 'Loggato con successo!', token: newToken, id: userDB.user_id})
    }else{
        return res.status(401).json({ message: 'Credenziali errate/ Utente inesistente' })
    }

}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_checkUserTokenValidity(req, res){
    const { user_id } = req.body
    const authHeader = req.headers['authorization']
    const privateToken = authHeader && authHeader.split(' ')[1]

    const user_info = await db.collection('users_info').findOne({user_id: Number(user_id)})
    if (user_info === null){
        return res.status(404).json({ message: 'Utente non trovato' })
    }

    if (user_info.token === privateToken){
        res.status(202).json({ message: 'Token valido' })
    } else {
        res.status(401).json({ message: 'Token non valido' })
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_basicUserInterfaceData(req, res){
    const { user_id } = req.body

    if (user_id === null) {
        return res.status(404).json({ message: 'nessun id fornito' })
    }

    const user_interfaceDB = await db.collection('users_interface').findOne({ user_id: Number(user_id) })
    if (user_interfaceDB === null) {
        return res.status(200).json({ message: 'user esistente dati_interface ottenuti', user_interfaceDB: user_interfaceDB })
    }
    delete user_interfaceDB._id
    // delete user_interfaceDB.blocked
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


    const notifications_info = {}
    if (user_interfaceDB.notifications !== null || user_interfaceDB.notifications !== undefined) {
        if (user_interfaceDB.notifications?.friend_request !== undefined) {
            notifications_info.friend_request = []

            for (let friend_request of user_interfaceDB.notifications.friend_request) {
                const user_data = await db.collection('users_interface').findOne({ user_id: friend_request.user_id })
                notifications_info.friend_request.push({
                    user_id: user_data.user_id, user_handle: user_data.user_handle, user_logo: user_data.user_logo , timestamp: friend_request.timestamp
                })
            }
        }
    }
    user_interfaceDB.notifications = notifications_info


    if(user_interfaceDB !== null){
        res.status(200).json({ message: 'user esistente dati_interface ottenuti', user_interfaceDB: user_interfaceDB })
    }else{
        res.status(401).json({ message: 'user non esistente nel database' })
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_ChatInfoMessages(req, res) {
    const { chat_id, loadMessage } = req.body
    const JWTdata = req.JWTdata

    if (chat_id === null || chat_id === undefined) {
        return res.status(404).json({ message: 'chat_id non fornito' })
    }

    const loadMoreMessages = -50 * loadMessage
    const chat_info = await db.collection('chats').findOne({ chat_id: chat_id }, { projection: { messages: { $slice: loadMoreMessages } } })
    let user_chat_info

    if (Number(JWTdata.user_id) === Number(chat_info.users_id[1])) {
        user_chat_info = await db.collection('users_interface').findOne({ user_id: chat_info.users_id[0] })
    } else {
        user_chat_info = await db.collection('users_interface').findOne({ user_id: chat_info.users_id[1] })
    }

    res.status(200).json({ 
        chatMessages: chat_info.messages, 
        chatInfo: {user_id: user_chat_info.user_id, user_displayName: user_chat_info.user_displayName, user_logo: user_chat_info.user_logo}}
    )
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_tryToSendFriendRequest(req, res) {  //! pending_friend_requests -, socket.io
    const { friend_user_handle } = req.body
    const JWTdata = req.JWTdata
    
    const friend_user = await db.collection('users_info').findOne({ user_handle: friend_user_handle })
    
    if (!friend_user) {
        return res.status(404).json({ statusFriendRequest: 2 })
    }

    if (JWTdata.user_id == friend_user.user_id) {
        return res.status(403).json({ statusFriendRequest: 6 })
    }

    const friend_user_interface = await db.collection('users_interface').findOne({ user_handle: friend_user_handle })

    if (friend_user_interface.friends) {
        for(let friend of friend_user_interface.friends) {
            if (friend == JWTdata.user_id) {
                return res.status(402).json({ statusFriendRequest: 4 })
            }
        }
    }
    
    if (friend_user_interface.notifications) {
        if (friend_user_interface.notifications.friend_request) {
            for(let {user_id} of friend_user_interface.notifications.friend_request) {
                if (user_id == JWTdata.user_id) {
                    return res.status(401).json({ statusFriendRequest: 3 })
                }
            }
        }
    }

    if (friend_user_interface.blocked) {
        if (friend_user_interface.blocked) {
            for(let user_id of friend_user_interface.blocked) {
                if (user_id == JWTdata.user_id) {
                    return res.status(405).json({ statusFriendRequest: 5 })
                }
            }
        }
    }

    const timestamp = new Date()

    const sendRequest = await db.collection('users_interface').updateOne(
        { user_id: friend_user.user_id }, 
        {  $push: {"notifications.friend_request": { user_id: JWTdata.user_id, timestamp: timestamp, user_handle: 'prova', user_logo: ''} } } 
    )
    const recognizeRequest = await db.collection('users_interface').updateOne(
        { user_id: JWTdata.user_id }, 
        { $push: {"friend_requests_sent": friend_user.user_id } } 
    )

    if (!sendRequest || !recognizeRequest) {
        return res.status(500).json({ statusFriendRequest: 0 })
    }

    const receiverSocketId = users[friend_user.user_id]
    if (receiverSocketId !== undefined) {       
        const user_interface = await db.collection('users_interface').findOne({ user_id: Number(JWTdata.user_id) }) 
        io.to(receiverSocketId).emit('userInterface', {'type': "pending_friend_requests", 
            'user_id': JWTdata.user_id, 'user_handle': user_interface.user_handle, 'user_logo': user_interface.user_logo, 'timestamp': timestamp 
        })
    }

    res.status(200).json({ statusFriendRequest: 1 })
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handleApi_acceptFriendRequest(req, res) { //! pending_friend_requests -, socket.io
    const { friend_user_id } = req.body
    const JWTdata = req.JWTdata

    const friend_user_interface = await db.collection('users_interface').findOne({ user_id: friend_user_id })
    if (!friend_user_interface) {
        return
    }

    if (friend_user_interface.blocked) {
        for(let user_id of friend_user_interface.blocked) {
            if (Number(user_id) === Number(JWTdata.user_id)) {
                await db.collection('users_interface').updateOne( { user_id: JWTdata.user_id }, { $pull: { "notifications.friend_request": {user_id: friend_user_id}} } )
                return
            }
        }
    }

    friend_user_interface.friends.push(Number(JWTdata.user_id))

    const my_user_interface = await db.collection('users_interface').findOne({ user_id: Number(JWTdata.user_id) })

    my_user_interface.friends.push(Number(friend_user_id))

    await db.collection('users_interface').updateOne( { user_id: JWTdata.user_id }, { $pull: { "notifications.friend_request": {user_id: friend_user_id}} } )
    
    await db.collection('users_interface').updateOne( { user_id: JWTdata.user_id }, { $set: { friends:  my_user_interface.friends }} )
    await db.collection('users_interface').updateOne( { user_id: friend_user_id}, { $set: { friends:  friend_user_interface.friends }} )

    await db.collection('users_interface').updateOne( { user_id: friend_user_id }, { $pull: { "friend_requests_sent": JWTdata.user_id } } )
    
    const senderSocketId = users[JWTdata.user_id]
    const receiverSocketId = users[friend_user_id]
    if (receiverSocketId !== undefined) {        
        io.to(receiverSocketId).emit('userInterface', {'type': "add_friend", 
            'user_id': JWTdata.user_id, 'user_displayName': my_user_interface.user_displayName, 'user_logo': my_user_interface.user_logo
        })
    }
    if (senderSocketId !== undefined) {
        io.to(senderSocketId).emit('userInterface', {'type': "add_friend", 
            'user_id': friend_user_id, 'user_displayName': friend_user_interface.user_displayName, 'user_logo': friend_user_interface.user_logo
        })
    }


    res.status(200).json( {user_id: friend_user_interface.user_id, user_displayName: friend_user_interface.user_displayName, user_logo: friend_user_interface.user_logo} )
}

async function handleApi_deleteFriendRequest(req, res) {
    const { friend_user_id } = req.body
    const JWTdata = req.JWTdata

    let success = await db.collection('users_interface').updateOne( { user_id: JWTdata.user_id }, { $pull: { "notifications.friend_request": {user_id: friend_user_id}} } )
    if (!success) {
        return res.sendStatus(404)
    }
    res.sendStatus(200)
}

async function handleApi_removeFriend(req, res) {
    const { friend_user_handle } = req.body
    const JWTdata = req.JWTdata

    let success = await db.collection('users_interface').updateOne( { user_id: JWTdata.user_id }, { $pull: { "friends": friend_user_handle } } )
    let success2 = await db.collection('users_interface').updateOne( { user_id: friend_user_handle }, { $pull: { "friends": JWTdata.user_id } } )
    if (!success.acknowledged && !success2.acknowledged) {
        return res.sendStatus(404)
    }

    const senderSocketId = users[JWTdata.user_id]
    const receiverSocketId = users[friend_user_handle]
    if (receiverSocketId !== undefined) {        
        io.to(receiverSocketId).emit('userInterface', {'type': "removed_friend", 'user_id': JWTdata.user_id})
    }
    if (senderSocketId !== undefined) {
        io.to(senderSocketId).emit('userInterface', {'type': "removed_friend", 'user_id': friend_user_handle})
        return res.sendStatus(200)
    }

    res.sendStatus(500)
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function handleApi_blockUser(req, res) {
    const { user_id } = req.body
    const JWTdata = req.JWTdata

    let success = await db.collection('users_interface').updateOne( { user_id: JWTdata.user_id }, { $push: { "blocked": user_id } } )
    if (!success.acknowledged) {
        return res.sendStatus(404)
    }
    
    const senderSocketId = users[JWTdata.user_id]
    if (senderSocketId !== undefined) {
        io.to(senderSocketId).emit('userInterface', {'type': "blocked_user", 'user_id': user_id})
        return res.sendStatus(200)
    }

    res.sendStatus(500)
}

async function handleApi_removeBlockFromUser(req, res) {
    const { user_id } = req.body
    const JWTdata = req.JWTdata

    let success = await db.collection('users_interface').updateOne( { user_id: JWTdata.user_id }, { $pull: { "blocked": user_id } } )
    let success2 = await db.collection('users_interface').updateOne( { user_id: user_id }, { $pull: { "blocked": JWTdata.user_id  } } )
    if (!success.acknowledged && !success2.acknowledged) {
        return res.sendStatus(404)
    }

    const senderSocketId = users[JWTdata.user_id]
    if (senderSocketId !== undefined) {
        io.to(senderSocketId).emit('userInterface', {'type': "unblocked_user", 'user_id': user_id})
        return res.sendStatus(200)
    }

    res.sendStatus(500)
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

