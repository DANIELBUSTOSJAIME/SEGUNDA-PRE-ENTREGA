import { Router } from "express";
import { userModel } from "../models/user.models.js";

const sessionRouter = Router()

sessionRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      if (req.session.login) {
        // res.status(200).send({ respuesta: 'Login ya existente' });
        res.send(`<script>alert("Usted ya esta logeado, sera redirigido"); window.location.href="/products";</script>`);
      } else {
        const user = await userModel.findOne({ email: email });
        if (user) {
          if (user.password == password) {
            req.session.login = true;
            res.send(`
            <script>
              alert("Bienvenido ${user.name} ${user.lastName}");
              window.location.href = "/products";
            </script>
          `);
        } else {
            res.send('<script>alert("Contraseña inválida"); window.location.href="/login";</script>');
            //res.status(401).send({ respuesta: 'Contraseña inválida' });
          }
        } else {
            res.send('<script>alert("Usuario inválido"); window.location.href="/login";</script>');
            //res.status(404).send({ respuesta: 'Usuario no encontrado' });
        }
      }
    } catch (error) {
      res.status(400).send({ error: `Error en el inicio de sesión: ${error}` });
    }
  });

  sessionRouter.get('/logout', (req, res) => {
    if (req.session.login) {
      req.session.destroy();
    }
    res.redirect('/login');
  });


export default sessionRouter