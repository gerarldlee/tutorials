function TinderCards() {
    const [people, setPeople] = useState([
        {
            name: 'ANAN',
            url: 'https://html.com/wp-content/uploads/flamingo.webp'
        },
        { 
            name: 'BABAN',
            url: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c0047324-0a36-477f-97aa-eeac1d15c9da/dbf3420-a3d6269e-5005-4d84-a3db-db07f61cb52c.png/v1/fill/w_1024,h_769,q_80,strp/zbrush_doodle_day_920___random_face_by_unexpectedtoy_dbf3420-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzY5IiwicGF0aCI6IlwvZlwvYzAwNDczMjQtMGEzNi00NzdmLTk3YWEtZWVhYzFkMTVjOWRhXC9kYmYzNDIwLWEzZDYyNjllLTUwMDUtNGQ4NC1hM2RiLWRiMDdmNjFjYjUyYy5wbmciLCJ3aWR0aCI6Ijw9MTAyNCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.2a-rNsFAmFSQk02VgyuOKa7E5ymdnwO73LyqdgAmDM4'
        },
        
    ]);

    //Piece of code which runs based on a condition
    useEffect(() => {
        //this is where the code runs..compopnent runs once ( everytime you swap, dwill fetch from database etc )
        database.collection('people').onSnapshot(snapshot => (
            setPeople(snapshot.docs.map(doc => doc.data())) //anytime database changes, take a picture of it send me the new document
        ))       

    }, []); //by putting the last it means this will run once twhen compopnent loads, and never again. If put something in paranthesis then it means it will run everytime page changes otherwise not.


    return ( //allows give keys in react, allows react to efficiently re-render a list / makes your app super fast / always do this in react ( sometimes you might not see the benefit immediately)
        <div>
            <h1>Tinder cards</h1>

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