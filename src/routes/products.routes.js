import { productModel } from "../models/products.models.js";
import { Router } from "express";

const productRouter = Router()

productRouter.get( '/', async (req, res) => {
    // RUTA POSTMAN - http://localhost:8080/api/products/?limit=15&page=2&sort=asc&category=games
    const {limit, page, sort, category} = req.query
    try{
        let query = {}
        if(category){
            query.category = category
        }
        let options = {
            limit: parseInt(limit) || 10,
            page: parseInt(page) || 1
        };
        if(sort){
            options.sort = {
                price: sort === 'asc' ? 1 : -1
            };
        }
        const paginateProductResult = await productModel.paginate(query, options)
        console.log(paginateProductResult)
        res.status(200).send({respuesta: 'OK', mensaje: paginateProductResult})
    } catch (error) {
        res.status(400).send({respuesta: "Error en consultar productos", mensaje: error})
    }
})

productRouter.get( '/:id', async (req, res) => {
    const {id} = req.params
    try{
        const product = await productModel.findById(id)
        if(product)
            res.status(200).send({respuesta: 'OK', mensaje: product})
        else
            res.status(404).send({respuesta: 'Error en consultar producto', mensaje:"Product Not Found",})
    } catch (error) {
        res.status(400).send({respuesta: "Error en consultar producto", mensaje: error})
    }
})

productRouter.post( '/', async (req, res) => {
    const {title, description, price, code, stock, category } = req.body
    try{
        const prod = await productModel.create({title, description, price, code, stock, category})
        res.status(200).send({respuesta: 'OK', mensaje: prod})
    } catch (error) {
        res.status(400).send({respuesta: "Error en crear producto", mensaje: error})
    }
})

productRouter.put( '/:id', async (req, res) => {
    const {id} = req.params
    const {title, description, price, code, status, stock, category } = req.body
    try{
        const product = await productModel.findByIdAndUpdate(id, {title, description, price, code, status, stock, category })
        if(product)
            res.status(200).send({respuesta: 'OK', mensaje: product})
        else
            res.status(404).send({respuesta: 'Error en actualizar producto', mensaje:"Product Not Found",})
    } catch (error) {
        res.status(400).send({respuesta: "Error en actualizar producto", mensaje: error})
    }
})

productRouter.delete( '/:id', async (req, res) => {
    const {id} = req.params
    try{
        const products = await productModel.findByIdAndDelete(id)
        if(products)
            res.status(200).send({respuesta: 'OK', mensaje: products})
        else
            res.status(404).send({respuesta: 'Error en eliminar producto', mensaje:"Product Not Found",})
    } catch (error) {
        res.status(400).send({respuesta: "Error en eliminar producto", mensaje: error})
    }
})

export default productRouter