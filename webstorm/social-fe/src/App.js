//import logo from "./logo.svg";
import React from "react";
import Header from "./Header";
import TinderCards from "./TinderCards";
import SwipeButtons from "./SwipeButtons";
import { BrowserRouter as Router, Switch, Route} from "react-router-dom"
import "./App.css";
import Chats from "./Chats";
import ChatScreen from "./ChatScreen";


function App() {          //Homepage always needs to be at the bottom because it reads from top //colon repesents value-valid url
  return (
    <div className="App">
      <Router>
       <Switch>
         <Route path="/chat/:person"> 
            <Header backButton="/chat" />
            <ChatScreen/>
          </Route>
          <Route path="/chat">
            <Header backButton="/" />
            <Chats/>
          </Route>
          <Route path="/">
            <Header />
            <TinderCards/>
            <SwipeButtons/>
        </Route>
       </Switch>
      </Router>
    </div>
  );
}

export default App;