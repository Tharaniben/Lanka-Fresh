import api from "../../services/api";
import type {
  ApiResponse,
  DashboardSummary,
  SalesReportData,
  RevenueReportData,
  BestSellerProduct,
  InventoryReportData,
  OrderReportData,
  SavedReport,
  SavedReportRequest,
} from "./types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get<ApiResponse<DashboardSummary>>("/reports/dashboard");
  return res.data.data;
}

export async function getSalesReport(
  range = "daily",
  from?: string,
  to?: string
): Promise<SalesReportData> {
  const params: Record<string, string> = { range };
  if (from) params.from = from;
  if (to) params.to = to;

  const res = await api.get<ApiResponse<SalesReportData>>("/reports/sales", {
    params,
  });
  return res.data.data;
}

export async function getRevenueReport(
  from?: string,
  to?: string
): Promise<RevenueReportData> {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to) params.to = to;

  const res = await api.get<ApiResponse<RevenueReportData>>("/reports/revenue", {
    params,
  });
  return res.data.data;
}

export async function getBestSellers(
  limit = 10
): Promise<BestSellerProduct[]> {
  const res = await api.get<ApiResponse<BestSellerProduct[]>>(
    "/reports/best-sellers",
    { params: { limit } }
  );
  return res.data.data;
}

export async function getInventoryReport(): Promise<InventoryReportData> {
  const res = await api.get<ApiResponse<InventoryReportData>>(
    "/reports/inventory"
  );
  return res.data.data;
}

export async function getOrderReport(): Promise<OrderReportData> {
  const res = await api.get<ApiResponse<OrderReportData>>("/reports/orders");
  return res.data.data;
}

// ── Saved Reports CRUD ──────────────────────────────────────────────

export async function getAllSavedReports(): Promise<SavedReport[]> {
  const res = await api.get<ApiResponse<SavedReport[]>>("/reports/saved");
  return res.data.data;
}

export async function getSavedReportById(id: number): Promise<SavedReport> {
  const res = await api.get<ApiResponse<SavedReport>>(`/reports/saved/${id}`);
  return res.data.data;
}

export async function createSavedReport(
  data: SavedReportRequest
): Promise<SavedReport> {
  const res = await api.post<ApiResponse<SavedReport>>("/reports/saved", data);
  return res.data.data;
}

export async function updateSavedReport(
  id: number,
  data: SavedReportRequest
): Promise<SavedReport> {
  const res = await api.put<ApiResponse<SavedReport>>(
    `/reports/saved/${id}`,
    data
  );
  return res.data.data;
}

export async function deleteSavedReport(id: number): Promise<void> {
  await api.delete(`/reports/saved/${id}`);
}
