// import logo from './logo.svg';
// import './App.css';

import Backdrop from './components/Backdrop';
import Modal from './components/Modal';
import Todo from './components/Todo';

function App() {
  return (
      <div>
        <h1>Hello!</h1>
        <Todo text="Learn React"/>
        <Todo text="one" />
        <Todo text="two"/>
      </div>
    );
}

export default App;
