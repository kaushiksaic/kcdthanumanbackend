const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('validator');
var jwt = require('jsonwebtoken');
const ValidateSignUpData = require('../utils/validation');
const pool = require('../config/database');
require('dotenv').config();

const authRouter = express.Router();

authRouter.post("/signup", async(req,res) => {

   try {

    const validationResult = await ValidateSignUpData(req); 
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.message }); 
        }

    

      const {phone_num,password,name,district,city,pincode,star,rashi,gothram,gender} = req.body;

      const existingUser = await pool.query(
        `SELECT * FROM UserMaster WHERE mobilenum = $1`,[phone_num]
      )

      if(existingUser.rows.length > 0) {
       return res.status(400).json({error: 'Already a Registered User, Please Login !!'})
      }

        const hashedPassword =  await bcrypt.hash(password,10);

        const result = await pool.query(
            `INSERT INTO UserMaster (name,district,mobilenum,password,city,pincode,star,rashi,gothram,gender)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING userid,usertype`,
             [name,district,phone_num,hashedPassword,city,pincode,star,rashi,gothram,gender]
        );

        const userid = result.rows[0].userid;
        const usertype = result.rows[0].usertype;

        await pool.query(
          `INSERT INTO japa_counts (userid,event_id,count,count_target)
           VALUES ($1,1,0,108)
          `,[userid]
        )

         const token = await jwt.sign({userid,usertype:usertype},'Sai@Temple008',{expiresIn: '1h'})

         res.cookie('token', token,{httpOnly: true, 
           secure: process.env.NODE_ENV === 'production' , sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' ,expires: new Date(Date.now() + 8 + 3600000)})



       return res.status(201).json({
            message: 'User added successfully',
            userid,
            usertype
        })

    


   }  catch (error) {
    res.status(400).send('Error saving user' + error.message);
   }  


})


authRouter.post("/login", async(req,res) => {

  try{

    const {phone_num,password} = req.body;


    if(!phone_num || !password) {
      return res.status(400).json({error: 'Phone number and password are required'})
    }

    if(!validator.isMobilePhone(phone_num, 'en-IN')) {
      return res.status(400).json({error:'Not a valid mobile number'});
    }

    const userResult = await pool.query(
      `SELECT userid,password,usertype FROM UserMaster WHERE mobilenum = $1`,
      [phone_num]
    );

    if(userResult.rows.length === 0) {
      return res.status(400).json({error: 'User does not exist,please register'});
    }

    const {userid, password: hashedPassword,usertype} = userResult.rows[0];

    const isPasswordMatch = await bcrypt.compare(password,hashedPassword);

    if(!isPasswordMatch) {
      return res.status(400).json({error:'Invalid Password'});
    }

     const token = jwt.sign({userid,usertype:usertype},'Sai@Temple008',{ expiresIn: '1h' });

     res.cookie('token',token,{httpOnly: true, 
       secure: process.env.NODE_ENV === 'production' , sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',expires: new Date(Date.now() + 8 + 3600000)});

    return res.status(201).json({message:'Login Successful',userid,usertype})





  } catch (error) {
    return res.status(400).send('Error logging in' + error.message)
  }
  


})


authRouter.post("/forgotpassword",async(req,res) => {
  try {

    const {phone_num,password,pinnum} = req.body;


    if(!phone_num || !password || !pinnum) {
      return res.status(400).json({error:"All three fields are required"})
    }
     
    if(!validator.isMobilePhone(phone_num,'en-IN')) {
      return res.status(400).json({error:'Not a valid mobile number'});
    }

    if(!validator.isStrongPassword(password)) {
      return res.status(400).json({error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' }) 
    }


    const result = await pool.query(
      `SELECT userid,pinnum FROM usermaster WHERE mobilenum = $1`,[phone_num]
    );

    if(result.rows.length === '0') {
      return res.status(400).json({error: 'User not found, please register'})
    }

    const user = result.rows[0];

    if(user.pinnum !== pinnum) {
      return res.status(400).json({error: 'Invalid PIN, Please check and try again'})
    }
    
    const hashedPassword =  await bcrypt.hash(password,10);    


   await pool.query(
    `UPDATE usermaster SET password = $1 WHERE userid = $2`,
    [hashedPassword,user.userid]
   )

   return res.status(200).json({message: 'Password Updated Successfully'})




  } catch(error) {
    return res.status(400).send('Error updating password' + error.message)
  }
})




authRouter.post("/logout", async(req,res) => {
   res.cookie("token",null,{ expires: new Date(Date.now())});

  return res.send("Successfully logged out!");
})

module.exports = authRouter;
