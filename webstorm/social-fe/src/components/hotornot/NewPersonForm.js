import { useRef } from "react";
import Entry from "../ui/Entry";
import classes from "./NewPersonForm.module.css";

function NewPersonForm(props) {
  const nameInputRef = useRef();
  const imageInputRef = useRef();
  const descInputRef = useRef();

  function submitHandler(event) {
    event.preventDefault();
    const enteredName = nameInputRef.current.value;
    const enteredImage = imageInputRef.current.value;
    const enteredDesc = descInputRef.current.value;
    const personData = {
      name: enteredName,
      image: enteredImage,
      description: enteredDesc,
    };
    props.onAddPerson(personData);
  }

  return (
    <Entry>
      <form className={classes.form} onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="name">Name</label>
          <input type="text" required id="name" ref={nameInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="image">Image</label>
          <input type="url" required id="url" ref={imageInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="description">Description</label>
          <textarea rows="5" required id="desc" ref={descInputRef} />
        </div>
        <div className={classes.actions}>
          <button>Add Person</button>
        </div>
      </form>
    </Entry>
  );
}

export default NewPersonForm;
