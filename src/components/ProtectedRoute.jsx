import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../services/authService";

function ProtectedRoute({ allowedRoles = [], children }) {
	const currentUser = getCurrentUser();

	if (!currentUser || !currentUser.verified) {
		return <Navigate to="/" replace />;
	}

	if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
		const redirectPath = currentUser.role === "teacher" ? "/teacher" : "/dashboard";
		return <Navigate to={redirectPath} replace />;
	}

	return children || <Outlet />;
}

export default ProtectedRoute;
