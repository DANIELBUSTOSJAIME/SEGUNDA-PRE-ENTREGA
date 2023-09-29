import { Router } from "express";
import passport from "passport";

const sessionRouter = Router()

sessionRouter.post('/login', passport.authenticate('login'), async (req, res) => {
    try{
      if(!req.user){
        res.status(401).send(`
      <script>
        alert("Usuario o contraseña invalidos");
        window.location.href = "/login";
      </script>
    `);
        //return res.status(401).send({mensaje: "Usuario invalido"})
      }
      req.session.user = {
        name: req.user.name,
        lastName: req.user.lastName,
        email: req.user.email,
        age: req.user.age,
      }
      const user = req.session.user;
    res.status(200).send(`
      <script>
        alert("Bienvenido ${user.name} ${user.lastName}");
        window.location.href = "/products";
      </script>
    `);
      //res.status(200).send({payload: req.user})
    } catch (error){
      res.status(500).send({mensaje: `Error al iniciar sesión ${error}`})
    }
  });

  sessionRouter.post('/signUp', passport.authenticate('register'), async (req, res) => {
    try{
      if(!req.user){
        return res.status(400).send({mensaje: "Usuario ya existente"})
        /*return res.send(`
      <script>
        alert("El email utilizado ya esta registrado");
        window.location.href = "/signUp";
      </script>
      `)*/}
      res.status(200).send({mensaje: "Usuario registrado"})
    } catch (error){
      res.status(500).send({mensaje: `Error al registrar usuario ${error}`})
    }
  });

  sessionRouter.get('/logout', (req, res) => {
    if (req.session.login) {
      req.session.destroy();
    }
    res.redirect('/login');
  });

  sessionRouter.get('/github', passport.authenticate('github', {scope: ['user:email']}), async (req, res) => {
    res.status(200).send({mensaje: "Usuario registrado"})
    res.redirect('/login');
  })

    sessionRouter.get('/githubCallback', passport.authenticate('github'), async (req, res) => {
    res.session.user = req.user
    res.status(200).send({mensaje: "Usuario logueado"})
  })

  sessionRouter.get('/github-login', passport.authenticate('github-login', { scope: ['user:email'] }));

  sessionRouter.get('/github-login/callback', passport.authenticate('github-login', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/products');
});

export default sessionRouter

//login sin passport 
/*const { email, password } = req.body;
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
    }*/