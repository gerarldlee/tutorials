import { useHistory } from "react-router-dom";

import NewMeetupForm from "../components/meetups/NewMeetupForm";

function NewMeetupsPage(props) {
  const history = useHistory();

  function addNewNeetupHandler(meetupData) {
    fetch(
      "https://react-getting-started-666cc-default-rtdb.firebaseio.com/meetups.json",
      {
        method: "POST",
        body: JSON.stringify(meetupData),
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then(() => {
        history.replace('/');
    });
  }

  return (
    <section>
      <h1>New meetups</h1>
      <NewMeetupForm onAddMeetup={addNewNeetupHandler} />
    </section>
  );
}

export default NewMeetupsPage;
