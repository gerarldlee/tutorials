import { useContext } from "react";
import { Link } from "react-router-dom";
import FavoritesContext from "../../store/favorites-context";
import classes from "./MainNavigation.module.css";

function MainNavigation() {
  const favoriteCtx = useContext(FavoritesContext);
  return (
    <header className={classes.header}>
      <div className={classes.logo}>Tinder</div>
      <nav>
        <ul>
          <li>
            <Link to="/">All People</Link>
          </li>
          <li>
            <Link to="/new-person">New Person</Link>
          </li>
          <li>
            <Link to="/favorites">
              Favorites{" "}
              <span className={classes.badge}>
                {favoriteCtx.totalFavorites}
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
