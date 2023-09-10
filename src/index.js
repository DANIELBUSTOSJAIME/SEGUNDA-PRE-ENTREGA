// LIBRARYS
import express from 'express'
import path from 'path'
import { __dirname } from './path.js';
//import multer from 'multer';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from "mongoose";

// ROUTES
import productRouter from "./routes/products.routes.js";
import cartRouter from "./routes/cart.routes.js";
import messagesRouter from "./routes/messages.routes.js";

// MODELS
import { messagesModel } from './models/messages.models.js';
import { productModel } from './models/products.models.js';

// EXPRESS
const app = express()
const PORT = 8080
const serverExpress = app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`)
})

// CONEXION MONGOOSE
mongoose.connect('mongodb+srv://danielbustosjaime:<password>@cluster0.vjzswx8.mongodb.net/?retryWrites=true&w=majority')
.then(() => console.log('BDD conectada'))
.catch(() => console.log('Error en conexion con BDD'))

// MIDLEWEARES
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static(path.join(__dirname, '/public')))
console.log(path.join(__dirname + '/public'))

// CONFIG HANDLEBARS
app.engine('handlebars', engine()) 
app.set('view engine', 'handlebars')
app.set('views', path.resolve(__dirname, './views'))

// ROUTES
app.use('/api/products', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/messages', messagesRouter)

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

io.on('connection', async (socket) => {
    console.log("Servidor Socket.io conectado")
    
    socket.emit('products', listProducts);

    socket.on('addProd', async prod => {
        const { title, description, price, code, stock, category } = prod;
        console.log('Producto agregado:', prod);
        return await productModel.create({title: title, description: description, price: price, code: code, stock: stock, category: category})
    }
    )

    socket.on('update-products', async () => {
        const products = await productModel.find().lean();
        console.log(products)
        socket.emit('show-products', products);
    });

    socket.on('delete-product', async ({ code }) => {
        try {
            await productModel.deleteOne({ code: code });
            const products = await productModel.find().lean();
            socket.emit('show-products', products);
        }catch (error) {
            console.error('Error eliminando producto:', error);
        }

    })

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
        title: "Lista de Productos",
        products: listProducts,
    })
})
app.get('/realtimeproducts', (req, res) => {
    res.status(200).render('realTimeProducts', {
        title: "Productos en Tiempo Real"
    })
})

app.get('/chat', (req, res) => {
    res.status(200).render('chat', {
        title: "Chat"
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