const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate-v2')

const movieSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    releaseYear: {
        type: Number
    },
    genre: {
        type: Array,
        required: true,
        default:[]
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
movieSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Movie', movieSchema)