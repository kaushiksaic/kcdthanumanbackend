var jwt = require('jsonwebtoken');



const userAuth = (req,res,next) => {
    try {

     const {token} = req.cookies;

     if(!token) {
        return res.status(400).json({error:'Please log in!!!'});
     }

     const decoded = jwt.verify(token,'Sai@Temple008');
     const userid = decoded.userid;
     const usertype = decoded.usertype;
     req.user = userid;
     req.usertype = usertype;
     next();


    } catch(error) {
        return res.status(400).send('Invalid Token' + error.message);
    }
}

module.exports = userAuth;