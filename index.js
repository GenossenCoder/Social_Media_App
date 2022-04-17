const {ApolloServer, PubSub}= require('apollo-server')
const mongoose = require('mongoose')

//sshjdhkahdkjashdjkhakhdkjqweqezquizeuiziziWadadasda
const typeDefs = require('./Graphql/typeDefs')
const resolvers = require('./Graphql/resolvers')

const PORT = process.env.PORT || 4000

const server =new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req})=>({req})
});
mongoose.connect(process.env.MONGOURI,{useNewURLParser:true})
    .then(()=>{
        console.log('mongodb')
        return server.listen(PORT)
    }).then(res=>{
        console.log(`listening on port ${res.url}`)
    })

    