import { useState } from 'react';

import Modal from './Modal';
import Backdrop from './Backdrop';

function Todo(props) {

    const [ modalIsOpen, setModalIsOpen ] = useState(false);

    function deleteHandler() {
        setModalIsOpen(true);
    }

    function backdropHandler() {
        setModalIsOpen(false);
    }

    function confirmHandler() {
        console.log('Confirm click!');
        setModalIsOpen(false);
    }

    return (
        <div className='card'>
            <h2>{props.text}</h2>
            <div className='actions'>
                <button className='btn' onClick={deleteHandler} >Delete {2+2}</button>
            </div>
            { modalIsOpen && <Modal onCancel={backdropHandler} onConfirm={confirmHandler} /> }
            { modalIsOpen && <Backdrop onClick={backdropHandler} /> }
        </div>
    );

}

export default Todo;