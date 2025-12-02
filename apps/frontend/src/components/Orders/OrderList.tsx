import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserOrdersAsync, setPage } from "@/store/slices/orderSlice";
import { OrderCard } from "./OrderCard";
import { OrderStatus } from "@/types/order.types";

export const OrderList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading, error, page, totalPages } = useAppSelector(
    (state) => state.order
  );
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    const filters =
      statusFilter !== "all" ? { status: statusFilter, page } : { page };
    dispatch(fetchUserOrdersAsync(filters));
  }, [dispatch, statusFilter, page]);

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-800 px-6 py-4 rounded-xl font-semibold shadow-lg flex items-center gap-3">
        <span className="text-2xl">❌</span>
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span>🔍</span>
          <span>Filter by Status</span>
        </label>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as OrderStatus | "all")
          }
          className="block w-full md:w-80 rounded-xl border-2 border-gray-300 px-4 py-3 shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-gray-700"
        >
          <option value="all">📋 All Orders</option>
          <option value={OrderStatus.PENDING}>⏳ Pending</option>
          <option value={OrderStatus.PROCESSING}>⚙️ Processing</option>
          <option value={OrderStatus.SHIPPED}>🚚 Shipped</option>
          <option value={OrderStatus.DELIVERED}>✅ Delivered</option>
          <option value={OrderStatus.CANCELLED}>❌ Cancelled</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <span className="text-8xl block mb-4">📦</span>
          <p className="text-gray-500 text-2xl font-bold mb-2">
            No orders found
          </p>
          <p className="text-gray-400 text-lg">
            {statusFilter !== "all"
              ? "Try changing the filter"
              : "Start by creating a new order"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-blue-400 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              >
                ← Previous
              </button>
              <span className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl font-bold text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-blue-400 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
