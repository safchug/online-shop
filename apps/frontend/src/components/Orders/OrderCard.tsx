import React from "react";
import { Order, OrderStatus } from "@/types/order.types";
import { useNavigate } from "react-router-dom";

interface OrderCardProps {
  order: Order;
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.PROCESSING]: "bg-blue-100 text-blue-800",
  [OrderStatus.SHIPPED]: "bg-purple-100 text-purple-800",
  [OrderStatus.DELIVERED]: "bg-green-100 text-green-800",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
};

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleClick = () => {
    navigate(`/orders/${order.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[order.status]
          }`}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.slice(0, 2).map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-700">
              {item.name} x {item.quantity}
            </span>
            <span className="text-gray-900 font-medium">
              ${item.subtotal.toFixed(2)}
            </span>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-sm text-gray-500">
            +{order.items.length - 2} more items
          </p>
        )}
      </div>

      <div className="border-t pt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <p>Shipping to: {order.shippingAddress.fullName}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-xl font-bold text-gray-900">
            ${order.total.toFixed(2)}
          </p>
        </div>
      </div>

      {order.trackingNumber && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Tracking:{" "}
            <span className="font-medium">{order.trackingNumber}</span>
          </p>
        </div>
      )}
    </div>
  );
};
