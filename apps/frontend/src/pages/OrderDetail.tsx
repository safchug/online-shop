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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Orders
        </button>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <p className="text-gray-500">Order not found</p>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button
        onClick={() => navigate("/orders")}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <span className="mr-2">←</span> Back to Orders
      </button>

      <OrderDetails
        order={currentOrder}
        onCancel={() => setShowCancelModal(true)}
        canCancel={true}
      />

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cancel Order
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Please provide a reason..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
