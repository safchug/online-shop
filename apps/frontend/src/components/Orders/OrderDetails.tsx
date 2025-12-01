import React from "react";
import { Order, OrderStatus } from "@/types/order.types";

interface OrderDetailsProps {
  order: Order;
  onCancel?: () => void;
  canCancel?: boolean;
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.PROCESSING]: "bg-blue-100 text-blue-800",
  [OrderStatus.SHIPPED]: "bg-purple-100 text-purple-800",
  [OrderStatus.DELIVERED]: "bg-green-100 text-green-800",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
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
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                statusColors[order.status]
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            {canCancel &&
              order.status !== OrderStatus.CANCELLED &&
              order.status !== OrderStatus.DELIVERED && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Cancel Order
                </button>
              )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Order Items */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Items
          </h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-3 border-b"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  ${item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Order Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Shipping</span>
              <span>${order.shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Shipping Address
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900">
              {order.shippingAddress.fullName}
            </p>
            <p className="text-gray-700 mt-1">
              {order.shippingAddress.addressLine1}
            </p>
            {order.shippingAddress.addressLine2 && (
              <p className="text-gray-700">
                {order.shippingAddress.addressLine2}
              </p>
            )}
            <p className="text-gray-700">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-gray-700">{order.shippingAddress.country}</p>
            <p className="text-gray-700 mt-2">
              Phone: {order.shippingAddress.phoneNumber}
            </p>
          </div>
        </div>

        {/* Tracking Information */}
        {order.trackingNumber && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Tracking Information
            </h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-700">
                Tracking Number:{" "}
                <span className="font-medium text-blue-900">
                  {order.trackingNumber}
                </span>
              </p>
              {order.shippedAt && (
                <p className="text-gray-700 mt-1">
                  Shipped on: {formatDate(order.shippedAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Delivery Information */}
        {order.deliveredAt && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Delivery Information
            </h3>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-700">
                Delivered on: {formatDate(order.deliveredAt)}
              </p>
            </div>
          </div>
        )}

        {/* Cancellation Information */}
        {order.cancelledAt && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Cancellation Information
            </h3>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-gray-700">
                Cancelled on: {formatDate(order.cancelledAt)}
              </p>
              {order.cancellationReason && (
                <p className="text-gray-700 mt-1">
                  Reason: {order.cancellationReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{order.notes}</p>
            </div>
          </div>
        )}

        {/* Payment Information */}
        {order.paymentId && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Payment Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                Payment ID:{" "}
                <span className="font-medium">{order.paymentId}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
