const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
   // 从请求头中获取JWT令牌
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    // 解析JWT令牌并获取用户ID
    const decoded = jwt.verify(token, 'your_secret_key'); // 使用您的密钥替换'your_secret_key'
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

module.exports = authenticateJWT;
