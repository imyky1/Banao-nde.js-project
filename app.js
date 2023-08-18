// Banao Node js project
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000

//Routers
const loginroutes = require('./routes/auth')
const postroutes = require('./routes/posts')
//models
const User = require('./models/User')

//keys
const {DB_URL} = require('./config/keys')

// Middleware to parse JSON request bodies
app.use(express.json());

mongoose.connect(DB_URL).then(()=>{
    console.log("mongo is connected")
}).catch((e)=>{
    console.log('error:',e)
})

//Routes Miiddelware
app.use('/',loginroutes)
app.use('/',postroutes)

app.listen(PORT,()=>{
    console.log("Listening on port 3000")
})
