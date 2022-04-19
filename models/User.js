const {model, Schema} = require('mongoose')
const userSchema= new Schema({
    username: String,
    password: String,
    email:String,
    createdAt:String,
    Posts:[
    {        
        id: String,
        createdAt: String,
        title: String,
    }
    ]
})
module.exports = model('User', userSchema);
