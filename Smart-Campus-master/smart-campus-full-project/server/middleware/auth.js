const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized. No authentication token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "smart_campus_super_secure_jwt_secret_key_2026_x79!");
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User account no longer exists." });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ success: false, message: "Your account is deactivated. Contact Admin." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

module.exports = { authenticate };
