import type { FunctionReturnType } from "convex/server";
import type { api } from "../../../convex/_generated/api";

export type DashBooking = FunctionReturnType<typeof api.dashboard.listBookings>[number];
export type BookingDetail = NonNullable<FunctionReturnType<typeof api.dashboard.bookingDetail>>;
