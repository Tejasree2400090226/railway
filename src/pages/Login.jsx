import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, isValidEmail, loginUser } from "../services/authService";

function Login() {
const [role, setRole] = useState("student");
const createCaptcha = () => ({
num1: Math.floor(Math.random() * 10) + 1,
num2: Math.floor(Math.random() * 10) + 1
});
const [captcha, setCaptcha] = useState(() => createCaptcha());
const [answer, setAnswer] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [busy, setBusy] = useState(false);

const navigate = useNavigate();

const generateCaptcha = () => {
  setCaptcha(createCaptcha());
};

useEffect(() => {
const currentUser = getCurrentUser();
if (currentUser && currentUser.verified) {
navigate(currentUser.role === "teacher" ? "/teacher" : "/dashboard", {
replace: true
});
}
}, [navigate]);

const handleLogin = async () => {
const correctAnswer = captcha.num1 * captcha.num2;
if (parseInt(answer, 10) !== correctAnswer) {
  alert("CAPTCHA incorrect");
  generateCaptcha();
  setAnswer("");
  return;
}

if (!email || !password) {
  alert("Enter email and password");
  return;
}

if (!isValidEmail(email)) {
  alert("Use a valid email address");
  return;
}

setBusy(true);
const result = await loginUser({ email, password, role });
setBusy(false);

if (!result.ok) {
  alert(result.message);
  generateCaptcha();
  setAnswer("");
  return;
}

navigate(result.user.role === "teacher" ? "/teacher" : "/dashboard", {
  replace: true
});
};
return (
<div className="login-wrapper">
<div className="login-left">
<div className="left-content">
<img src="https://illustrations.popsy.co/blue/student-graduation.svg" alt="illustration" />
<h2>ProjectTrack</h2>
<p>Manage projects, track progress and feedback.</p>
</div>
</div>
  <div className="login-right">
    <div className="login-box">
      <div className="login-tabs">
        <button
          className={role === "student" ? "active-tab" : ""}
          onClick={() => setRole("student")}
          type="button"
        >
          Student
        </button>

        <button
          className={role === "teacher" ? "active-tab" : ""}
          onClick={() => setRole("teacher")}
          type="button"
        >
          Teacher
        </button>
      </div>

      <div className="login-group">
        <label>Email</label>
        <input
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="login-group">
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="login-group">
        <label>Security check</label>

        <div className="captcha-row">
          <div className="captcha-question">
            {captcha.num1} × {captcha.num2} = ?
          </div>

          <button onClick={generateCaptcha} type="button">
            Refresh
          </button>
        </div>

        <input
          placeholder="Answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
        />
      </div>

      <button onClick={handleLogin} className="login-button" disabled={busy}>
        {busy ? "Please wait..." : role === "student" ? "Login as Student" : "Login as Teacher"}
      </button>

      <div className="auth-switcher">
        <span>Need an account?</span>
        <Link to="/register">Create one</Link>
      </div>
    </div>
  </div>
</div>
);
}

export default Login;