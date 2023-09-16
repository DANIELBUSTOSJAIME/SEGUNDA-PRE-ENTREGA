// LIBRARYS
import express from 'express'
import path from 'path'
import { __dirname } from './path.js';
//import multer from 'multer';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from "mongoose";
import 'dotenv/config'

// ROUTES
import productRouter from "./routes/products.routes.js";
import cartRouter from "./routes/cart.routes.js";
import messagesRouter from "./routes/messages.routes.js";
import userRouter from './routes/user.routes.js';

// MODELS
import { messagesModel } from './models/messages.models.js';
import { productModel } from './models/products.models.js';
import { userModel } from './models/user.models.js';
import { cartModel } from './models/cart.models.js';

// EXPRESS
const app = express()
const PORT = 8080
const serverExpress = app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`)
})

// CONEXION MONGOOSE
mongoose.connect(process.env.MONGO_URL)
.then(async() => {
    console.log('BDD conectada')
    // FUNCION DE BUSQUEDA DE USERS CON EXPLAIN
    /*const searchUsers = await userModel.find({}).explain('executionStats')
    console.log(searchUsers)*/
    // FUNCION DE BUSQUEDA DE CART ID CON POPULATE
    /*const searchCart = await cartModel.findOne({_id: '6504f2bb668cabc0c38f1b90'})
    console.log(JSON.stringify(searchCart))*/
    // FUNCION DE PAGINATE EN USERMODEL
    /*const paginateResult = await userModel.paginate({password: '1234'}, {limit: 20, page: 2, sort: {age: 'asc'}})
    console.log(paginateResult)*/
})
.catch(() => console.log('Error en conexion con BDD'))

// MIDLEWEARES
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname + '/public'))

// CONFIG HANDLEBARS
app.engine('handlebars', engine()) 
app.set('view engine', 'handlebars')
app.set('views', path.resolve(__dirname, './views'))

// ROUTES
app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/user', userRouter)

// SOCKET.IO
const io = new Server(serverExpress)

let listProducts = []
const cargarProd = async () => {
    try{
        listProducts = await productModel.find().lean();
    } catch (error){
        console.error("Error: not product found");
    }
}
cargarProd();

let cartProducts = []
const cargarCart = async () => {
    try{
        cartProducts = await cartModel.find().lean();
    } catch(error){
        console.error("Error: not cart found")
    }
}
cargarCart();

io.on('connection', async (socket) => {
    console.log("Servidor Socket.io conectado")
    
    socket.emit('products', listProducts);

    socket.on('addProd', async prod => {
        const { title, description, price, code, stock, category } = prod;
        console.log('Producto agregado:', prod);
        return await productModel.create({title: title, description: description, price: price, code: code, stock: stock, category: category})
    });

    socket.on('update-products', async ({ _id, title, description, price, code, stock, status }) => {
        try {
          await productModel.findByIdAndUpdate(_id, { title, description, price, code, stock, status });
          const products = await productModel.find().lean();
          socket.emit('show-products', products);
        } catch (error) {
          console.error('Error actualizando productos:', error);
        }
      });
      
      socket.on('delete-product', async ({ _id }) => {
        try {
          await productModel.deleteOne({ _id });
          const products = await productModel.find().lean();
          socket.emit('show-products', products);
        } catch (error) {
          console.error('Error eliminando producto:', error);
        }
      });

    socket.on('add-message', async ({email, mensaje}) => {
        console.log(mensaje)
        await messagesModel.create({email: email, message: mensaje})
        const messages = await messagesModel.find();
        socket.emit('show-messages', messages);
    })

    socket.on('display-inicial', async() =>{
        const messages = await messagesModel.find();
        socket.emit('show-messages', messages);
    })
})

// RENDER
app.get('/home', (req, res) =>{
    res.status(200).render('home', {
        title: "Inicio",
        products: listProducts,
        css: "home.css",
        js: "home.js"
    })
})

app.get('/products', (req, res) =>{
    res.status(200).render('products', {
        title: "Lista de Productos",
        products: listProducts,
        css: "products.css",
        js: "products.js"
    })
})

app.get('/carts/:cid', (req, res) =>{
    res.status(200).render('carts', {
        title: "Carrito",
        products: cartProducts,
        css: "cart.css",
        js: "cart.js"
    })
})

app.get('/realTimeProducts', (req, res) => {
    res.status(200).render('realTimeProducts', {
        title: "Productos en Tiempo Real",
        js: "realTimeProducts.js",
        css: "realTimeProducts.css"
    })
})

app.get('/chat', (req, res) => {
    res.status(200).render('chat', {
        title: "Chat",
        js: "chat.js",
        css: "chat.css"
    })
})

// MULTER
/*const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/img')
    },
    filename: (req, file, cb) =>{
        cb(null, `${Date.now()}${file.originalname}`)
    }
})
const upload = multer ({ storage: storage})
app.post('/upload', upload.single('product'), (req, res) => {
    console.log(req.file)
    console.log(req.body)
    res.status(200).send("Imagen cargada")
})*/