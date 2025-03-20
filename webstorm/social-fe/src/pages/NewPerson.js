import { useHistory } from "react-router-dom";

import NewPersonForm from "../components/hotornot/NewPersonForm";

function NewPersonPage(props) {
  const history = useHistory();

  function addNewPersonHandler(personData) {
    fetch(
      "https://tinder-project-2d2f1-default-rtdb.firebaseio.com/persons.json",
      {
        method: "POST",
        body: JSON.stringify(personData),
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then(() => {
      history.replace("/");
    });
  }

  return (
    <section>
      <h1>Create person entry</h1>
      <NewPersonForm onAddPerson={addNewPersonHandler} />
    </section>
  );
}

export default NewPersonPage;
