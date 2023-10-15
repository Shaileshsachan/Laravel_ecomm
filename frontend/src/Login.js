import Header from "./Header";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("user-info")) {
      navigation("/add");
    }
  }, []);

  async function login() {
    let data = {email, password};
    let result = await fetch("http://localhost:8000/api/login", {
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
        <h1>Login Page</h1>
        <input
          type="text"
          placeholder="Email here..."
          className="form-control"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password here..."
          className="form-control"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button onClick={login} type="submit" className="btn btn-primary">
          Login
        </button>
      </div>
    </>
  );
}

export default Login;
