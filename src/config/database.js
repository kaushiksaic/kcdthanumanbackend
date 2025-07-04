const {Pool} = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool(
    isProduction ? {
        user: process.env.DB_User,
        password: process.env.DB_Password,
        database: process.env.DB_Name,
        host: process.env.DB_Host,
        port: process.env.DB_Port,
        ssl: { rejectUnauthorized: false },
      }
    :
    {
        user: process.env.LOCAL_DB_User,
        password: process.env.LOCAL_DB_Password,
        database: process.env.LOCAL_DB_Name,
        host: process.env.LOCAL_DB_Host,
        port: process.env.LOCAL_DB_Port,
      }
   )

module.exports = pool;