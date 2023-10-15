import 'dotenv/config'
import jwt from 'jsonwebtoken'

export const generateToken = (user) => {

    const token = jwt.sign({user}, process.env.JWT_SECRET, {expiresIn: '12h'})
    return token
}

//generateToken({"_id":{"$oid":"65137db8a0315a1d7114931b"},"name":"Juan","lastName":"Perez","age":{"$numberInt":"30"},"email":"juan@juan.com","password":"$2b$15$hywudwhEzpdpzmfXRjwP3.iYW1P3kAzhQjP4B/2FBp5wdHtG/nyKK","rol":"user","__v":{"$numberInt":"0"}})

export const authToken = (req,res,next) => {
    const authHeader = req.headers.Authorization

    if(!authHeader){
        return res.status(401).send({error: 'Usuario no autenticado'})
    }

    const token = authHeader.split(' ')[1]

    jwt.sign(token, process.env.JWT_SECRET, (error, credential) => {
        if(error){
            return res.status(403).send({error: 'Usuario no autorizado, token invalido'})
        }
    })

    req.user = credential.user
    next()

}