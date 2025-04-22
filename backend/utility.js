import { compare, hash, genSalt } from 'bcrypt'
import jwt from 'jsonwebtoken'; const { sign } = jwt;
import dotenv from 'dotenv'; dotenv.config(); const secretJWT = process.env.SECRET_JWT
import { getDatabaseConnection } from "./db.js"; let db

export async function setDBConnection() {
    db = getDatabaseConnection()
}

export function sanitizeMessage(message) {
    return message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/g, '')
}

export function generaTokenJWT(user_id){
    return sign({ user_id: user_id, timestamp: new Date().getTime()}, secretJWT)
}

const cacheJWT = {}

export async function verifyJWT(req, res, next){
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Token non fornito o malformato!" })
    }
    const token = authHeader.split(' ')[1]

    if (cacheJWT[token]) {
        req.JWTdata = cacheJWT[token]
        return next()
    }

    try {
        const decoded = compareVerifyJWT(token)
        req.JWTdata = decoded

        const user_info = await db.collection('users_info').findOne({user_id: Number(decoded.user_id)})

        if (user_info === null){
            return res.status(404).json({ message: 'Utente non trovato' })
        }
    
        if (user_info.token !== token){
            return res.status(401).json({ message: 'Token non valido' })
        } else {
            cacheJWT[token] = decoded
            return next()
        }

    } catch (error) {
        return res.status(403).json({ error: error })
    }

}

export function compareVerifyJWT(token) {
    return jwt.verify(token, secretJWT)
}

export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export function isValidHandle(name) {
    const nameRegex = /^[a-zA-Z0-9_.-]*$/
    return nameRegex.test(name)
}

export function isValidDisplayName(name) {
    const nameRegex = /^[a-zA-Z0-9_.-]+( [a-zA-Z0-9_.-]+)*$/
    return nameRegex.test(name)
}

export async function generaSaltHashedPassword(user_password){
    return await hash(user_password, await genSalt())
}

export async function comparePassword(password, password2) {
    return await compare(password, password2)
}

let lastCreatedID = null

export async function generateID(){
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
