import { Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },    
    lastName: {
        type: String,
        required: true,
        index: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.plugin(paginate)

export const userModel = model('user', userSchema)