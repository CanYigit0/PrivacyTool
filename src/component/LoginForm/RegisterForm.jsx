import React from "react";
import './RegisterForm.scss'


const RegisterForm = () => {
    return(
        <div className="wrapper">
            <form action="">
                <h1>Register</h1>

                <div className="input-box">
                    <input type="text" placeholder="Name" required/>
                </div>

                <div className="input-box">
                    <input type="text" placeholder="Username" required/>
                </div>

                <div className="input-box">
                    <input type="password" placeholder="Password" required/>
                </div>


                <button type="sumbit">Register</button>
            </form>
        </div>
    );
};

export default RegisterForm;