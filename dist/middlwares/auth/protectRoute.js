import jwt from 'jsonwebtoken';
export default function protectRoute(req, res, next) {
    const bearer = req.headers.authorization;
    const JWT_SECRET = process.env.JWT_SECRET || 'no secret';
    if (!bearer) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    const token = bearer.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
        next();
        return;
    }
    catch (e) {
        console.error('Invalid token');
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
}
//# sourceMappingURL=protectRoute.js.map