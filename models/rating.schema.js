const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ratingSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        ref: 'Movie'
    },
    avgRating: Number
})

module.exports = mongoose.model('Rating', ratingSchema) 