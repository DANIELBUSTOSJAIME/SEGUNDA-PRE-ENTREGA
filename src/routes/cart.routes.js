import { cartModel } from "../models/cart.models.js";
import { productModel } from "../models/products.models.js";
import { Router } from "express";

const cartRouter = Router()

cartRouter.get( '/:id', async (req, res) => {
    const {id} = req.params
    try{
        const cart = await cartModel.findById(id)
        if(cart)
            res.status(200).send({respuesta: 'OK', mensaje: cart})
        else
            res.status(404).send({respuesta: 'Error en consultar carrito', mensaje:"Product Not Found",})
    } catch (error) {
        res.status(400).send({respuesta: "Error en consultar carrito", mensaje: error})
    }
})

cartRouter.post( '/', async (req, res) => {
    try{
        const cart = await cartModel.create({})
        res.status(200).send({respuesta: 'OK', mensaje: cart})
    } catch (error) {
        res.status(400).send({respuesta: "Error en crear carrito", mensaje: error})
    }
})

cartRouter.put('/:cid', async (req, res) => {
    const { cid } = req.params
    const productsArray = req.body.products
    if (!Array.isArray(productsArray)) {
        return res.status(400).send({ respuesta: 'Error', mensaje: 'Los productos deberian estar en un array' })
    }
    try {
        const cart = await cartModel.findById(cid)
        if (!cart) {
            throw new Error("Cart not found")
        }
        for (let prod of productsArray) {
            const indice = cart.products.findIndex(cartProduct => cartProduct.id_prod.toString() === prod.id_prod)
            if (indice !== -1) {
                cart.products[indice].quantity = prod.quantity
            } else {
                const exist = await productModel.findById(prod.id_prod)
                if (!exist) {
                    throw new Error(`Product with ID ${prod.id_prod} not found`)
                }
                cart.products.push(prod)
            }
        }
        const respuesta = await cartModel.findByIdAndUpdate(cid, cart)
        res.status(200).send({ respuesta: 'OK', mensaje: respuesta })
    } catch (error) {
        res.status(error.message.includes("Not found") ? 404 : 400).send({ respuesta: 'Error', mensaje: error.message })
    }
})

cartRouter.post( '/:cid/products/:pid', async (req, res) => {
    const {cid, pid} = req.params
    const {quantity} = req.body
    try{
        const cart = await cartModel.findById(cid)
        console.log(cart)
        if(cart){
            const prod = await productModel.findById(pid)
            console.log(prod)
            if(prod){
                const indice = cart.products.findIndex(product => product.id_prod.toString() === pid)
                if(indice != -1){
                    cart.products[indice].quantity = quantity
                } else{
                    cart.products.push({ id_prod: pid, quantity: quantity })
                }
                const respuesta = await cartModel.findByIdAndUpdate(cid, cart)
                res.status(200).send({respuesta: 'OK', mensaje: respuesta})
            } else {
                res.status(404).send({respuesta: 'Error en encontrar el producto', mensaje:"Product Not Found",})
            }   
        }
        else
            res.status(404).send({respuesta: 'Error en encontrar el carrito', mensaje:"Cart Not Found",})
    } catch (error) {
        res.status(400).send({respuesta: "Error en agregar producto al carrito", mensaje: error})
    }
})

cartRouter.delete( '/:cid', async (req, res) => {
    const {cid} = req.params
    try{
        await cartModel.findByIdAndUpdate(cid, {products: []})
        res.status(200).send({respuesta: 'OK', mensaje: 'Carrito vacio'})
    } catch (error) {
        res.status(400).send({respuesta: "Error en vaciar productos del carrito", mensaje: error})
    }
})

cartRouter.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartModel.findById(cid);
        if (cart) {
            const prod = await productModel.findById(pid);
            if (prod) {
                const indice = cart.products.findIndex(product => product.id_prod.toString() === pid);
                if (indice !== -1) {
                    cart.products.splice(indice, 1);
                }
                const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
                res.status(200).send({ respuesta: 'OK', mensaje: respuesta });
            }
        }
    } catch (error) {
        res.status(400).send({ respuesta: "Error en agregar producto al carrito", mensaje: error });
    }
})

cartRouter.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    try {
        const cart = await cartModel.findById(cid);
        if (cart) {
            const prod = await productModel.findById(pid);
            if (prod) {
                const indice = cart.products.findIndex(product => product.id_prod.toString() === pid);
                if (indice !== -1) {
                    cart.products[indice].quantity = quantity;
                } else {
                    cart.products.push({ id_prod: pid, quantity: quantity });
                }
            }
        }
        const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
        res.status(200).send({ respuesta: 'OK', mensaje: respuesta });
    } catch (error) {
        res.status(400).send({ respuesta: "Error en actualizar producto en el carrito", mensaje: error });
    }
})

export default cartRouter