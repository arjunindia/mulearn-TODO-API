import { Link, useLocation } from "wouter";
import { useState, useRef } from "react";

export default function Login() {
  const [_, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetch(
      "https://mulearn-internship-task-production.up.railway.app/api/login/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.current?.value,
          password: password.current?.value,
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => handleResponse(data))
        .catch((err) => console.log(err));
  };
  const handleResponse = (data: {
    refresh: string;
    access: string;
    detail?: string;
  }) => {
    const user = {
      username: username.current?.value,
      refresh: data.refresh,
      access: data.access,
    };
    if (data.detail) {
      setError(data.detail);
    }
    if (data.access) {
      localStorage.setItem("user", JSON.stringify(user));
      setError(null);
      setLocation("/");
    } 
  };
  return (
    <>
      <h1>Login</h1>
      <form className="user__form" onSubmit={handleSubmit}>
        <input
          className="form__input"
          ref={username}
          type="text"
          placeholder="Username"
          required
        />
        <input
          className="form__input"
          ref={password}
          type="password"
          placeholder="Password"
          required
        />
        {error && <p className="form__error">{error}</p>}
        <div className="seperator"></div>
        <button className="form__button" type="submit">
          Login
        </button>
        <Link href="/register" className="form__alr">
          Don't have an account?
        </Link>
      </form>
    </>
  );
}
