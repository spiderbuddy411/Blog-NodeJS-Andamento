const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model("postagens")


// Pagina Inicial
router.get('/', (req, res) => {
    res.render('admin/index.handlebars')
    
})

//posts
router.get('/posts', (req, res) => {
    res.send('Pagina Post')
})

//pagina categorias,  contem as categorias criadas / criar nova categoria / editar a categoria
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

// carregar Categorias
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

// Listar todas as postagem
router.get("/postagens", (req, res)=>{
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
})
// Carregar a Postagem
router.get("/postagens/add", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias})
    })
    
})

// Criar uma Nova postagem
router.post("/postagens/nova", function(req, res) {
    var erros = [];
  
    if (req.body.categoria == "0") {
      erros.push({ texto: "Categoria invalida, registre uma categoria" });
    }
    if (erros.length > 0) {
      res.render("admin/addpostagens", { erros: erros });
    } else {
      const novaPostagem = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria,
        slug: req.body.slug
      };
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com Sucesso!")
            res.redirect("/admin/postagens")

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro em salvar a postagem")
            res.redirect("/admin/postagens")
        })
    }
})

// Carregar a postagem
router.get("/postagens/edit/:id", (req, res)=>{
    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{
       Categoria.find().lean().then((categorias)=>{
          res.render("admin/editpostagens",{categorias: categorias, postagem: postagem})
       }).catch((err)=>{
          req.flash("error_msg","houve um problema ao listar as categorias")
          res.redirect("/admin/postagens")
       })
    }).catch((err)=>{
       req.flash("error_msg","Erro na edição da Postagem"+err)
       res.redirect("/admin/postagens")
    })
 })

 // Editar Postagens
router.post("/postagens/edit", (req, res) => {

        Postagem.findOne({_id: req.body.id}).then((postagem) => {
            
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.categoria = req.body.categoria
            postagem.conteudo = req.body.conteudo                        
            
        postagem.save().then(() => {
            req.flash("success_msg", "editado com sucesso")
            res.redirect("/admin/postagens");

        }).catch((err) => {
            req.flash("error_msg", "houve um erro interno no save!")
            res.redirect("/admin/postagens");
        })
    
        }).catch((err)=>{
            
            req.flash("error_msg","erro ao salvar a edição da postagem  ")
            res.redirect("/admin/postagens")
        })

})

// Deletar a Postagem
router.get("/postagens/deletar/:id", (req, res) => {
  Postagem.remove({_id: req.params.id}).then(() => {
    req.flash("success_msg", "Postagem deletar com sucesso!")
    res.redirect("/admin/postagens")    

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro Interno em deletar a Postagem")
        res.redirect("/admin/postagens")   
    })
}) 


// Deletar a Postagem






//Nao deve ser retirado.
module.exports = router