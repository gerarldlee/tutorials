import { Route, Switch } from "react-router-dom";

import AllMeetupsPage from "./pages/AllMeetups";
import NewMeetupsPage from "./pages/NewMeetups";
import FavortiesPage from "./pages/Favorites";

import MainNavigation from "./components/layout/MainNavigation";
import Layout from "./components/layout/Layout";

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/new-meetup" exact>
          <NewMeetupsPage />
        </Route>
        <Route path="/favorites" exact>
          <FavortiesPage />
        </Route>
        <Route path="/" exact={true}>
          <AllMeetupsPage />
        </Route>
      </Switch>
    </Layout>
  );
}

export default App;
