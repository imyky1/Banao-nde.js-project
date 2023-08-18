const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date:{
        type:String
    },
    description: {
        type: String,
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    Comments:[{
        text : String,
        postedBy:{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        }
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = new mongoose.model('Post', postSchema)