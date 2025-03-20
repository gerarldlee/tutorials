import { useContext } from "react";
import FavoritesContext from "../../store/favorites-context";
import Entry from "../ui/Entry";
import classes from "./Person.module.css";

function Person(props) {
  const favoritesCtx = useContext(FavoritesContext);
  const itemIsFavorite = favoritesCtx.itemIsFavorite(props.id);

  function addToFavoritesHandler() {
    if (itemIsFavorite) {
      favoritesCtx.removeFavorite(props.id);
    } else {
      favoritesCtx.addFavorite({
        id: props.id,
        name: props.name,
        description: props.description,
        image: props.image,
      });
    }
  }

  return (
    <li className={classes.item}>
      <Entry>
        <div className={classes.image}>
          <img src={props.image} alt={props.name} />
        </div>
        <div className={classes.content}>
          <h3>{props.name}</h3>
          <p>{props.description}</p>
        </div>
        <div className={classes.actions}>
          <button onClick={addToFavoritesHandler}>
              {itemIsFavorite ? "Remove from favorites" : "Add to favorites"}
        Í </button>
        </div>
      </Entry>
    </li>
  );
}

export default Person;
