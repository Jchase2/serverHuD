import { Route, Redirect } from "react-router-dom";

const PrivateRoute = (props: any) => {
  console.log("children: ", props)
  return (
    <Route
      render={() =>
        props.isAuthed === 'true' ? props.children : <Redirect to="/login" />
      }
    />
  );
};

export default PrivateRoute;
