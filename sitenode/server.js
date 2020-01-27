if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
const bcrypt = require('bcrypt')
const passport = require('passport')
const initizalizePassport = require('./passport-config')
const flash = require('express-flash')
const session = require('express-session')
const mongoose = require('mongoose')

const app = express();

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

var db
mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://matheus:senhabanco@bancodasfrases-u2470.mongodb.net/test?retryWrites=true&w=majority').then(() =>{
    console.log('Conectou junto')
    mongoose.collection('quotes').find().toArray(function(err, results) {
        console.log(results) 
    })
}).catch((err) => {
    console.log(err)
    console.log('Não conectou')
})

MongoClient.connect('mongodb+srv://matheus:senhabanco@bancodasfrases-u2470.mongodb.net/test?retryWrites=true&w=majority', (err, client) => {
    if (err) return console.log(err)
    db = client.db('BancoDasFrases')
    app.listen(3000, () =>{
        console.log("Esta na porta 3000 nice!!")
    })
    //db.collection('quotes').find().toArray(function(err, results) {   Esses comentários server pra mostrar os
        //console.log(results)                                          Treco do banco no cmd
        // send HTML file populated with quotes here
      //})
})


 initizalizePassport(passport,
    nome  => db.collection('frases').find({nome:nome}).toArray().then(token => {return token})
)

// Funções da página index

app.get('/', (req, res) => {
    var cursor = db.collection('quotes').find().toArray((err, result) =>{
        if (err) return console.log(err)
        res.render('index.ejs', {quotes: result})
    })
    
})

app.post('/quotes', (req, res) => {
    db.collection('quotes').save(req.body, (err, result) => {
        if (err) return console.log(err)

        console.log('Salvou no banco muleque')
        res.redirect('/home_funcionario.ejs')
    })
})

app.put('/quotes', (req, res) => {
    db.collection('quotes').findOneAndUpdate(
        {
            name: 'matheus'
          },
          {
            $set: {
              name: req.body.name,
              quote: req.body.quote
            }
          },
          {
            sort: {_id:-1},
            upsert: true
          },
          (err, result) => {
            if (err) return res.send(err)
            res.send(result)
          }
        
      )
})

app.delete('/quotes', (req, res) => {
    db.collection('quotes').findOneAndDelete(
        {
            name: req.body.name
        },
        (err, result) => {
            if (err) return res.send(500, err)
            res.send({message: 'A darth vadar quote got deleted'})
          })
  })

// fim das funções do index

// Funções da tela do funcionario já logado
app.get('/home_funcionario.ejs', (req, res) => {
    var cursor = db.collection('frases').find().toArray((err, result) =>{
        if (err) return console.log(err)
        res.render('home_funcionario.ejs', {frases: result})
    })
    
})

// Funções da tela de login do funcionario

app.get('/login.ejs', (req, res) => {
        res.render('login.ejs')
    })

app.post('/login' , passport.authenticate('local', {
    successRedirect: '/home_funcionario.ejs',
    failureRedirect: '/login.ejs',
    failureFlash: true
})
)

// Funções da tela de registro de funcionarios

app.get('/registro.ejs' , (req,res) => {
    res.render('registro.ejs')
})

app.post('/registro' , async (req,res) => {
    try {
        const hashsenha = await bcrypt.hash(req.body.password, 10)
        body = {
            'nome': req.body.nome,
            'password': hashsenha}
        db.collection('frases').insertOne(body , (err, result) => {
            res.redirect('/login.ejs')
        })
    } catch {
        res.redirect('/registro.ejs')
    }
    req.body.nome
    req.body.password
})

