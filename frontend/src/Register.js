import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

function Register() {
  const navigation = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (localStorage.getItem("user-info")) {
      navigation("/add");
    }
  }, []);

  async function signUp() {
    let data = { name, email, password };
    console.warn(data);
    let result = await fetch("http://localhost:8000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
    result = await result.json();
    localStorage.setItem("user-info", JSON.stringify(result));
    navigation("/add");
  }

  return (
    <>
      <Header />
      <div className="col-sm-6 offset-3">
        <h1>Register page</h1>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-control"
        />
        <br />
        <input
          type="text"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
        <br />
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control"
        />
        <br />
        <button onClick={signUp} className="btn btn-primary">
          Sign Up
        </button>
      </div>
    </>
  );
}

export default Register;
