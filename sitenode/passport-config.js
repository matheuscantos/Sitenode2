const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

require("../sitenode/models/Usuario.js")
const Usuario = mongoose.model('usuarios',null,'frases')

async function initialize(passport, getUserByNome) {

    const authenticateUser = async  (nome,password, done) => {
    
        Usuario.findOne({nome: nome}).then((user) => {
        
        console.log(user)
        if (!user) {
            return done(null, false, {message: "Usuario Não encontrado"})
        }

            try {
                bcrypt.compare(password, user.password, (erro,bate) => {
                    if(bate) {
                        return done(null, user)
                    } else {
                        return done(null, false, {message: 'Senha incorreta'})
                    }
                })
            } catch (error){
                return done(error)
            }
            
        })
    }
    passport.use(new LocalStrategy({usernameField: 'nome' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {})
}

module.exports = initialize