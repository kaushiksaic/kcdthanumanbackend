// simpleAuth.js
const simpleAuth = (req, res, next) => {
    // Try to get the user id from a custom header (e.g., x-userid) or query parameter.
    const userid = req.headers['x-userid'] || req.query.userid;
    const usertype = req.headers['x-usertype'] || req.query.usertype;
    if (!userid) {
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!usertype) {
        return res.status(400).json({ error: "User type is required" });
      }
    // Attach the userid to the request object
    req.user = { userid, usertype };
    next();
  };
  
  module.exports = simpleAuth;
  