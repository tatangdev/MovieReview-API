const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate-v2')

const reviewSchema = new Schema({
    movie: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rate: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})
reviewSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Review', reviewSchema) 