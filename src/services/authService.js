import { API_BASE_URL } from "./apiBase";

const USER_KEY = "user";
const ROLE_KEY = "role";
const TOKEN_KEY = "auth_token";
const TEACHER_KEY = "teacher";

const readJson = (key, fallback) => {
try {
const value = localStorage.getItem(key);
return value ? JSON.parse(value) : fallback;
} catch {
return fallback;
}
};

const normalizeEmail = (email) => (email || "").trim().toLowerCase();

const apiRequest = async (path, options = {}) => {
	try {
		const response = await fetch(API_BASE_URL + path, {
			headers: {
				"Content-Type": "application/json",
				...(options.headers || {})
			},
			...options
		});

		const raw = await response.text();
		let data = {};

		try {
			data = raw ? JSON.parse(raw) : {};
		} catch {
			data = {};
		}

		if (!response.ok) {
			return {
				ok: false,
				message: data.message || "Request failed"
			};
		}

		return {
			ok: true,
			data
		};
	} catch {
		return {
			ok: false,
			message: "Unable to connect to backend"
		};
	}
};

export const isValidEmail = (email) =>
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());

export const getPasswordChecks = (password) => ({
length: (password || "").length >= 8,
upper: /[A-Z]/.test(password || ""),
lower: /[a-z]/.test(password || ""),
number: /\d/.test(password || ""),
special: /[^A-Za-z0-9]/.test(password || "")
});

export const isStrongPassword = (password) =>
Object.values(getPasswordChecks(password)).every(Boolean);

export const saveCurrentUser = (user, token) => {
localStorage.setItem(USER_KEY, JSON.stringify(user));
localStorage.setItem(ROLE_KEY, user.role);
if (token) {
localStorage.setItem(TOKEN_KEY, token);
}

if (user.role === "teacher") {
localStorage.setItem(TEACHER_KEY, JSON.stringify(user));
} else {
localStorage.removeItem(TEACHER_KEY);
}
};

export const getCurrentUser = () => readJson(USER_KEY, null);

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const clearCurrentUser = () => {
localStorage.removeItem(USER_KEY);
localStorage.removeItem(ROLE_KEY);
localStorage.removeItem(TOKEN_KEY);
localStorage.removeItem(TEACHER_KEY);
};

export const logout = () => {
clearCurrentUser();
};

export const getRole = () => localStorage.getItem(ROLE_KEY);

export const registerAndSendCode = async ({ name, email, password, role }) => {
const result = await apiRequest("/auth/register", {
method: "POST",
body: JSON.stringify({
name: (name || "").trim(),
email: normalizeEmail(email),
password,
role: (role || "").toUpperCase()
})
});

if (!result.ok) {
return { ok: false, message: result.message };
}

return {
ok: true,
message: result.data.message || "Verification code sent to your email."
};
};

export const resendVerificationCode = async (email) => {
const result = await apiRequest(
"/auth/resend-code?email=" + encodeURIComponent(normalizeEmail(email)),
{ method: "POST" }
);

if (!result.ok) {
return { ok: false, message: result.message };
}

return {
ok: true,
message: result.data.message || "Verification code resent."
};
};

export const verifyEmailCode = async ({ email, code }) => {
const result = await apiRequest("/auth/verify-email", {
method: "POST",
body: JSON.stringify({
email: normalizeEmail(email),
verificationCode: (code || "").trim()
})
});

if (!result.ok) {
return { ok: false, message: result.message };
}

return {
ok: true,
message: result.data.message || "Email verified successfully."
};
};

export const loginUser = async ({ email, password, role }) => {
const result = await apiRequest("/auth/login", {
method: "POST",
body: JSON.stringify({
email: normalizeEmail(email),
password,
role: (role || "").toUpperCase()
})
});

if (!result.ok) {
return { ok: false, message: result.message };
}

const payload = result.data || {};
if (!payload.success) {
return {
ok: false,
message: payload.message || "Login failed"
};
}

const user = {
name: payload.name || normalizeEmail(email).split("@")[0],
email: normalizeEmail(payload.email || email),
role: (payload.role || role || "student").toLowerCase(),
verified: Boolean(payload.verified)
};

saveCurrentUser(user, payload.token || "");

return {
ok: true,
message: payload.message || "Login successful",
user,
token: payload.token || ""
};
};