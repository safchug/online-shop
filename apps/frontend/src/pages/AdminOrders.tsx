import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrdersAsync,
  updateOrderStatusAsync,
  setPage,
} from "@/store/slices/orderSlice";
import { OrderCard } from "@/components/Orders";
import { OrderStatus, Order } from "@/types/order.types";

const AdminOrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading, error, page, totalPages } = useAppSelector(
    (state) => state.order
  );
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const filters =
      statusFilter !== "all" ? { status: statusFilter, page } : { page };
    dispatch(fetchAllOrdersAsync(filters));
  }, [dispatch, statusFilter, page]);

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      await dispatch(
        updateOrderStatusAsync({
          orderId: selectedOrder.id,
          statusData: {
            status: newStatus,
            trackingNumber: trackingNumber || undefined,
            notes: notes || undefined,
          },
        })
      ).unwrap();
      setShowStatusModal(false);
      setSelectedOrder(null);
      setTrackingNumber("");
      setNotes("");
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || "");
    setNotes(order.notes || "");
    setShowStatusModal(true);
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium text-lg">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-800 px-6 py-5 rounded-xl font-semibold shadow-lg flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span aria-hidden="true" className="text-4xl">👨‍💼</span>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            All Orders (Admin)
          </h1>
        </div>
        <p className="text-gray-600 text-lg ml-16">
          Manage and update order statuses
        </p>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span aria-hidden="true">🔍</span>
          <span>Filter by Status</span>
        </label>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as OrderStatus | "all")
          }
          className="block w-full md:w-80 rounded-xl border-2 border-gray-300 px-4 py-3 shadow-md focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-medium text-gray-700"
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
          <p className="text-gray-500 text-2xl font-bold">No orders found</p>
          <p className="text-gray-400 text-lg mt-2">
            {statusFilter !== "all"
              ? "Try changing the filter"
              : "No orders in the system yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="relative">
                <OrderCard order={order} />
                <button
                  onClick={() => openStatusModal(order)}
                  className="absolute top-6 right-6 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-md hover:shadow-xl transform hover:-translate-y-0.5 z-10"
                >
                  ⚙️ Update Status
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-purple-400 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              >
                ← Previous
              </button>
              <span className="px-6 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl font-bold text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-purple-400 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border-2 border-gray-200 transform transition-all">
            <div className="flex items-center gap-3 mb-4">
              <span aria-hidden="true" className="text-3xl">⚙️</span>
              <h3 className="text-2xl font-black text-gray-900">
                Update Order Status
              </h3>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 rounded-lg mb-6 border-2 border-purple-200">
              <p className="text-sm font-bold text-gray-700">
                Order #{selectedOrder.orderNumber}
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span aria-hidden="true">📊</span>
                  <span>Status</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                >
                  <option value={OrderStatus.PENDING}>⏳ Pending</option>
                  <option value={OrderStatus.PROCESSING}>⚙️ Processing</option>
                  <option value={OrderStatus.SHIPPED}>🚚 Shipped</option>
                  <option value={OrderStatus.DELIVERED}>✅ Delivered</option>
                  <option value={OrderStatus.CANCELLED}>❌ Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span aria-hidden="true">🔍</span>
                  <span>Tracking Number (optional)</span>
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                  placeholder="Enter tracking number"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span aria-hidden="true">📝</span>
                  <span>Notes (optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium resize-none"
                  rows={3}
                  placeholder="Add notes..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                  setTrackingNumber("");
                  setNotes("");
                }}
                disabled={isUpdating}
                className="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isUpdating ? "⏳ Updating..." : "✅ Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
