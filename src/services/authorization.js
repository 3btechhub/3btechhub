export function canAccessDashboard(role) { return role === "Owner" || role === "Admin"; }
export function hasRole(role, allowed=[]) { return allowed.includes(role); }
// Admin/Member permission matrix remains pending in the approved specification.
export function isPermissionDefined() { return false; }