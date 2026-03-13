const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
    'title-en': {
        type: String,
        required: false,
    },
    'title-ar': {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        default: '',
    },
    sort: {
        type: Number,
        default: 1,
    },
    active: {
        type: Number,
        default: 1,  // 1 = active, 0 = inactive
    }
}, {
    timestamps: true,
    collection: 'slider'
});

module.exports = mongoose.model('Slider', sliderSchema);