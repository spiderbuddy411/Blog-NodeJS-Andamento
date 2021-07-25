// Import LocalStrategy
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//model de usuario
require('../models/usuario');
const Usuario = mongoose.model('usuarios');


module.exports = function(passport) {

    passport.use(new localStrategy({usernameField: 'email', passwordFild: 'senha'}, (email, senha, done) => {
        
        Usuario.findOne({email: email}).then((usuario) => {
            if(!usuario){
                
                return done(null, false, {message: "Usuario ou senha errados"})
                
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {

                if(batem){
                    
                    return done(null, usuario);
                }else{
                    
                    return done(null, false, {message: "Usuario ou senha errados"});
                }

            })


        })

    }))  
    
   

    passport.serializeUser((usuario, done) => {

        done(null, usuario.id);

    })

    passport.deserializeUser((id, done) => {
        user.findById(id, (err, usuario) => {
            done(err, usuario);
        });
    })

}