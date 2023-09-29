import bcrypt from 'bcrypt'
import 'dotenv/config'

export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(parseInt(process.env.SALT)))

export const validatePassword = (passwordSend, passwordBDD) => bcrypt.compareSync(passwordSend, passwordBDD)

