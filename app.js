const express = require('express');
//const handlebars = require('express-handlebars') << ultrapassado
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const app = express();
const admin = require("./routes/admin")
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const { RSA_NO_PADDING } = require('constants');
require ('./models/Postagem')
const Postagem = mongoose.model('postagens')
require ('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require("passport")
require("./config/auth")(passport)


//Configurações
    //session(sessão)
    app.use(session({
        secret: "123", // Secret pass deve ser alterado para mais segura!!!
        resave: true,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    //Middeware
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
    const hbs = exphbs.create({
        defaultLayout: 'main', 
        extname: 'handlebars',
        handlebars: allowInsecurePrototypeAccess(Handlebars)
      });  
  
      app.engine('handlebars', hbs.engine); 
      app.set('view engine', 'handlebars');
      app.set('views', 'views');

    // Conexão Mangoose
    mongoose.promise = global.promise
    mongoose.connect("mongodb://localhost/blogapp", { useNewUrlParser: true }).then(() => {
        console.log("Banco de dados Mongoose conectado")
    }).catch((err) => {
        console.log("Houve um erro "+err)
    })
    
    //Public
    //o parametro __dirname pega o caminho absoluto para a pasta public, o que envia erros de rotas e que guarda todos arquivos estáticos
    app.use(express.static(path.join(__dirname, "./public")))

    // Rotas


    // ROTA PRINCIPAL Redirect para /404 error
    app.get('/', (req, res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro interno")
            res.redirect("/404")
        })
        
    })

	// Caminho do Slugs!!
    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem) {
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta Postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash('error_msg',"Houve um erro interno")
            res.redirect("/")
        })

    })
    // Linkar categorias ()
    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria) {

                Postagem.find({categoria: categoria._id}).then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens, categorias: categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Não foi posssivel Listar os Post")
                    res.redirect("/")
                })

            }else{
            req.flash("error_msg", "Houve um erro interno ou Categoria não existe")
            res.redirect("/")
            }

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ou Categoria não existe")
            res.redirect("/")
        })

    })

    // Rota de erro
    app.get("/404", (req, res) =>{
        res.send('error 404!')
    })

    // ROTA LISTA DE categorias
    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg","Houve um erro interno ao listar as categorias")
            res.redirect("/")
        })
    })


    // Rota Admin
    app.use('/admin', urlencodedParse, admin);
	
    // Rota usuario
    app.use('/usuarios', urlencodedParse, usuarios);


// Listen port configurado para 80, recomendado 445 => 445
const PORT = 80
app.listen(PORT, () => {
    console.log('Servidor Rodando')
})
