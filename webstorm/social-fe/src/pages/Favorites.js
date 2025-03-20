import { useContext } from "react";
import PeopleList from "../components/hotornot/PeopleList";
import FavoritesContext from "../store/favorites-context";

function FavoritesPage(props) {
  const favoritesCtx = useContext(FavoritesContext);

  let content;

  if (favoritesCtx.totalFavorites === 0) {
    content = <p>You got no favorites yet. Try adding some!</p>;
  } else {
    content = <PeopleList person={favoritesCtx.favorites} />;
  }

  return (
    <section>
      <h1>My Favorites</h1>
      {content}
    </section>
  );
}

export default FavoritesPage;
