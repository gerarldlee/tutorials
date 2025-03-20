import React from "react";
import "./Header.css";
import PersonIcon from "@material-ui/icons/Person";
import ForumIcon from "@material-ui/icons/Forum";
import IconButton from "@material-ui/core/IconButton";
import { Link, useHistory } from "react-router-dom";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

function Header({ backButton }) {
    const history = useHistory(); //gives you browser history (session)
    return (
        <div className="header">
            {backButton ? ( //if theres backbutton render this
                <IconButton onClick={() => history.replace(backButton)}> 
                    <ArrowBackIosIcon fontSize="large" className="header__icon"/>
                </IconButton>
            ): (
                <IconButton>
                <PersonIcon className="header__icon" fontSize="large"/>
                </IconButton>
            )}


            <Link to="/">
            <img 
            className="header__logo"
            src="https://upload.wikimedia.org/wikipedia/en/e/e0/WPVG_icon_2016.svg" 
            alt="tinder logo"
            />
            </Link>

            <Link to="/chat">
            <IconButton>
                <ForumIcon className="header__icon" fontSize="large"/>
            </IconButton>
            </Link>

        </div>
    );
}

export default Header;