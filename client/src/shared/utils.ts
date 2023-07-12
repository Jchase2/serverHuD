export const getUserId = () => {
  const id = localStorage.getItem("userId");
  return id;
};