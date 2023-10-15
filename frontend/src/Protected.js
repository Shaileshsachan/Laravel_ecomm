import React, {useState, useEffect} from "react"
import Header from "./Header"
import {useNavigate} from 'react-router-dom'

function Protected(props) {
    let Cmp = props.Cmp
    const navigation = new useNavigate();
    useEffect(() => {
        if (!localStorage.getItem('user-info')) {
            navigation('/login')
        }
    })

    return (
        <div>
            <Cmp/>
        </div>
    )


}

export default Protected