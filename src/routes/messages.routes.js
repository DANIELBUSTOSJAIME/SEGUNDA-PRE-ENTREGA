import { messagesModel } from "../models/messages.models.js";
import { Router } from "express";

const messagesRouter = Router()

messagesRouter.get( '/', async (req, res) => {
    try{
        const messages = await messagesModel.find()
        res.status(200).send({respuesta: 'OK', mensaje: messages})
    } catch (error) {
        res.status(400).send({respuesta: "Error en consultar mensajes", mensaje: error})
    }
})

messagesRouter.post( '/', async (req, res) => {
    const {email, message} = req.body
    try{
        const messages = await messagesModel.create({email, message})
        res.status(200).send({respuesta: 'OK', mensaje: messages})
    } catch (error) {
        res.status(400).send({respuesta: "Error en crear mensaje", mensaje: error})
    }
})

export default messagesRouter