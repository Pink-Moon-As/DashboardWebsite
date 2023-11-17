const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

const authenticateToken = async (req, res, next) => {
  if(!req.headers.authorization) 
  return res
  .status(401)
  .json({ success: false, message: "No token was provided" });

  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token was provided" });
  }

  jwt.verify(token, secretKey, (error, decodedToken) => {
    if (error) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    req.token = decodedToken;

    next();
  });
};
module.exports = {
  authenticateToken
}