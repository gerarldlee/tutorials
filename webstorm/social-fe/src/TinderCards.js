import React, { useEffect, useState } from "react";
import TinderCard from "react-tinder-card";
import database from "./firebase.js";
import './TinderCards.css';


function TinderCards() {
    const [people, setPeople] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    //Piece of code which runs based on a condition
    useEffect(() => {
        setIsLoading(true);

        fetch('http://localhost:8080/people')
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            const people = [];
            console.log(data);
            for (const key in data) {
                const person = {
                    id: key,
                    ...data[key],
                };
                people.push(person);
            }
            setIsLoading(false);
            setPeople(people);
        });


    }, []);

    return ( //allows give keys in react, allows react to efficiently re-render a list / makes your app super fast / always do this in react ( sometimes you might not see the benefit immediately)
        <div>
            <div className="tinderCards__cardContainer">
            {people.map((person) => (
                <TinderCard
                className="swipe"
                key={person.name}
                preventSwipe={['up', 'down']}
                >
                    <div 
                    style={{ backgroundImage: `url(${person.url})`}}
                    className="card"
                    >
                    <h3>{person.name}</h3>
                    </div>
                </TinderCard>
            ))}
            </div>
        </div>

    );
}

export default TinderCards;