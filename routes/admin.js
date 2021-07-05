const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')


// Pagina Inicial
router.get('/', (req, res) => {
    res.render('admin/index.handlebars')
    
})

//posts
router.get('/posts', (req, res) => {
    res.send('Pagina Post')
})

//pagina categorias, ontem contem as categorias criadas / criar nova categoria / editar a categoria
router.get('/categorias', (req, res) => {

    Categoria.find().sort({date:'desc'}).then((categorias) => {
        //Essa linha abaixo salvou o mundo, pois nao e mais permitido passar diretamente o parametro para ser acessado na view, por questoes de seguranca.
        res.render('./admin/categorias', {categorias: categorias.map(Categoria => Categoria.toJSON())})        

    }).catch((err) => {

        console.log("Erro listar categorias! : " + err)

    });

   

})
// Pagina de adicionar uma nova categoria
router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias.handlebars')
})

// Salvar a categoria no banco de dados
router.post('/categorias/nova', (req, res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})

    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria Crianda com sucesso!")
            res.redirect("/admin/categorias")
        }).catch(() => {
            req.flash("error_msg", "Houve um erro ao salvar categoria ou nome, tente novamente!")
            res.redirect("/admin")
        })
    }
})

// Editar Categorias
router.get("/categorias/edit/:id", (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategoria', {categoria:categoria})
    }).catch((err) => {
        req.flash("error_msg", "!!!Esta categoria não existe!!!")
        res.redirect("/admin/categorias")
    })
    //res.render("admin/editcategoria")
})
// Editar Categorias
router.post("/categorias/edit", (req, res) => {

    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria Editada com Sucesso!!")
            res.redirect("/admin/categorias")


        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro em editar categoria")
        res.redirect("/admin/categorias")
    })
})

// Routa de deletar post

router.post("/categorias/deletar", (req, res) => {
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria Deletada com Sucesso!!")
        res.redirect("/admin/categorias")
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro em deletar categoria tente novamente")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", (req, res) => {
    res.render("admin/postagens")
})

router.get("/postagens/add", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias})
    })
    
})

router.post("/postagens/nova", (req, res) => {

    var erros = []

    if(req.body.categoria == '0') {
        erros.push({text: "Categoria inválida"})
    }else{
        
    }
})




module.exports = router