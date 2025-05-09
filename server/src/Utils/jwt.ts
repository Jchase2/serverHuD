import jwt from 'jsonwebtoken';

export const verifyToken = (token: string) => {
  if (!token) return false;

  try {
    return jwt.verify(token, process.env.SECRET_KEY || "insecure");
  } catch (err) {
    console.log("JWT ERROR IS: ", err)
    return false;
  }
};


// Simply decode the JWT and return the users id.
// User can't really spoof ID from client when getting
// userid this way.
export const getUserId = (token: string) => {
    if(!token) return -1;

    interface JwtPayload {
        _id: number;
      }

    try {
        let verifyJwt = jwt.verify(token, process.env.SECRET_KEY || "insecure");
        if(!verifyJwt) return -1;
        let { _id } = jwt.decode(token) as JwtPayload;
        return _id;
    } catch (err) {
        console.log("JWT ERROR IN GET USER ID IS: ", err)
        return -1;
    }
};
