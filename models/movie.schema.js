const mongoose = require('mongoose')
const Schema = mongoose.Schema

const movieSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    releaseYears: {
        type: Number
    },
    genre: {
        type: String,
        required: true
    },
    duration: {
        type: Number
    },
    poster: {
        type: String
    },
    trailer: {
        type: String
    },
    synopsis: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Movie', movieSchema)