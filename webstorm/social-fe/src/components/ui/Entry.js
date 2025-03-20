import classes from './Entry.module.css';

function Entry(props) {
    return (
        <div className={classes.entry}>
            {props.children}
        </div>
    );
}

export default Entry;