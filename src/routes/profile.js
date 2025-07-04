const express = require('express');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
var jwt = require('jsonwebtoken');


const profileRouter = express.Router();

profileRouter.patch("/profile/:id", async(req,res) => {


try {

const userId = req.params.id;
const updates = req.body;

if(!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({error:'No fields to update'});
}

const allowedFields = ["email","state","district","city","pincode","addressline1","addressline2","star","rashi","gothram","name"];
const keys = Object.keys(updates);
const values = [];
const setClauses = [];


let i = 1;
for (const key of keys) {
    if(!allowedFields.includes(key)) {
        return res.status(400).json({error:`Invalid Field ${key} Update,Not Allowed`});
    }

    setClauses.push(`${key} = $${i}`);
    values.push(updates[key]);
    i++;
}
values.push(userId);


const query = `UPDATE UserMaster SET ${setClauses.join(", ")} WHERE userid = $${i} RETURNING *`;
const result = await pool.query(query,values)

if(result.rowCount === 0) {
  return  res.status(400).json({error:'User not found'})
}

else {
    return res.status(200).json({message:'Profile Updated Successfully',user:result.rows[0],})
}



}  catch (error) {
  return res.status(400).send('Error updating profile' + error.message);

}



})


profileRouter.get("/profile",async(req,res) => {
    try {
        
      const {token} = req.cookies;

      if(!token) {
        return res.status(401).json({error:'Unauthorized, Please log in!!'});
      }


      const decoded = jwt.verify(token,"Sai@Temple008");
      const userId = decoded.userid;

      const result = await pool.query(
        `SELECT email,state,district,city,pincode,addressline1,addressline2,star,rashi,gothram,name
         FROM UserMaster
         WHERE userid = $1
        `, [userId]
      );

      if(result.rows.length === 0) {
        return res.status(404).json({error:'User not found'});
      }

      else {
        return res.status(200).json({profile: result.rows[0]});
      }

    } catch(error) {
        return res.status(400).send('Error fetching user' + error.message)

    }
})

module.exports = profileRouter;