import jwt_decode from "jwt-decode";

export const getUserId = () => {
  const token = localStorage.getItem("token");
  let id = "";
  if (token) {
    // TODO: Type this.
    const decoded: any = jwt_decode(token);
    id = decoded.id;
  }
  return id;
};
