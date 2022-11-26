if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const { urlencoded } = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/admin');

const Category = require('./models/categories');
const Post = require('./models/posts');


const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/kursy';

mongoose.connect(dbURL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const options = {
    mongoUrl: dbURL,
    secret: process.env.SECRET_KEY,
    touchAfter: 24 * 3600
}

const sessionConfig = {
    store: MongoStore.create(options),
    secret: process.env.SECRET_KEY || "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride("_method"));
app.use(session(sessionConfig))
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.danger = req.flash('danger');
    res.locals.info = req.flash('info');
    next();
})

app.get('/', async (req, res) => {
    const categories = await Category.find({}).populate('posts');
    res.render('main/home', { categories });
})

app.get('/create', async (req, res) => {
    const categories = await Category.find({});
    res.render('main/create', { categories })
})

app.get('/category/:categoryName', async (req, res) => {
    const categories = await Category.find({});
    const { categoryName } = req.params;
    const category = await Category.findOne({ category: categoryName }).populate("posts");
    res.render('main/category', { categories, categoryName, category })
})

app.get('/category/:id/addPost', async (req, res) => {
    const { id } = req.params;
    const categories = await Category.find({});
    const category = await Category.findById(id);
    res.render('post/addPost', { categories, category })
})

app.get('/category/:categoryName/:postId', async (req, res) => {
    const { categoryName, postId } = req.params;
    const categories = await Category.find({});
    const category = await Category.findOne({ category: categoryName });
    const post = await Post.findById(postId);
    res.render('post/show', { categories, post, category });
})

app.get('/category/:categoryName/:postId/edit', async (req, res) => {
    const { categoryName, postId } = req.params;
    const categories = await Category.find({});
    const post = await Post.findById(postId);
    const category = await Category.findOne({ category: categoryName });
    res.render('post/edit', { categories, post, category })
})


app.get('/login', async (req, res) => {
    const categories = await Category.find({});
    res.render('user/login', { categories })
})
app.post('/logowanie', passport.authenticate('local', { failureRedirect: 'login' }), async (req, res) => {
    req.flash("success", "Succesfully logged in")
    res.redirect('/');
})

app.post('/category/:id', async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    const post = new Post(req.body);
    category.posts.push(post);
    await post.save();
    await category.save();
    req.flash("success", "Succesfully created post")
    res.redirect(`/category/${category.category}`);
})

app.post('/', async (req, res) => {
    const category = await new Category(req.body);
    await category.save();
    req.flash("success", "Succesfully created category")
    res.redirect('/')
})

app.put('/category/:categoryId/:postId', async (req, res) => {
    const { categoryId, postId } = req.params;
    const category = await Category.findById(categoryId);
    const post = await Post.findByIdAndUpdate(postId, req.body);
    await post.save();
    req.flash("info", "Succesfully updated post")
    res.redirect(`/category/${category.category}/${postId}`);
})

app.delete('/:categoryid', async (req, res) => {
    await Category.findByIdAndDelete(req.params.categoryid);
    req.flash("success", "Succesfully deleted category")
    res.redirect('/');
})

app.delete('/category/:categoryName/:postId', async (req, res) => {
    const { categoryName, postId } = req.params;
    await Category.findOneAndUpdate({ category: categoryName }, { $pull: { posts: postId } })
    await Post.findByIdAndDelete(postId);
    req.flash("success", "Succesfully deleted post")
    res.redirect(`/category/${categoryName}`);
})


const port = process.env.PORT || 3030
app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})
