const express = require('express'); // create server
const dotenv = require('dotenv');   // for secrete key
const jwt = require('jsonwebtoken'); //
const cors = require('cors'); // ✅ ADD THIS

dotenv.config();    // 
const app = express();  //create express applicaiton
app.use(express.json());    //
app.use(cors());

const SECRET_KEY = process.env.SECRET_KEY;
const tokens = []; // store tokens temporarily in memory

// 1. Generate and store JWT token
app.post('/generate-token', (req, res) => {
    const user = {
        id: req.body.id,
        username: req.body.name
    };
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
    tokens.push(token); // simulate storing in DB
    res.json({
        message: 'Token generated successfully',
        token, 
        user
    });
});

app.listen(3000, ()=>{
    console.log("Server is running on http://localhost:3000/generate-token")
})