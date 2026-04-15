export type EventItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  price: number;
  ticketsAvailable: number;
  initialTickets: number;
  ownerId: string;
};

export type PurchaseItem = {
  id: string;
  eventId: string;
  eventTitle: string;
  buyerFullName: string;
  buyerEmail: string;
  buyerPhone: string;
  ticketsCount: number;
  unitPrice: number;
  totalAmount: number;
  createdAtMs: number | null;
};

export type DashboardView = "dashboard" | "events" | "tickets";

export type AnalyticsSummary = {
  totalEvents: number;
  totalListed: number;
  remainingTickets: number;
  soldTickets: number;
  sellThroughRate: number;
  totalRevenue: number;
  totalOrders: number;
  uniqueCustomers: number;
};

export type MetricCard = {
  title: string;
  value: string;
  subtitle: string;
  ringColor: string;
};

export type TopCustomer = {
  name: string;
  orders: number;
  tickets: number;
  totalAmount: number;
  email: string;
};

export type TicketGroup = {
  event: EventItem;
  sales: PurchaseItem[];
  soldCount: number;
  totalRevenue: number;
};
