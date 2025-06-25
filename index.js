const express = require("express");
const path = require("path");
const hbs = require("hbs");
const LogInCollection = require("./mongodb");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, '../tempelates');
const publicPath = path.join(__dirname, '../public');
const partialPath = path.join(__dirname, '../partials');

app.set('view engine', 'hbs');
app.set('views', templatePath);
hbs.registerPartials(partialPath);
app.use(express.static(publicPath));

// Routes
app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.post('/signup', async (req, res) => {
    try {
        const { name, password } = req.body;

        const existingUser = await LogInCollection.findOne({ name });

        if (existingUser && existingUser.password === password) {
            return res.send("User details already exist");
        }

        const newUser = new LogInCollection({ name, password });
        await newUser.save();

        // Pass full user object with name to template
        res.status(201).render("home", { user: { name } });
    } catch (error) {
        console.error("Signup error:", error);
        res.send("Wrong inputs");
    }
});

app.post('/login', async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await LogInCollection.findOne({ name });

        if (user && user.password === password) {
            // Pass full user object with name to template
            res.status(201).render("home", { user: { name } });
        } else {
            res.send("Incorrect name or password");
        }
    } catch (error) {
        console.error("Login error:", error);
        res.send("Wrong details");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
