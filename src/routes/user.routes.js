import { userModel } from "../models/user.models.js";
import { Router } from "express";

const userRouter = Router()

userRouter.get( '/', async (req, res) => {
    try{
        const users = await userModel.find.limit()
        res.status(200).send({respuesta: 'OK', mensaje: users})
    } catch (error) {
        res.status(400).send({respuesta: "Error en consultar usuario", mensaje: error})
    }
})

userRouter.get( '/:id', async (req, res) => {
    const {id} = req.params
    try{
        const user = await userModel.findById(id)
        if(user)
            res.status(200).send({respuesta: 'OK', mensaje: user})
        else
            res.status(404).send({respuesta: 'Error en consultar usuario', mensaje:"User Not Found",})
    } catch (error) {
        res.status(400).send({respuesta: "Error en consultar usuario", mensaje: error})
    }
})

userRouter.post( '/', async (req, res) => {
    const {name, lastName, age, email, password } = req.body
    try{
        const user = await productModel.create({name, lastName, age, email, password})
        res.status(200).send({respuesta: 'OK', mensaje: user})
    } catch (error) {
        res.status(400).send({respuesta: "Error en crear usuario", mensaje: error})
    }
})

userRouter.put( '/:id', async (req, res) => {
    const {id} = req.params
    const {name, lastName, age, email, password } = req.body
    try{
        const user = await userModel.findByIdAndUpdate(id, {name, lastName, age, email, password })
        if(user)
            res.status(200).send({respuesta: 'OK', mensaje: user})
        else
            res.status(404).send({respuesta: 'Error en actualizar usuario', mensaje:"User Not Found",})
    } catch (error) {
        res.status(400).send({respuesta: "Error en actualizar usuario", mensaje: error})
    }
})

userRouter.delete( '/:id', async (req, res) => {
    const {id} = req.params
    try{
        const user = await userModel.findByIdAndDelete(id)
        if(user)
            res.status(200).send({respuesta: 'OK', mensaje: user})
        else
            res.status(404).send({respuesta: 'Error en eliminar usuario', mensaje:"User Not Found",})
    } catch (error) {
        res.status(400).send({respuesta: "Error en eliminar usuario", mensaje: error})
    }
})

export default userRouter