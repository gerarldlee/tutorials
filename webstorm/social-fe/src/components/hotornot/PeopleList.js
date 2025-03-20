import classes from "./PeopleList.module.css";
import Person from "./Person"

function PeopleList(props) {
    return (
        <ul className={classes.PeopleList}>
            {props.person.map((person) => (
                <Person 
                    key={person.id}
                    id={person.id}
                    image={person.image}
                    name={person.name}
                    description={person.description}
                />
            ))}
        </ul>
    );
}

export default PeopleList;