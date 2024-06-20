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

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// index page
app.get("/", (req, res) => {
    res.render("index")
})

app.get("/home", async (req, res) => {
    const data = await showdata()
    res.render("home", {
        data: data,
    })
})

// get user by id
app.get("/user/:id", async (req, res) => {
    const id = req.params.id
    // console.log(id)
    const data = await showdataById(id)
    res.render("user", {
        data: data
    })
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

app.post("/add", async (req, res) => {
    const {
        fname, 
        midname, 
        lname, 
        birthday,
        address
    } = req.body
    // calculate age from birthday
    const fullyear = new Date(birthday).getFullYear()
    const currYear = new Date().getFullYear()
    const age = currYear - fullyear
    // format date for database insertion
    const currentDate = new Date(birthday);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // insert data into profile table
    const result = await db.query(
                `INSERT INTO profile (first_name, middle_name, last_name, age, birth_date VALUES ($1, $2, $3, $4, $5)
                RETURNING *`, [fname, midname, lname, age, formattedDate]
            )
    const user_id = result.rows[0].id
    console.log(user_id)
    res.redirect("/home")
})

// edit user profile
app.post("/edit", async (req, res) => {
    const key = parseInt(req.body.id) //id of the selected row
    const {
        fname,
        midname,
        lname,
        address,
        birthday,
    } = req.body;
    console.log(key, fname, midname, lname, address, birthday)
    const fullyear = new Date(birthday).getFullYear()
    const currYear = new Date().getFullYear()
    const age = currYear - fullyear
    try{
        await db.query("UPDATE profile SET first_name = $1, middle_name = $2, last_name = $3, a age = $4, birth_date = $5 WHERE id = $6",
            [fname, midname, lname, age, birthday, key]
         )
    } catch(err) {
        res.status(500).send("Internal Server Error")
    }
    // const query = db.query(
    //     "UPDATE profile SET first_name = $1, middle_name = $2, last_name = $3, address = $4, birth_date = $5 WHERE id = $6",
    //     [fname, midname, lname, address, birthdate, key])
    console.log("Data updated successfully")
    res.redirect("/home")
})

// delete selected user profile
app.post("/delete", async (req, res) => {
    const key = parseInt(req.body.deleteId)
    console.log(key)
    try{
        await db.query("DELETE FROM profile WHERE id = $1", [key])
        console.log("User deleted successfully")
    }catch(err) {
        console.log(err);
        res.status(500).send("Internal Server Error")
    }
    res.redirect("/home")
})

// delete multiple addresses of the selected user
app.post("/deleteMultiple", async (req, res) => {
    // let ids = req.body.deleteIds.split(',').map(Number)
    let ids = []
    try{
        await db.query("DELETE FROM profile WHERE id IN ($1)", [ids])
    }catch(err) {
        console.log(err);
        res.status(500).send("Internal Server Error")
    }
})

app.listen(port, () => {
    console.log("Server is running on port 3000")
})

async function verifyLogin(username, password) {
    
    
}
async function showdata(){
    let data = [];
    try{
        const query = await db.query(
            "SELECT id, first_name, middle_name, last_name, age, birth_date FROM profile JOIN address ON profile.id = address.user_id ORDER BY id DESC"
        );
        query.rows.forEach( rows => {
            data.push(rows)        
        });
    }catch(err) {
        console.log(err)
        
    } 
    return data
}
async function showdataById(id){
    let userData = [];
    try{
        const query = await db.query("SELECT * FROM profile WHERE id = $1", [id]);
        query.rows.forEach(rows => {
            userData.push(rows)
        }); 
    }catch(err) {
        console.log(err)
        return []
    }
    return userData
}

function searchProfile(search){
    try{
        await db.query(
            "SELECT * profile WHERE fname LIKE  $1 OR midname LIKE $1 OR lname LIKE $1",'"
        )
    }
}

// async function deleteUserAddress(id) {
//     const deletequery= await db.query("DELETE FROM profile WHERE id = $1", [id])
//     console.log("User deleted successfully")
//     return deletequery
// }
