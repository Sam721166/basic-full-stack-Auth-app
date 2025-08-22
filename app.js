const express = require("express")
const app = express()
const userModel = require("./model/user")
const cors = require("cors")
const axios = require("axios")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")

app.use(express.json())
app.use(cors())
app.use(cookieParser())


app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
})
app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
})

app.post("/signup", async (req, res) => {
    let {email, password} = req.body
    const hash = await bcrypt.hash(password, 10)
    const user = await userModel.create({
        email: email,
        password: hash
    })
    console.log(hash);
    
    const token = jwt.sign({email: user.email, userid: user._id}, "secret")
    res.cookie("token", token)
    return res.json({
        msg: "signup successful",
        password: `your password is password ${hash}`
    })
    
})

app.post("/login", async (req, res) => {
    const user = await userModel.findOne({email: req.body.email})
    if(!user) {
        return res.json({
            msg: "user not found"
        })
    }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
        if(result){
            const token = jwt.sign({email: req.body.email, userid: user._id}, "secret")
            res.cookie("token", token)
            return res.json({ 
                msg: "login succsessful",
                msg3: user._id
            })
            
        } else {
            return res.json({
                msg: "wrong password"
            })
        }
    })
})

//middleware for protected routs
function isLoggedIn (req, res, next){
    const token = req.cookies.token
    if(!token){
        return res.json({
            msg: "you must be logged in"
        })
    } else{
        const data = jwt.verify(req.cookies.token, "secret")
        req.user = data
        next()
    }
}

app.get("/me",isLoggedIn, async (req, res) => {
    const user = await userModel.findById(req.user.userid)
    res.json({
        user: user
    })
})

app.get("/logout", (req, res) => {
    res. sendFile(__dirname + "/public/index.html")
})
app.post("/logout", (req, res) => {
    res.cookie("token","")
    return res.json({
        msg: "logout done"
    })
})


app.listen(3000, () => {
    console.log("it's running...");
    

})
