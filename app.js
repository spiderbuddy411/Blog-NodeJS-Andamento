const express = require('express');
//const handlebars = require('express-handlebars')
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const app = express();
const admin = require("./routes/admin")
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');


//Configurações
    //session(sessão)
    app.use(session({
        secret: "123",
        resave: true,
        saveUninitialized: true
    }));
    app.use(flash());

    app.use((req,res,next)=>{
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        next();
    });

    // Body-parser
    const urlencodedParse = express.urlencoded({extended: true}); 
    app.use(express.urlencoded({extended: true}))
    app.use(express.json())

    // HandleBars
    /*
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars');
    */
    const hbs = exphbs.create({
        defaultLayout: 'main', 
        extname: 'handlebars',
        handlebars: allowInsecurePrototypeAccess(Handlebars)
      });
  
  
      app.engine('handlebars', hbs.engine); 
      app.set('view engine', 'handlebars');
      app.set('views', 'views');

    // Conexão Mangoose
    mongoose.promisse = global.promisse
    mongoose.connect("mongodb://localhost/blogapp", { useNewUrlParser: true }).then(() => {
        console.log("Banco de dados Mongoose conectado")
    }).catch((err) => {
        console.log("Houve um erro "+err)
    })
    
    //Public

    //o parametro __dirname pega o caminho absoluto para a pasta public, o que envia erros de rotas e que guarda todos arquivos estáticos
    app.use(express.static(path.join(__dirname, "./public")))

    //criando um middleware
   // app.use((req, res, next) => {
   //     console.log("OI EU SOU UM MIDDLEWARE")
    //    next()
    //})

// Rotas
    // Rota Admin
    app.use('/admin', urlencodedParse, admin);


    // ROTA PRINCIPAL
    app.get('/', (req, res) => {
        res.send('Rota Principal')
    })

    // ROTA LISTA DE POST
    app.get('/posts', (req, res) => {
        res.send("Lista de Posts")
    })


// Outros
const PORT = 80
app.listen(PORT, () => {
    console.log('Servidor Rodando')
})