import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchOrderByIdAsync,
  cancelOrderAsync,
  clearCurrentOrder,
} from "@/store/slices/orderSlice";
import { OrderDetails } from "@/components/Orders";

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentOrder, isLoading, error } = useAppSelector(
    (state) => state.order
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderByIdAsync(id));
    }

    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id]);

  const handleCancelOrder = async () => {
    if (!id) return;

    setIsCancelling(true);
    try {
      await dispatch(
        cancelOrderAsync({
          orderId: id,
          data: cancelReason ? { reason: cancelReason } : undefined,
        })
      ).unwrap();
      setShowCancelModal(false);
      setCancelReason("");
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium text-lg">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-800 px-6 py-5 rounded-xl font-semibold shadow-lg flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <span>Error: {error}</span>
        </div>
        <button
          onClick={() => navigate("/orders")}
          className="mt-6 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 text-lg hover:gap-3 transition-all"
        >
          <span>←</span>
          <span>Back to Orders</span>
        </button>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <span className="text-8xl block mb-4">🔍</span>
          <p className="text-gray-500 text-2xl font-bold">Order not found</p>
        </div>
        <button
          onClick={() => navigate("/orders")}
          className="mt-6 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 text-lg hover:gap-3 transition-all mx-auto"
        >
          <span>←</span>
          <span>Back to Orders</span>
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button
        onClick={() => navigate("/orders")}
        className="mb-8 text-blue-600 hover:text-blue-800 font-bold flex items-center gap-2 text-lg hover:gap-3 transition-all px-4 py-2 hover:bg-blue-50 rounded-lg"
      >
        <span className="text-xl">←</span>
        <span>Back to Orders</span>
      </button>

      <OrderDetails
        order={currentOrder}
        onCancel={() => setShowCancelModal(true)}
        canCancel={true}
      />

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-gray-200 transform transition-all">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-2xl font-black text-gray-900">
                Cancel Order
              </h3>
            </div>
            <p className="text-gray-700 mb-6 font-medium text-lg leading-relaxed">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span>📝</span>
                <span>Reason for cancellation (optional)</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium resize-none"
                rows={4}
                placeholder="Please provide a reason..."
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                disabled={isCancelling}
                className="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isCancelling ? "⏳ Cancelling..." : "❌ Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
