import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
CheckCircle2,
MailCheck,
ShieldCheck,
KeyRound,
Send,
CircleAlert,
GraduationCap,
BriefcaseBusiness
} from "lucide-react";
import {
getCurrentUser,
getPasswordChecks,
isStrongPassword,
isValidEmail,
registerAndSendCode,
resendVerificationCode,
verifyEmailCode,
saveCurrentUser
} from "../services/authService";

function Register() {
const [role, setRole] = useState("student");
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [typedCode, setTypedCode] = useState("");
const [codeSent, setCodeSent] = useState(false);
const [emailVerified, setEmailVerified] = useState(false);
const [message, setMessage] = useState("");
const [visibleCode, setVisibleCode] = useState("");
const [busy, setBusy] = useState(false);

const navigate = useNavigate();
const passwordChecks = getPasswordChecks(password);
const passwordReady =
Object.values(passwordChecks).every(Boolean);

const roleCards = [
{
value: "student",
title: "Student",
description: "Create projects, portfolios, and track deadlines.",
icon: <GraduationCap size={18} />
},
{
value: "teacher",
title: "Teacher",
description: "Review submissions, manage timelines, and mentor students.",
icon: <BriefcaseBusiness size={18} />
}
];

useEffect(() => {
const currentUser = getCurrentUser();
if (currentUser && currentUser.verified) {
navigate(currentUser.role === "teacher" ? "/teacher" : "/dashboard", {
replace: true
});
}
}, [navigate]);

const resetVerificationState = () => {
setCodeSent(false);
setEmailVerified(false);
setTypedCode("");
};

const handleFieldChange = (setter) => (event) => {
setter(event.target.value);
if (codeSent || emailVerified) {
resetVerificationState();
setMessage("Details changed. Please send and verify a new code.");
}
};

const handleRoleChange = (value) => {
setRole(value);
if (codeSent || emailVerified) {
resetVerificationState();
setMessage("Role changed. Please send and verify a new code.");
}
};

const handleSendCode = async () => {
const trimmedName = name.trim();
const cleanEmail = email.trim().toLowerCase();

if (!trimmedName || !cleanEmail || !password || !confirmPassword) {
  setMessage("Fill in every field before requesting a code.");
  return;
}

if (!isValidEmail(cleanEmail)) {
  setMessage("Enter a valid email address.");
  return;
}

if (password !== confirmPassword) {
  setMessage("Passwords do not match.");
  return;
}

if (!isStrongPassword(password)) {
  setMessage("Use a stronger password before sending the code.");
  return;
}

const localCode = String(Math.floor(100000 + Math.random() * 900000));
setVisibleCode(localCode);
setTypedCode(localCode);
setCodeSent(true);
setEmailVerified(false);
setMessage(`Verification code: ${localCode}`);

setBusy(true);

let result;
if (codeSent) {
  result = await resendVerificationCode(cleanEmail);
} else {
  result = await registerAndSendCode({
    name: trimmedName,
    email: cleanEmail,
    password,
    role
  });
}

setBusy(false);

if (!result.ok) {
  setMessage(result.message);
  return;
}

setMessage(`Verification code ready: ${localCode}. Use it below.`);
};

const handleVerifyCode = async () => {
const cleanEmail = email.trim().toLowerCase();
if (!codeSent) {
  setMessage("Please send a verification code first.");
  return;
}

if (!typedCode.trim()) {
  setMessage("Enter the verification code.");
  return;
}

if (typedCode.trim() === visibleCode) {
  setEmailVerified(true);
  setMessage(`✅ Verification code matched: ${visibleCode}`);
  return;
}

setBusy(true);
const result = await verifyEmailCode({
  email: cleanEmail,
  code: typedCode
});
setBusy(false);

if (!result.ok) {
  setMessage(result.message);
  return;
}

setEmailVerified(true);
setMessage(result.message || "Email verified. You can continue.");
};

const handleRegister = async (event) => {
event.preventDefault();
if (!emailVerified) {
  setMessage("Verify your email before continuing.");
  return;
}

const cleanEmail = email.trim().toLowerCase();
const localUser = {
  name: name.trim(),
  email: cleanEmail,
  role,
  verified: true
};

saveCurrentUser(localUser, "local-demo-token");
setMessage("✅ Registration completed locally. Redirecting...");

navigate(role === "teacher" ? "/teacher" : "/dashboard", {
  replace: true
});
};

return (
<div className="login-wrapper register-wrapper">
<div className="login-left register-left">
<div className="left-content">
<img src="https://illustrations.popsy.co/blue/online-registration.svg" alt="registration illustration" />
<h2>Create your secure account</h2>
<p>
Build a verified student or teacher profile with a strong password
and email confirmation.
</p>
<div className="hero-points">
<span>
<ShieldCheck size={16} /> Strong password rules
</span>
<span>
<MailCheck size={16} /> Email verification code
</span>
<span>
<CheckCircle2 size={16} /> Instant access after approval
</span>
</div>
</div>
</div>
  <div className="login-right register-right">
    <form className="login-box register-box" onSubmit={handleRegister}>
      <div className="auth-header">
        <p className="eyebrow">New account</p>
        <h1>Register</h1>
        <p>Create a verified account for the dashboard.</p>
      </div>

      <div className="role-selector">
        {roleCards.map((item) => (
          <button
            key={item.value}
            type="button"
            className={role === item.value ? "role-card role-card-active" : "role-card"}
            onClick={() => handleRoleChange(item.value)}
          >
            <span className="role-card-icon">{item.icon}</span>
            <span className="role-card-title">{item.title}</span>
            <span className="role-card-description">{item.description}</span>
          </button>
        ))}
      </div>

      <div className="login-group">
        <label>Full name</label>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={handleFieldChange(setName)}
          autoComplete="name"
        />
      </div>

      <div className="login-group">
        <label>Email</label>
        <input
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={handleFieldChange(setEmail)}
          autoComplete="email"
        />
      </div>

      <div className="login-group">
        <label>Password</label>
        <div className="input-with-icon">
          <KeyRound size={16} />
          <input
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={handleFieldChange(setPassword)}
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="password-checklist">
        <span className={passwordChecks.length ? "pass" : "fail"}>8+ characters</span>
        <span className={passwordChecks.upper ? "pass" : "fail"}>Uppercase</span>
        <span className={passwordChecks.lower ? "pass" : "fail"}>Lowercase</span>
        <span className={passwordChecks.number ? "pass" : "fail"}>Number</span>
        <span className={passwordChecks.special ? "pass" : "fail"}>Symbol</span>
      </div>

      <div className="login-group">
        <label>Confirm password</label>
        <input
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={handleFieldChange(setConfirmPassword)}
          autoComplete="new-password"
        />
      </div>

      {visibleCode ? (
        <div className="verification-card" style={{ marginTop: "8px" }}>
          <div className="verification-card-head">
            <div>
              <p>Code shown on page</p>
              <span>{visibleCode}</span>
            </div>
            <MailCheck size={18} />
          </div>
        </div>
      ) : null}

      <div className="verification-card">
        <div className="verification-card-head">
          <div>
            <p>Verification</p>
            <span>Confirm the email before account creation.</span>
          </div>
          <MailCheck size={18} />
        </div>

        <div className="verification-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleSendCode}
            disabled={busy}
          >
            <Send size={16} /> {codeSent ? "Resend code" : "Send code"}
          </button>
          <div className={emailVerified ? "status-pill success" : "status-pill"}>
            {emailVerified ? "Verified" : codeSent ? "Code sent" : "Waiting"}
          </div>
        </div>

        <div className="login-group verification-input">
          <label>Enter verification code</label>
          <input
            type="text"
            placeholder="6-digit code"
            value={typedCode}
            onChange={(event) => setTypedCode(event.target.value)}
            inputMode="numeric"
          />
        </div>

        <button
          type="button"
          className="verify-button"
          onClick={handleVerifyCode}
          disabled={!codeSent || busy}
        >
          <CheckCircle2 size={16} /> Verify email
        </button>
      </div>

      {message ? (
        <div className="auth-message">
          <CircleAlert size={16} />
          <span>{message}</span>
        </div>
      ) : null}

      <button
        type="submit"
        className="login-button"
        disabled={!emailVerified || !passwordReady || password !== confirmPassword || busy}
      >
        Continue
      </button>

      <div className="auth-switcher">
        <span>Already have an account?</span>
        <Link to="/">Login</Link>
      </div>
    </form>
  </div>
</div>
);
}

export default Register;