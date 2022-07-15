//File System
const fs = require('fs');

//Membuat folder "data" apabila folder tidak ada
const dirPath = './data';
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

//Membuat file "contacts.json" apabila file tidak ada
const dataPath = './data/contacts.json';
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, '[]', 'utf-8');
}

const loadContact = () => {
    const file = fs.readFileSync('data/contacts.json', 'utf8');
    const contacts = JSON.parse(file);
    return contacts;
}

//Fungsi untuk menampilkan detail data contact berdasarkan nama
const detailContact = (name) => {
    const contacts = loadContact();
    //Mencari data nama contact yang sama dengan nama yang diinput
    const findContact = contacts.find((contact) => contact.name.toLowerCase() === name.toLowerCase());
    // console.log(findContact);
    return findContact;
}

//Export module dari contact.js
module.exports = {loadContact, detailContact};