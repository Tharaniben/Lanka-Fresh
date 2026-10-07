export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export type ReportType =
  | "SALES"
  | "REVENUE"
  | "BEST_SELLERS"
  | "INVENTORY"
  | "ORDERS"
  | "DASHBOARD";

export interface TimeSeriesPoint {
  label: string;
  value: number;
  count: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  unitsSold: number;
  percentage: number;
}

export interface BestSellerProduct {
  productId: number;
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
}

export interface DashboardSummary {
  todaySales: number;
  weekRevenue: number;
  totalOrders: number;
  lowStockCount: number;
  salesTrend: TimeSeriesPoint[];
  topProducts: BestSellerProduct[];
  orderStatus: Record<string, number>;
}

export interface SalesReportData {
  range: string;
  startDate: string;
  endDate: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  timeline: TimeSeriesPoint[];
}

export interface RevenueReportData {
  startDate: string;
  endDate: string;
  grossRevenue: number;
  netRevenue: number;
  cancelledAmount: number;
  categoryBreakdown: CategoryRevenue[];
  dailyRevenue: TimeSeriesPoint[];
}

export interface InventoryItem {
  productId: number;
  productName: string;
  category: string;
  currentStock: number;
  lowStockThreshold: number;
  status: "NORMAL" | "LOW_STOCK" | "OUT_OF_STOCK";
  expiryDate: string | null;
  nearExpiry: boolean;
}

export interface InventoryReportData {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  nearExpiryCount: number;
  items: InventoryItem[];
}

export interface OrderSummary {
  orderId: number;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface OrderReportData {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  statusCounts: Record<string, number>;
  recentOrders: OrderSummary[];
}

export interface SavedReport {
  id: number;
  name: string;
  reportType: ReportType;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
  parameters: string | null;
  summaryJson: string | null;
  createdByUserId: number | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedReportRequest {
  name: string;
  reportType: ReportType;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  parameters?: string;
  summaryJson?: string;
}
