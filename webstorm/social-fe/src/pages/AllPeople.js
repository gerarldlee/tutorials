import { useEffect, useState } from 'react';
import PeopleList from '../components/hotornot/PeopleList';

// const DUMMY_DATA = [
//     {
//     id: "p1",
//     image: "https://upload.wikimedia.org/wikipedia/en/c/c6/Jungle_Cruise_-_theatrical_poster.png",
//     name: "blah blah name 1",
//     description: "test description 1"
// },
// {
//     id: "p2",
//     image: "https://upload.wikimedia.org/wikipedia/en/c/c6/Jungle_Cruise_-_theatrical_poster.png",
//     name: "blah blah name 2",
//     description: "test description 2"
// }
// ];

function AllPeoplePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [loadedPeople, setLoadedPeople] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        fetch("https://tinder-project-2d2f1-default-rtdb.firebaseio.com/persons.json")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            const people = [];
            for (const key in data) {
                const person = {
                    id: key,
                    ...data[key],
                };
                people.push(person);
            }
            setIsLoading(false);
            setLoadedPeople(people);
        });
    }, []);

    if (isLoading) {
        return (
            <section>
                <p>Loading...</p>
            </section>
        );
    }

    return (
        <section>
            <h1>All People</h1>
            <PeopleList person={loadedPeople} />
        </section>
    );
}

export default AllPeoplePage;
