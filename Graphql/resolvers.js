const bcrypt =require('bcryptjs');
const jwt = require('jsonwebtoken');
const {UserInputError} = require('apollo-server')


const Post = require('.././models/Post');
const User = require('.././models/User');
const {validateRegisterInput,validateLoginInput} = require('../util/validators')
const checkAuth = require('../util/user.auth')
const SECRET_KEY = process.env.SECRET_KEY

function jwtinit(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    },SECRET_KEY,{ expiresIn: '3h' })
}

const resolvers = {
    Query:{
        async getPosts(){
            try{
                const posts= await Post.find().sort({createdAt: -1});
                return posts;
            } catch(err){
                throw new Error(err)
            }
        },
        async getPost(_, { postId }) {
            try {
              const post = await Post.findById(postId);
              if (post) {
                return post;
              } else {
                throw new Error('Post not found');
              }
            } catch (err) {
                throw new Error('Post not found');
            }
          }
        },
    Mutation:{

        async createPost(_,{theme, title, content}, context){
            const user =checkAuth(context);
            if(theme.trim()===''){
                throw new Error('Theme must not be empty')
            }
            if(title.trim()===''){
                throw new Error('Title must not be empty')
            }
            if(content.trim()===''){
                throw new Error('Content must not be empty')
            }


            const newPost = new Post({
                user: user.id,
                username: user.username,
                createdAt: new Date().toDateString(),
                theme,
                title,
                content
            });

            const post = newPost.save();
            return post;
        },

        async login(_,{username,password}){
            const {valid, errors} = validateLoginInput(username,password)
            //Checking if all fields are valid
            if(!valid){
                throw new UserInputError('Errors', {errors})
            }
            //Checking if the user exists
            const user = await User.findOne({username})
            if(!user){
                errors.general = 'User not found';
                throw new UserInputError('User not found', {errors})
            }
            //Checking if the password is correct
            const match =await bcrypt.compare(password, user.password)
            if(!match){
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', {errors})
            }
            //Generating token
            const token = jwtinit(user)
            return{
                ...user._doc,
                id:user._id,
                token
            }
        },


        async register(_, {registerInput:{username,email,password,confirmPassword}},context, info)
        {
            //Validate Userinput
            const { valid, errors} = validateRegisterInput(username,email,password,confirmPassword)
            if(!valid){
                throw new UserInputError('Errors', {errors})
            }


            //Make sure the user doesnt already exist
            const user = await User.findOne({username});
            if(user){
                //The apollo-error is for the frontend so that it's esier to handle
                throw new UserInputError('Username is taken',{
                    errors:{
                        username: 'This username is taken'
                    }
                })
            }
            //Password Hash
            //hashes the password; 12 is the number of rounds
            password = await bcrypt.hash(password,12)
            //creating the new User 
            const newUser = new User({
                email,
                username,
                password,
                createdAt:new Date().toDateString()
            });
            //writing to the Database
            const res = await newUser.save();
            const token = jwtinit(res)
            return{
                ...res._doc,
                id:res._id,
                token
            }
        },
        async deletePost(_,{id},context){
            const user = checkAuth(context);

            try{
                const post = await Post.findById(id);
                if(user.username === post.username){
                    await post.delete();
                    return'Post delted'
                }
                else{
                    throw new AuthenticationError('Action not allowed')
                }
            }
            catch(err){
                throw new Error(err)
            }

        },
        createComment: async (_, { postId, content, title }, context) => {
            const { username } = checkAuth(context);
            if (content.trim() === '') {
              throw new UserInputError('Empty comment', {
                errors: {
                  body: 'Comment body must not empty'
                }
              });
            }
            if (title.trim() === '') {
                throw new UserInputError('Empty comment', {
                  errors: {
                    body: 'Title body must not empty'
                  }
                });
              }
      
            const post = await Post.findById(postId);
      
            if (post) {
              post.comments.unshift({
                content,
                title,
                username,
                createdAt: new Date().toDateString()
              });
              await post.save();
              return post;
            } else throw new UserInputError('Post not found');
        },
        async deleteComment(_, {postId, commentId}, context) {
            const {username} = checkAuth(context);
            const post = await Post.findById(postId);
            if(post){
                const commentIndex = post.comments.findIndex(c=>c.id===commentId);
                if(post.comments[commentIndex].username === username){
                    post.comments.splice(commentIndex, 1);
                    await post.save();
                    return post;
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            }
            else{
                throw new UserInputError('Post not found')
            }
        },
        async likeComment(_, {postId, commentId}, context) {
            const {username} = checkAuth(context);
            const post = await Post.findById(postId);
            if(post){
                const commentIndex = post.comments.findIndex(c=>c.id===commentId);
                if(post.comments[commentIndex]){
                    for(w in post.comments[commentIndex].likes){
                        if(post.comments[commentIndex].likes[w].username==username){
                            post.comments[commentIndex].likes.splice(w,1)
                            await post.save();
                            return post;
                        }
                    }
                    post.comments[commentIndex].likes.push({"username":username, "createdAt":new Date().toDateString()});
                    await post.save();
                    return post;
                } else {
                    throw new AuthenticationError('Comment not found')
                }
            }
        },
        async likePost(_,{postId},context){
            const {username} = checkAuth(context);
            const post = await Post.findById(postId)
            if(post){
                for(w in post.likes){
                    if(post.likes[w].username==username){
                        post.likes.splice(w,1)
                        await post.save();
                        return post;
                    }

                }
                post.likes.push({"username":username, "createdAt":new Date().toDateString()});
                await post.save();
                return post;
            }
            else{
                throw new UserInputError('Post not found')
            }
        }
   },  
}
module.exports = resolvers