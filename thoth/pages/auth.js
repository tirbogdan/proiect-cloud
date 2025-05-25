import { useState } from "react";
import { useRouter } from "next/router";
import { verifyAuth } from "../lib/auth";

export async function getServerSideProps(context) {
  const { req } = context;
  const isAuthenticated = verifyAuth(
    req.headers.cookie || "",
    process.env.JWT_SECRET
  );

  if (isAuthenticated) {
    return {
      redirect: {
        destination: "/quiz",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = mode === "login" ? "/api/login" : "/api/register";

    const body =
      mode === "login"
        ? { email: form.email, password: form.password }
        : {
            email: form.email,
            username: form.username,
            password: form.password,
          };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Unknown error");
    } else {
      router.push("/quiz");
    }
  };

  return (
    <div className="auth-container">
      <div className="toggle-buttons">
        <button
          className={`toggle-button ${mode === "login" ? "active" : ""}`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={`toggle-button ${mode === "register" ? "active" : ""}`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        {mode === "register" && (
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="submit-button">
          {mode === "login" ? "Enter the wisdom library" : "Create account"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}
