import api from "../../services/api";

export interface UserInfo {
  id: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export async function getAllUsers(): Promise<UserInfo[]> {
  const res = await api.get<ApiResponse<UserInfo[]>>("/users");
  return res.data.data;
}

export async function updateUserRole(
  userId: number,
  role: string
): Promise<UserInfo> {
  const res = await api.patch<ApiResponse<UserInfo>>(
    `/users/${userId}/role`,
    { role }
  );
  return res.data.data;
}
