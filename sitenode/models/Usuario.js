const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    password: {
        type:String,
        required: true
    },
    collection: 'frases'
})

mongoose.model('usuarios' , usuario)