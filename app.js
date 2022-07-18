const express = require('express')
//Express EJS Layouts
var expressLayouts = require('express-ejs-layouts');
//3rd party Middleware Morgan
var morgan = require('morgan')
//Import semua fungsi dari contact.js
const contacts = require('./contact.js');
//Express Validator
const { body, validationResult, check } = require('express-validator');
const { default: isEmail } = require('validator/lib/isEmail.js');

//Module untuk flash message
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express()
const port = 3000

//Information using EJS
app.set('view engine', 'ejs');
app.set('layout', 'layout/layout');
app.use(expressLayouts);
app.use(express.urlencoded({extended: true}))

app.use(cookieParser('secret'));
app.use(
    session({
        cookie: {maxAge: 6000},
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());

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

app.get('/about', (req, res) => {
    res.render('about', {nama: "Muhammad Adityo Fathur Rahim",
    title: 'About Page'})
})

app.get('/contact', (req, res) => {
    const cont = contacts.loadContact(); //Mendefinisikan variabel untuk menampung array dari contact.json
    res.render('contact', {
        nama: "Muhammad Adityo Fathur Rahim",
        title: 'Contact Page',
        cont,
        msg: req.flash('msg'),
    })
})

//Route list tambah data contact
app.get('/contact/add', (req, res, next) => {
    res.render('add-contact', {title: 'Add Contact Page'})
})

//Menerima data input dari form Tambah Contact
app.post('/contact', [
    body('name').custom((value) => {
        const duplikat = contacts.checkDuplicate(value);
        if (duplikat) {
            throw new Error('Contact name is already used!');
        }
        return true;
    }),
    check('email', 'Email is invalid!').isEmail(), 
    check('mobile', 'Mobile Phone is invalid!').isMobilePhone('id-ID')],
    (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('add-contact', {
            title: "Add Contact Form",
            errors: errors.array(),
            tempParams: req.body,           //Parameter untuk menampung value sementara
        });
    } else {
        const newCont = req.body;
        // console.log(newCont)
        //Pesan flash untuk data berhasil ditambahkan
        req.flash('msg', 'Contact Data has been successfully saved!')
        contacts.saveContact(newCont.name, newCont.email, newCont.mobile)
        res.redirect('/contact');
    }
})

//Route list ketika tombol detail ditekan pada sebuah baris data contact di halaman contact.ejs
app.get('/contact/:name', (req, res) => {
    //Variabel untuk menyimpan sebuah object dari data contact yang dipilih
    const cont = contacts.detailContact(req.params.name);
    res.render('detail', {title: 'Detail Contact Page', cont})
})

//Route list ketika tombol edit ditekan pada halaman detail data contact
app.get('/contact/edit/:name', (req, res) => {
    //Variabel untuk menyimpan sebuah object dari data contact yang dipilih
    const cont = contacts.detailContact(req.params.name);
    res.render('edit-contact', {title: 'Edit Contact Page', cont})
})

//Menerima data input dari form Edit data contact
app.post('/edit/:name', [
    body('name').custom((value, {req}) => {
        const duplikat = contacts.checkDuplicate(value);
        console.log(duplikat.name);
        if (duplikat) {
            // Pengkondisian input nama baru yang tidak sama dengan parameter namun duplikat dengan data nama yang lain
            // Sehingga apabila input nama baru yang duplikat namun masih sama dengan paramater (data itu sendiri)
            // maka fungsi dibawah tidak dijalankan
            if (req.params.name != value) {
                throw new Error('Contact name is already used!');
            }
        }
        return true;
    }),
    // check('email', 'Email is invalid!').isEmail(),
    check('mobile', 'Mobile Phone is invalid!').isMobilePhone('id-ID')
], (req, res) => {
    const errors = validationResult(req);
    // Memanggil kembali object dari data yang dipilih
    const cont = contacts.detailContact(req.params.name);
    // console.log(errors)
    if (!errors.isEmpty()) {
        res.render('edit-contact', {
            title: "Add Contact Form",
            errors: errors.array(),
            cont,
        });
    } else {
        const newCont = req.body
        const paramsCont = req.params.name
        // console.log(newCont);
        // console.log(paramsCont)
        contacts.updateContact(paramsCont, newCont.name, newCont.email, newCont.mobile)
        req.flash('msg', 'Contact Data has been successfully updated!')
        res.redirect('/contact')
    }
})

//Route list ketika tombol delete ditekan pada sebuah baris data contact di halaman contact.ejs
app.get('/delete/:name',(req, res) => {
    //Variabel untuk melakukan pengecekan apakah data yang dimasukan pada url ditemukan atau tidak
    const checkDelData = contacts.checkDuplicate(req.params.name);
    if (!checkDelData) {
        req.flash('msg', 'Contact Data cannot be delete, data is not found!')
    } else {
        contacts.deleteContact(req.params.name);
        req.flash('msg', 'Contact Data has been successfully deleted!')
    }
    res.redirect('/contact')
});

//Jika url dimasukkan selain routes list yang tersedia
app.use('/', (req,res) => {
    res.status(404)
    res.send('Page not found: 404')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})