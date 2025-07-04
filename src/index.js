const express = require('express');
const pool = require('./config/database');
const cookieParser = require('cookie-parser')
const cors = require('cors')

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const familyRouter = require('./routes/family');
const japaRouter = require('./routes/japa');




const app = express();
const port = 2000;

app.use(cors({
    origin: ["http://localhost:5173","https://kcdt.japasankhya.in"],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/',authRouter);
app.use('/',profileRouter);
app.use('/',familyRouter);
app.use('/',japaRouter);

pool.connect().then(() => console.log('Connected With Database'));

app.listen(port, () => {
    console.log(`server running successfully on  http://localhost:${port}`)
})