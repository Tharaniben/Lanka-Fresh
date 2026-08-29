import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUserRole } from "../../auth/useUserRole";
import api from "../../services/api";
import {
  getAllUsers,
  updateUserRole,
  type UserInfo,
} from "./userManagementService";
import "./UserManagementPage.css";

const ALL_ROLES = [
  "CUSTOMER",
  "SALES_STAFF",
  "INVENTORY_STAFF",
  "DELIVERY_STAFF",
  "CRO",
  "BRANCH_MANAGER",
];

function formatRole(r: string) {
  return r
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function displayName(u: UserInfo) {
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ");
  return full || u.email || `User #${u.id}`;
}

function UserManagementPage() {
  const { role: userRole, loading: roleLoading } = useUserRole();

  const [users, setUsers] = useState<UserInfo[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saveError, setSaveError] = useState<Record<number, string>>({});
  const [saveSuccess, setSaveSuccess] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [usersData, meRes] = await Promise.all([
          getAllUsers(),
          api.get<{ data: UserInfo }>("/users/me").catch(() => null),
        ]);

        setUsers(usersData);
        if (meRes?.data?.data?.id) {
          setCurrentUserId(meRes.data.data.id);
        }

        const rolesMap: Record<number, string> = {};
        usersData.forEach((u) => {
          rolesMap[u.id] = u.role;
        });
        setSelectedRoles(rolesMap);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load users list";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    if (!roleLoading && userRole === "BRANCH_MANAGER") {
      fetchData();
    }
  }, [roleLoading, userRole]);

  if (roleLoading) {
    return <p className="um-loading">Checking permissions...</p>;
  }

  if (userRole !== "BRANCH_MANAGER") {
    return <Navigate to="/unauthorized" replace />;
  }

  async function handleSave(userId: number) {
    const newRole = selectedRoles[userId];
    if (!newRole) return;

    setSaving((prev) => ({ ...prev, [userId]: true }));
    setSaveError((prev) => ({ ...prev, [userId]: "" }));

    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u))
      );
      setSelectedRoles((prev) => ({ ...prev, [userId]: updated.role }));
      setSaveSuccess((prev) => ({ ...prev, [userId]: true }));

      setTimeout(() => {
        setSaveSuccess((prev) => ({ ...prev, [userId]: false }));
      }, 2000);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        apiErr?.response?.data?.message ||
        apiErr?.message ||
        "Failed to update role";
      setSaveError((prev) => ({ ...prev, [userId]: msg }));
    } finally {
      setSaving((prev) => ({ ...prev, [userId]: false }));
    }
  }

  return (
    <div className="um-page">
      <div className="um-header">
        <h1>User Management</h1>
      </div>

      {loading && <p className="um-loading">Loading users...</p>}
      {error && <p className="um-error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Stats Summary */}
          <div className="um-stats">
            {ALL_ROLES.map((r) => {
              const count = users.filter((u) => u.role === r).length;
              if (count === 0) return null;
              return (
                <span
                  key={r}
                  className={`um-stat-pill um-stat-pill--${r.toLowerCase()}`}
                >
                  {formatRole(r)}: {count}
                </span>
              );
            })}
          </div>

          {/* Table */}
          <div className="um-table-wrapper">
            <table className="um-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>New Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isRoleUnchanged =
                    (selectedRoles[user.id] ?? user.role) === user.role;
                  const isSaving = Boolean(saving[user.id]);

                  return (
                    <tr key={user.id}>
                      <td>
                        <strong>{displayName(user)}</strong>
                        {isSelf && <span className="um-self-badge">(you)</span>}
                      </td>
                      <td>{user.email ?? "—"}</td>
                      <td>
                        <span className="um-role-badge">
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td>
                        <select
                          className="um-role-select"
                          value={selectedRoles[user.id] ?? user.role}
                          onChange={(e) =>
                            setSelectedRoles((prev) => ({
                              ...prev,
                              [user.id]: e.target.value,
                            }))
                          }
                          disabled={isSelf || isSaving}
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {formatRole(r)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="um-save-btn"
                          disabled={isSelf || isRoleUnchanged || isSaving}
                          onClick={() => handleSave(user.id)}
                        >
                          {isSaving ? "Saving…" : "Save"}
                        </button>
                        {saveSuccess[user.id] && (
                          <div className="um-row-feedback um-row-success">
                            ✓ Saved
                          </div>
                        )}
                        {saveError[user.id] && (
                          <div className="um-row-feedback um-row-error">
                            {saveError[user.id]}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default UserManagementPage;
