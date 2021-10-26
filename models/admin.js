const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passport = require('passport-local-mongoose');

const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
})

adminSchema.plugin(passport);

module.exports = mongoose.model('admin', adminSchema);