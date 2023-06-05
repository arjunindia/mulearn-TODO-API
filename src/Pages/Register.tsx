import { useLocation, Link } from "wouter";
import { useRef, useState } from "react";
export default function Register() {
  const [_, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const username = useRef<HTMLInputElement>(null);
  const pass1 = useRef<HTMLInputElement>(null);
  const pass2 = useRef<HTMLInputElement>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pass1.current?.value !== pass2.current?.value) {
      setError("Passwords do not match");
      return;
    }

    fetch(
      "https://mulearn-internship-task-production.up.railway.app/api/register/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.current?.value,
          password: pass1.current?.value,
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => handleResponse(data))
      .catch((err) => console.log(err));
  };

  const handleResponse = (data: { message?: string; username?: string }) => {
    if (data.username) {
      setError(data.username);
    }
    if (data.message) {
      setError(null);
      setLocation("/login");
    }
  };
  return (
    <>
      <h1>Register</h1>
      <form className="user__form" onSubmit={handleSubmit}>
        <input
          className="form__input"
          ref={username}
          type="text"
          placeholder="Username"
          autoComplete="username"
          required
        />
        <input
          className="form__input"
          ref={pass1}
          type="password"
          minLength={8}
          placeholder="Password"
          autoComplete="new-password"
          required
        />
        <input
          className="form__input"
          ref={pass2}
          type="password"
          placeholder="Confirm Password"
          required
        />
        {error && <p className="form__error">{error}</p>}
        <div className="seperator"></div>
        <button className="form__button" type="submit">
          Register
        </button>
        <Link href="/login" className="form__alr">
          Already have an account?
        </Link>
      </form>
    </>
  );
}
