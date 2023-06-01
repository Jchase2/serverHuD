import jwt from 'jsonwebtoken';

export const verifyToken = (token: string) => {
    if(!token) return false;
    return jwt.verify(token, process.env.SECRET_KEY || 'insecure');
}
