import React, { useEffect, useState } from "react";
import TinderCard from "react-tinder-card";
import database from "./firebase.js";
import './TinderCards.css';


function TinderCards() {
    const [people, setPeople] = useState([]);

    //Piece of code which runs based on a condition
    useEffect(() => {
        //this is where the code runs..compopnent runs once ( everytime you swap, dwill fetch from database etc )
        const unsubscribe = database //using unsubscribe to increase performance when there are alot of people
        .collection("people")
        .onSnapshot((snapshot) => //this is like a promise. it gives function to store in a variable
            setPeople(snapshot.docs.map((doc) => doc.data())) //anytime database changes, take a picture of it send me the new document / ITS REALTIME, if you change anything on firebase it changes the app automatically
        );

        return () => {
            //this is the cleanup. you swipe people change. It will stop creating list after it gets all the people, it will unsubcribe people you swiped so it wont show op
            unsubscribe();
        }

    }, [people]); //by putting the last it means this will run once twhen compopnent loads, and never again. If put something in paranthesis then it means it will run everytime page changes otherwise not.
    //[people] = everytime people changes

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