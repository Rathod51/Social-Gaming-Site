const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");
let port = 8080;

//In-memory user storeage(replace with db)
const users = [];


app.use(express.urlencoded({extended: true})); //middlewear
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));




// SIGNUP ROUTE............

    app.post("/signup", async (req, res) => {
        const { username, email, password } = req.body;
        console.log(req.body);
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.send("User already exists!");
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        users.push({
            username,
            email,
            password: hashedPassword
        });
        console.log(users);

        // redirect to home page
        res.redirect("/home.html");
       
        //res.send("Signup successful! Go to login page.");
    });


// LOGIN ROUTE........

    app.post("/login", async (req, res) => {
        const { email, password } = req.body;

        console.log(req.body);

        const user = users.find(user => user.email === email);
        if (!user) {
            return res.send("User not found !");
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("Incorrect password!");
        }

        
        // redirect to home page
        res.redirect("/home.html");
        
        //res.send(`Welcome ${user.username}! 🎮`);
    });


    app.listen(port, () => {
        console.log("listening to the port: 8080");
    });



