require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')


app.use(express.json())
const posts = [
    {
        username: 'Gopi',
        title: 'Post 1'
    },
    {
        username: 'Kyle',
        title: 'Post 2'
    }
]


let refershTokens = []

function generateAccessToken(user){
    const Token = jwt.sign(user, process.env.ACCESS_SECRET_KEY, { expiresIn: '15s'})
    return Token
}
// Middleware to authenticate token
const authenticateToken = (req,res,next) => {
    //console.log(req.headers)
    const authHeaders = req.headers.authorization
    //console.log(authHeaders)
    const token = authHeaders && authHeaders.split(' ')[1]
    //console.log(token)
    if(token == null) return res.sendStatus(404)

    jwt.verify(token,process.env.ACCESS_SECRET_KEY, (err,user)=>{
        //console.log(err)
        if(err){
            return res.sendStatus(403)
        }
        //console.log(user)
        req.user = user
        next()
    })
}

app.get('/posts', authenticateToken ,(req,res)=>{
    //console.log(req.user.name)
    res.json(posts.filter(post => post.username === req.user.name))
})


app.post('/login', (req,res)=>{
    const username = req.body.username
    //console.log(username)
    const user = { name : username}
    //console.log(user)
    const accessToken = generateAccessToken(user)
    const refershToken = jwt.sign(user,process.env.REFRESH_TOKEN_KEY)

    refershTokens.push(refershToken)

    res.json({accessToken : accessToken , refershToken : refershToken})
})


app.post('/token', (req,res) =>{
    const refershToken = req.body.token
    if(refershToken == null) return res.setStatus(401)
    if(!refershTokens.includes(refershToken)) return res.setStatus(402)

    jwt.verify(refershToken,process.env.REFRESH_TOKEN_KEY, (err,user)=>{
        if(err) return res.setStatus(404)
        const accessToken = generateAccessToken({name : user.name})
        return res.json({accessToken : accessToken})
    })
})

app.get('/logout', (req,res)=>{
    return (refershTokens.filter(token => token !== req.body.token))
    return res.setStatus(200)
})


app.listen(3000)