// Local copy until/unless the team promotes a shared version to src/types/.
// Mirrors the backend's ApiResponse<T> envelope from com.lankafresh.backend.config.
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}