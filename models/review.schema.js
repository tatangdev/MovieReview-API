const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate-v2')

const reviewSchema = new Schema({
    movie:{
        type: Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    rate: {
        type: Number,
        default: 0,
        required:true
    },
    review:{
        type: String
    }
}, {
    timestamps: true
})
reviewSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Review', reviewSchema)