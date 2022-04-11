const {ApolloServer, PubSub}= require('apollo-server')
const mongoose = require('mongoose')


const typeDefs = require('./Graphql/typeDefs')
const resolvers = require('./Graphql/resolvers')


const server =new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req})=>({req})
});
mongoose.connect('mongodb+srv://adim:WknSllcgkPnBuuR1@cluster0.uw8iy.mongodb.net/Talk_Active?retryWrites=true&w=majority',{useNewURLParser:true})
    .then(()=>{
        console.log('mongodb')
        return server.listen({port:5000})
    }).then(res=>{
        console.log(`listening on port ${res.url}`)
    })

    