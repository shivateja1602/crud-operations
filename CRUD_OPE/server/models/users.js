const mongoose=require('mongoose')
const UserSchema=new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: Number,
    role: {
        type: String,
        enum: ['user', 'admin', 'editor'],
        default: 'user'
    },
    imagePath: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
})

const UserModel=mongoose.model("users",UserSchema)
module.exports=UserModel