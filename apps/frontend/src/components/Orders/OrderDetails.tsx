import React from "react";
import { Order, OrderStatus } from "@/types/order.types";

interface OrderDetailsProps {
  order: Order;
  onCancel?: () => void;
  canCancel?: boolean;
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:
    "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-300",
  [OrderStatus.PROCESSING]:
    "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-300",
  [OrderStatus.SHIPPED]:
    "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-purple-300",
  [OrderStatus.DELIVERED]:
    "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-300",
  [OrderStatus.CANCELLED]:
    "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-300",
};

const statusIcons: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "⏳",
  [OrderStatus.PROCESSING]: "⚙️",
  [OrderStatus.SHIPPED]: "🚚",
  [OrderStatus.DELIVERED]: "✅",
  [OrderStatus.CANCELLED]: "❌",
};

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onCancel,
  canCancel = false,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Order #{order.orderNumber}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-500">📅</span>
              <p className="text-sm text-gray-700 font-medium">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider border shadow-md ${
                statusColors[order.status]
              }`}
            >
              <span className="mr-1.5">{statusIcons[order.status]}</span>
              {order.status}
            </span>
            {canCancel &&
              order.status !== OrderStatus.CANCELLED &&
              order.status !== OrderStatus.DELIVERED && (
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Cancel Order
                </button>
              )}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Order Items */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🛍️</span>
            <h3 className="text-xl font-bold text-gray-900">Order Items</h3>
          </div>
          <div className="space-y-3 bg-gray-50 rounded-lg p-5 border border-gray-200">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-4 px-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <span className="font-semibold">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-gray-400">×</span>
                    <span className="font-semibold">{item.quantity}</span>
                  </p>
                </div>
                <p className="font-black text-xl text-blue-600">
                  ${item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">💰</span>
            <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700 text-lg">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">
                ${order.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-gray-700 text-lg">
              <span className="font-medium">Tax</span>
              <span className="font-semibold">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700 text-lg">
              <span className="font-medium">Shipping</span>
              <span className="font-semibold">
                ${order.shippingCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xl font-black pt-4 border-t-2 border-blue-300">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Total
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">📦</span>
            <h3 className="text-xl font-bold text-gray-900">
              Shipping Address
            </h3>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-300 shadow-md">
            <p className="font-bold text-gray-900 text-lg">
              {order.shippingAddress.fullName}
            </p>
            <p className="text-gray-700 mt-2 font-medium">
              {order.shippingAddress.addressLine1}
            </p>
            {order.shippingAddress.addressLine2 && (
              <p className="text-gray-700 font-medium">
                {order.shippingAddress.addressLine2}
              </p>
            )}
            <p className="text-gray-700 font-medium">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-gray-700 font-semibold">
              {order.shippingAddress.country}
            </p>
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="text-gray-700 flex items-center gap-2">
                <span className="font-semibold">📞 Phone:</span>
                <span className="font-medium">
                  {order.shippingAddress.phoneNumber}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Information */}
        {order.trackingNumber && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">🔍</span>
              <h3 className="text-xl font-bold text-gray-900">
                Tracking Information
              </h3>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-300 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-700">
                  Tracking Number:
                </span>
                <span className="font-black text-purple-900 text-lg">
                  {order.trackingNumber}
                </span>
              </div>
              {order.shippedAt && (
                <p className="text-gray-700 flex items-center gap-2">
                  <span className="font-semibold">🚚 Shipped on:</span>
                  <span className="font-medium">
                    {formatDate(order.shippedAt)}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Delivery Information */}
        {order.deliveredAt && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">✅</span>
              <h3 className="text-xl font-bold text-gray-900">
                Delivery Information
              </h3>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-300 shadow-md">
              <p className="text-gray-700 flex items-center gap-2">
                <span className="font-semibold">📅 Delivered on:</span>
                <span className="font-bold text-green-800 text-lg">
                  {formatDate(order.deliveredAt)}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Cancellation Information */}
        {order.cancelledAt && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">❌</span>
              <h3 className="text-xl font-bold text-gray-900">
                Cancellation Information
              </h3>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border-2 border-red-300 shadow-md">
              <p className="text-gray-700 flex items-center gap-2 mb-2">
                <span className="font-semibold">📅 Cancelled on:</span>
                <span className="font-bold text-red-800">
                  {formatDate(order.cancelledAt)}
                </span>
              </p>
              {order.cancellationReason && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-gray-700">
                    <span className="font-semibold">Reason:</span>{" "}
                    <span className="font-medium">
                      {order.cancellationReason}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">📝</span>
              <h3 className="text-xl font-bold text-gray-900">Notes</h3>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-6 border border-yellow-300 shadow-md">
              <p className="text-gray-700 font-medium italic">{order.notes}</p>
            </div>
          </div>
        )}

        {/* Payment Information */}
        {order.paymentId && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">💳</span>
              <h3 className="text-xl font-bold text-gray-900">
                Payment Information
              </h3>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-300 shadow-md">
              <p className="text-gray-700 flex items-center gap-2">
                <span className="font-semibold">Payment ID:</span>
                <span className="font-bold text-indigo-700">
                  {order.paymentId}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
