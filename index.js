import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express()
const port = 3000

app.set('views', './views');
app.set('view engine', 'ejs');

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "biodata",
    password: "12345",
    port: 5432,
  })
db.connect()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/home", async (req, res) => {
    const data = await showdata()
    res.render("home", {
        data: data
    })
})

app.get("/user/:id", async (req, res) => {
    const id = req.params.id
    const data = await showdataById(id)
    console.log(data)
    res.render("user")
})

// verify login by searching user in the database
app.post("/login", async (req, res) => {
    const {username, password  } = req.body
    const result = verifyLogin(username, password)
    try {
        const query = await db.query("SELECT * FROM users WHERE username = $1 AND pass = $2", [username, password])
        if (!query.rows[0]) {
            const errorMessage = "Invalid credentials"
            res.send(errorMessage)
          }
        // const result = query.rows[0]
        res.redirect('/home')
    }catch(err) {
        console.log(err);
        res.status(500).send("Internal Server Error")
    }
   
})

// signing up a new user by posting data to the user table
app.post("/signup", async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    // const hashedPassword = bcrypt.hashSync(password, 10)
    try{
        const query = await db.query("INSERT INTO users (username, pass) VALUES ($1, $2)", [username, password])
        console.log("User created successfully")
    }catch(err) {
        console.log(err);
        res.render("index", {
            message: "User already exists"
        })
  
    }
    res.render("index")
})

app.post("/add", (req, res) => {
    const fname = req.body.fname
    const midame = req.body.midname
    const lname = req.body.lname
    const age = req.body.age
    const birthdate = req.body.birthdate
    const query = db.query(
        "INSERT INTO profile(first_name, middle_name, last_name, age, birth_date) VALUES ($1, $2, $3, $4, $5)",
        [fname, midame, lname, age, birthdate])
    console.log("Data inserted successfully")
    res.redirect("/home")
})

app.put("/edit/:key", (req, res) => {
    const key = req.params.key //id of the selected row
    const fname = req.body.fname
    const midname = req.body.midname
    const lname = req.body.lname
    const currAddress = req.body.currAddress
    const permanentAddress = req.body.permanentAddress
    const age = req.body.age
    const birthdate = req.body.birthdate
    const query = db.query(
        "UPDATE profile SET first_name = $1, middle_name = $2, last_name = $3, age = $4, birth_date = $5 WHERE id = $6",
        [fname, midname, lname, age, birthdate, key])
    console.log("Data updated successfully")
    res.redirect("/home")
})

app.delete("/delete/:key", (req, res) => {
    const deleteRequest = []
    const key = req.params.id
    key.push(deleteRequest)
    console.log(deleteRequest)
})
app.listen(port, () => {
    console.log("Server is running on port 3000")
})

async function verifyLogin(username, password) {
    
    
}
async function showdata(){
    const query = await db.query("SELECT * FROM profile");
    let data = [];
    query.rows.forEach( rows => {
        data.push(rows)
    });
    return data
}
async function showdataById(id){
    const query = await db.query("SELECT * FROM profile WHERE id = $1", [id]);
    return query.rows[0]
}

// async function deleteUserAddress(id) {
//     const deletequery= await db.query("DELETE FROM profile WHERE id = $1", [id])
//     console.log("User deleted successfully")
//     return deletequery
// }

 // const hashedPassword = bcrypt.hashSync(password, 10)
    
    // db.query("SELECT * FROM users WHERE username = $1", [username], (err, result) => {
    //     if (err) throw err
    //     if (result.rows.length === 0) {
    //         res.send("User not found")
    //     } else {
    //         const user = result.rows[0]
    //         if (bcrypt.compareSync(password, user.password)) {
    //             res.send("Login successful")
    //         } else {
    //             res.send("Incorrect password")
    //         }
    //     }
    // })