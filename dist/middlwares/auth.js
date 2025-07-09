import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export default function createJWT() {
    const JWT_SECRET = process.env.JWT_SECRET || 'no secret';
    const token = jwt.sign({}, JWT_SECRET);
    return token;
}
//# sourceMappingURL=auth.js.map