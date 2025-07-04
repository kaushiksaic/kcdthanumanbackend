const express = require('express');
const validator = require('validator');
const pool = require('../config/database');
var jwt =  require('jsonwebtoken');
const userAuth = require('../middleware/auth');
const simpleAuth = require('../middleware/simpleAuth');


const japaRouter = express.Router();

const globalEventStartDate = new Date("2025-06-01T00:00:00Z");


const calculateStatus = (user_count,count_target) => {
    const now = new Date();
    const diffMs = now - globalEventStartDate; //diff in milliseconds
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    const cumulativeTarget = count_target * diffDays;
    return user_count >= cumulativeTarget ? 'Completed' : 'In Progress';
}

const calculateStatusTwo = (count,count_target) => {
    const now = new Date();
    const diffMs = now - globalEventStartDate; //diff in milliseconds
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    const cumulativeTarget = count_target * diffDays;
    return count >= cumulativeTarget ? 'Completed' : 'In Progress';
}


// get event and count details
japaRouter.get('/japa/event',userAuth, async (req,res) => {
    try {

        const userid = req.user;

        // const result = await pool.query(
        //     `SELECT event_id,count_target,COALESCE(count,0) AS user_count
        //      FROM japa_counts
        //      WHERE userid = $1
        //     `, [userid]
        // );

        const result = await pool.query(
            `SELECT 
                u.name,  
                u.pinnum, 
                j.event_id, 
                j.count_target, 
                COALESCE(j.count, 0) AS user_count,
                COALESCE(j.tarpanam_count, 0) AS tarpanam_count,
                j.updatedat 
             FROM usermaster u
             LEFT JOIN japa_counts j ON u.userid = j.userid
             WHERE u.userid = $1
            `, [userid]
        );


        if(result.rows.length === 0) {
            return res.json({
                name: "Unknown user",
                event_id: 1,
                count_target: 150,
                user_count: 0,
                status: "In Progress"
            });
        } else {
            const {name,event_id,count_target,user_count,pinnum,tarpanam_count,updatedat} = result.rows[0];


            const status = calculateStatus(user_count,count_target);
            // const status = user_count >= count_target ? "Completed" : "In Progress";

            response = {name,event_id,count_target,user_count,status,pinnum,tarpanam_count,updatedat};
        }
       
       return res.status(200).json(response);


    }  catch (error) {
        return res.status(400).send('Error fetching data' + error.message);
    }
})

japaRouter.get('/japa/overview',userAuth,async (req,res) => {

    try {


       const usertype = req.usertype;

       if(usertype !== 'admin') {
        return res.status(403).json({error: 'Unauthorized Access'})
       }


        const overviewResult = await pool.query(
            `select u.userid,u.mobilenum,u.name,u.city,u.pinnum,j.count from 
    usermaster u,japa_counts j where u.userid=j.userid order by j.count desc
    `
        );
    
      if(overviewResult.rows.length === 0) {
        return res.json({message:'No Data Found'})
      }
    
      const sumResult = await pool.query(
        `select sum(count) AS sum_count from japa_counts`
      );
    
    
      return res.status(200).json({
        overview: overviewResult.rows,
        sum: sumResult.rows[0].sum_count
      });
     
    
    } catch(error) {
        return res.status(400).send('Error fetching data' + error.message);
    }

   

})

// Update Japa count
japaRouter.patch('/japa/count',userAuth,async(req,res) => {
    try {
        
        const userid = req.user;

      const {increment_by,increment_tarpanam} = req.body;

      const result = await pool.query(
        `UPDATE japa_counts
         SET count = count + $1,
         tarpanam_count = tarpanam_count + $2, 
         updatedat = NOW()
         WHERE userid = $3
         RETURNING count,count_target,tarpanam_count,updatedat
        `, [increment_by,increment_tarpanam, userid]
      );

      if ((await result).rows.length === 0) {
          return res.status(404).json({error: 'User not found'})
      }

       const {count, count_target,tarpanam_count,updatedat}  = result.rows[0];

       const status = calculateStatusTwo(count,count_target);
    //    const status = count >= count_target ? "Completed" : "In Progress";

      return res.status(200).json({message: 'Count Updated Successfully',user_count: count, status,tarpanam_count,updatedat});

    } catch (error) {
        return res.status(400).send('Error updating count' + error.message);
    }
});


module.exports = japaRouter;