import local from 'passport-local'
import passport from 'passport'
import GithubStrategy from 'passport-github2'
import jwt from 'passport-jwt'
import { createHash, validatePassword } from '../utils/bcrypt.js'
import { userModel } from '../models/user.models.js'

const LocalStrategy = local.Strategy
const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt

const initializePassport = () => {

    const cookieExtractor = req => {
        console.log(req.cookies)
        const token = req.cookies.jwtCookie ? req.cookies.jwtCookie : {}
        console.log(token)
        return token
    }

    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET
    }, async(jwt_payload, done) => {
        try{
            console.log(jwt_payload)
            return done(null, jwt_payload)
        } catch (error){
            return done(error)
        }
    }))

    passport.use('register', new LocalStrategy(
        {passReqToCallback: true, usernameField: 'email'}, async (req, username, password, done) =>{
            const {name, lastName, age, email} = req.body

            try{
                const user = await userModel.findOne({email: email})
                if(user){
                    return done(null, false)
                }
                const passwordHash = createHash(password)
                const userCreated = await userModel.create({
                    name: name,
                    lastName: lastName,
                    age: age,
                    email: email,
                    password: passwordHash
                })
                return done(null, userCreated)
            } catch (error) {
                return done(error)
            }
        }
        ))
        passport.use('login', new LocalStrategy(
            {usernameField: 'email'}, async (username, password, done) => {
                try{
                    const user = await userModel.findOne({email: username})

                    if(!user){
                        return done(null, false)
                    }
                    if(validatePassword(password, user.password)){
                        return done(null, user)
                    }

                    return done(null, false)

                } catch (error) {
                    return done (error)
                }
            }
        ))

        passport.use('github', new GithubStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.SECRET_CLIENT,
            callbackURL: process.env.CALLBACK_URL
        }, async (accessToken, refreshToken, profile, done) => {
            try{
                console.log(accessToken)
                console.log(refreshToken)
                console.log(profile._json.email)
                const user = await userModel.findOne({email: profile._json.email})
                if(user){
                    done(null, false)
                } else {
                    const userCreated = await userModel.create({
                        name: profile._json.name,
                        lastName: ' ',
                        email: profile._json.email,
                        age: 18,
                        password: createHash(profile._json.email + profile._json.name)
                    })
                    done(null, userCreated)
                }
            } catch (error){
                done(error)
            }
        }))
        
        passport.use('github-login', new GithubStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.SECRET_CLIENT,
            callbackURL: process.env.CALLBACK_URL
          }, async (accessToken, refreshToken, profile, done) => {
            try {
              console.log(accessToken);
              console.log(refreshToken);
              console.log(profile._json.email);
          
              const user = await userModel.findOne({ email: profile._json.email });
          
              if (!user) {
                done(null, false);
              } else {
                done(null, user);
              }
            } catch (error) {
              done(error);
            }
          }));
          
        passport.serializeUser((user, done) => {
            done(null, user._id)
        })

        passport.deserializeUser(async(id, done) => {
            const user = userModel.findById(id)
            done(null, user)
        })
}

export default initializePassport