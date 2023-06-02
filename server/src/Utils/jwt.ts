import jwt from "jsonwebtoken";

export const verifyToken = (token: string) => {
  if (!token) return false;
  return jwt.verify(token, process.env.SECRET_KEY || "insecure");
};


// Simply decode the JWT and return the users id.
// User can't really spoof ID from client when getting
// userid this way.
export const getUserId = (token: string) => {
  interface JwtPayload {
    _id: number;
  }
  let { _id } = jwt.decode(token) as JwtPayload;
  return _id;
};
