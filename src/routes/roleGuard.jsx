import { Navigate } from "react-router-dom";

export default function RoleGuard({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.role !== role) return <Navigate to="/" />;
  return children;
}