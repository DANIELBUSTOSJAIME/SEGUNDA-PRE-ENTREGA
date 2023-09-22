// LIBRARYS
import express from 'express'
import path from 'path'
import { __dirname } from './path.js';
//import multer from 'multer';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from "mongoose";
import 'dotenv/config'
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';

// ROUTES
import productRouter from "./routes/products.routes.js";
import cartRouter from "./routes/cart.routes.js";
import messagesRouter from "./routes/messages.routes.js";
import userRouter from './routes/user.routes.js';
import sessionRouter from './routes/session.routes.js';

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
app.use(cookieParser(process.env.SIGNED_COOKIE))
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        ttl: 60
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

// Autentificacion para ingresar a solo a rutas con login exitoso
const auth = (req, res, next) => {
    if (req.session.login) {
        next(); 
    } else {
        res.redirect('/login'); 
    }
}

// CONFIG HANDLEBARS
app.engine('handlebars', engine()) 
app.set('view engine', 'handlebars')
app.set('views', path.resolve(__dirname, './views'))

// ROUTES
app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/users', userRouter)
app.use('/api/sessions', sessionRouter)

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

    socket.on('addUser', async user => {
        const { name, lastName, age, email, password } = user;
        const existingUser = await userModel.findOne({ email: email });
        console.log(existingUser)
        if (existingUser) {
            socket.emit('userExists');
        } else {
            console.log('Usuario creado:', user);
            return await userModel.create({ name: name, lastName: lastName, age: age, email: email, password: password });
        }
    });

    socket.on('loginUser', async ({ email, password }) => {
        try {
          const user = await userModel.findOne({ email: email });
          if (user) {
            if (user.password == password) {
              socket.emit('loginSuccess', user);
            } else {
                socket.emit('loginError', 'Usuario o contraseña incorrectos'); 
            }
          } else {
            socket.emit('loginError', 'Usuario no encontrado'); 
          }
        } catch (error) {
          socket.emit('loginError', `Error en el inicio de sesión: ${error}`); 
        }
      });

    
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

// /PRODUCTS REQUIERE LOGIN EXITOSO PREVIO
app.get('/products', auth, (req, res) =>{
    res.status(200).render('products', {
        title: "Lista de Productos",
        products: listProducts,
        css: "products.css",
        js: "products.js"
    })
})

app.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid).populate('products.id_prod');
        if (cart) {
            const productsCart = cart.products.map(product => {
                return {
                    id_prod: {
                        title: product.id_prod.title,
                        price: product.id_prod.price
                    },
                    quantity: product.quantity
                }
            })
            res.status(200).render('carts', {
                title: "Carrito",
                products: productsCart,
                css: "carts.css",
                js: "carts.js"
            })
        } else {
            res.status(404).send("Carrito no encontrado");
        }
    } catch (error) {
        res.status(400).send("Error al obtener el carrito");
    }
})

app.get('/realTimeProducts', (req, res) => {
    res.status(200).render('realTimeProducts', {
        title: "Productos en Tiempo Real",
        js: "realTimeProducts.js",
        css: "realTimeProducts.css"
    })
})

app.get('/signUp', (req, res) => {
    res.status(200).render('signUp', {
        title: "Creacion de Usuario",
        js: "signUp.js",
        css: "signUp.css"
    })
})

app.get('/login', (req, res) => {
    res.status(200).render('login', {
        title: "Login",
        js: "login.js",
        css: "login.css"
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

/*const auth = (req, res, next)=> {
    if(req.session.email == "admin@admin.com" && req.session.password == "1234"){
        return next()
    }
    return res.send("No tenes acceso a esta ruta")
}

// COOKIES
app.get('/setCookie', (req, res) => {
    res.cookie('CookieCookie', 'Esto es una cookie', {maxAge: 10000, signed: true}).send('Cookie generada')
})
app.get('/getCookie', (req, res) => {
    res.send(req.signedCookies)
})
app.get('/session', (req, res) => {
    if(req.session.counter){
        req.session.counter++
        res.send(`Ingreso ${req.session.counter} veces`)
    }else{
        req.session.counter = 1
        res.send(`Ingreso por primera vez`)
    }
})

app.post('/login', (req, res) =>{
    const {email, password} = req.body
    req.session.email = email
    req.session.password = password
    console.log(req.session.email)
    console.log(req.session.password)
    res.send('Usuario logueado')
})

app.get('/admin', auth, (req, res) => {
    res.send('Sos admin')
})*/