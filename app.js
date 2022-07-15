const express = require('express')
//Express EJS Layouts
var expressLayouts = require('express-ejs-layouts');
//3rd party Middleware Morgan
var morgan = require('morgan')
//Import semua fungsi dari contact.js
const contacts = require('./contact.js');

const app = express()
const port = 3000

//Information using EJS
app.set('view engine', 'ejs')
app.set('layout', 'layout/layout');
app.use(expressLayouts)
app.use(express.urlencoded())

//Morgan dev
app.use(morgan('dev'))

app.use((req, res, next) => {
    console.log('Time:', Date.now())
    next()
  })

app.use(express.static('public'))

//Routes List
app.get('/', (req, res) => {
    res.render('index', 
    {
        nama: "Muhammad Adityo Fathur Rahim",
        title: 'Webserver EJS',
    });
})

app.get('/about', (req, res, next) => {
    res.render('about', {nama: "Muhammad Adityo Fathur Rahim",
    title: 'Webserver EJS'})
    // next()
})

app.get('/contact', (req, res) => {
    const cont = contacts.loadContact(); //Mendefinisikan variabel untuk menampung array dari contact.json
    res.render('contact', {nama: "Muhammad Adityo Fathur Rahim",
    title: 'Webserver EJS',
    cont})
})

//Route list tambah data contact
app.get('/contact/add', (req, res, next) => {
    res.render('add-contact', {title: 'Webserver EJS'})
})

//Menerima data input dari form
app.post('/contact', (req, res) => {
    console.log(req.body)
    res.send("New data is added")
})

//Route list ketika tombol detail ditekan pada sebuah baris data contact di halaman contact.ejs
app.get('/contact/:name', (req, res, next) => {
    //Variabel untuk menyimpan sebuah object dari data contact yang dipilih
    const cont = contacts.detailContact(req.params.name);
    res.render('detail', {title: 'Webserver EJS', cont})
})

//Jika url dimasukkan selain routes list yang tersedia
app.use('/', (req,res) => {
    res.status(404)
    res.send('Page not found: 404')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})