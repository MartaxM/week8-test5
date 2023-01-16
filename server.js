const express = require('express')
const app = express()
const bycrpt = require('bcrypt')
const passport = require('passport')
const session = require('express-session')
const port = 3000
const bodyParser = require('body-parser')
app.use(bodyParser.json())

function getUserByUsername(username) {
    return users.find(user => user.username === username)
}

function getUserById(id) {
    return users.find(user => user.id === id)
}


const initializePassport = require('./passport-config')
const { authenticate } = require('passport')
initializePassport(passport, getUserByUsername, getUserById)

app.use(express.urlencoded({ extended: false }))
app.use(session({
    secret: "WDADAWUFHAF",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

const users = []

app.get('/', (req, res) => {
    res.send("Hello")
})

// Task 1

app.post('/api/user/register', checkNotAuthenticated ,async (req, res) => {
    //const sameUsername = (u) => u.username == req.body.username
    if (getUserByUsername(req.body.username) != null) {
        res.status(400).send("Username already in use")
    } else {
        try {
            const hashedPassword = await bycrpt.hash(req.body.password, 10)
            let cred = {
                id: Date.now().toString(),
                username: req.body.username,
                password: hashedPassword
            }
            users.push(cred)
            res.json(cred)
        } catch {
            res.status(500).send("Something went wrong")
        }
    }
})

app.get('/api/user/list', (req, res) => {
    res.send(users)
})

// Task 2

app.post('/api/user/login',checkNotAuthenticated, passport.authenticate('local', {}), (req, res) => res.sendStatus(200))

// Task 3

app.get('/api/secret', checkAuthenticated, (req, res) => {
    res.sendStatus(200)
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    
    res.sendStatus(401)
    
}

//Task 4
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/")
    }
    
    return next()
}

//Task 5

let todos = []

app.post('/api/todos', checkAuthenticated , (req, res) => {
    indx = todos.findIndex(e => e.id === req.user.id)
    if(indx !=-1){
        todos[indx].todos.push(req.body.todo)
        res.json(todos[indx])    
    }else{
        todos.push({
            id:req.user.id,
            todos:[req.body.todo]
        })
        res.json(todos[todos.length-1])
    }
})

app.post('/api/todos/list', (req, res) => {
    res.send(todos)
})

app.listen(port, () => console.log(`Server listening a port ${port}!`));