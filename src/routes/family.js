const express = require('express');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
var jwt = require('jsonwebtoken');
const userAuth = require('../middleware/auth');

const familyRouter = express.Router();


familyRouter.post("/family",userAuth, async (req,res) => {
    try {

       const {personname,mobile,rashi,gothram,relationship} = req.body;


       const userid =  req.user;

         if( !personname || !relationship) {
            return res.status(400).json({error: 'personname, relationship fields are mandatory'});
         }

      const query = `INSERT INTO userfamily (userid,personname,mobile,rashi,gothram,relationship)
                     VALUES ($1,$2,$3,$4,$5,$6) RETURNING * `;
      
      const values = [userid,personname,mobile,rashi,gothram,relationship];

      const result = await pool.query(query,values);

      res.status(201).json({message:'Family member added successfully',familyMember: result.rows[0]})



    } catch(error) {
        return res.status(400).send('Error adding family member' + error.message)
    }
})

module.exports = familyRouter;