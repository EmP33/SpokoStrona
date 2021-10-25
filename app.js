const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const { urlencoded } = require('body-parser');
const mongoose = require('mongoose');
const Category = require('./models/categories');

const dbURL = 'mongodb://localhost:27017/kursy'

mongoose.connect(dbURL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
    const categories = await Category.find({});
    res.render('main/home', { categories });
})

app.get('/create', async (req, res) => {
    const categories = await Category.find({});
    res.render('main/create', { categories })
})

app.get('/category/:categoryName', async (req, res) => {
    const categories = await Category.find({});
    const { categoryName } = req.params;
    res.render('main/category', { categories, categoryName })
})

app.post('/', async (req, res) => {
    const category = await new Category(req.body);
    await category.save();
    res.send(category)
})


const port = 3000
app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})