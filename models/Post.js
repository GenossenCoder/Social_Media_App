const {model, Schema} = require('mongoose')
const postSchema= new Schema({
    username: String,
    title: String,
    theme:String,
    content:String,
    createdAt:String,
    comments:[
        {
            username: String,
            title:String,
            createdAt:String,
            content:String,
            likes:[
                {
                    username: String,
                    createdAt:String,
                }
            ]
        }
    ],
    likes:[
        {
            username:String,
            createdAt:String,
        }
    ],
    user:{
        type: Schema.Types.ObjectId,
        ref:'users'
    }
});
module.exports = model('post', postSchema);
