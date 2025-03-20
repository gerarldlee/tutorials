import { createContext, useState } from "react";

const FavoritesContext = createContext({
  favorites: [],
  totalFavorites: 0,
  addFavorite: (personId) => {},
  removeFavorite: (personId) => {},
  itemIsFavorite: (personId) => {},
});

export function FavoritesContextProvider(props) {
  const [userFavorites, setUserFavorites] = useState([]);

  function addFavoriteHandler(personId) {
    setUserFavorites((previousUserFavorites) => {
      return previousUserFavorites.concat(personId);
    });
  }

  function removeFavoriteHandler(personId) {
    setUserFavorites((previousUserFavorites) => {
      return previousUserFavorites.filter((person) => person.id !== personId);
    });
  }

  function itemIsFavoriteHandler(personId) {
    return userFavorites.some((person) => person.id === personId);
  }

  const context = {
    favorites: userFavorites,
    totalFavorites: userFavorites.length,
    addFavorite: addFavoriteHandler,
    removeFavorite: removeFavoriteHandler,
    itemIsFavorite: itemIsFavoriteHandler,
  };

  return (
    <FavoritesContext.Provider value={context}>
      {props.children}
    </FavoritesContext.Provider>
  );
}

export default FavoritesContext;
