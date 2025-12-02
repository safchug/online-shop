import React from "react";
import { Order, OrderStatus } from "@/types/order.types";
import { useNavigate } from "react-router-dom";

interface OrderCardProps {
  order: Order;
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:
    "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-300",
  [OrderStatus.PROCESSING]:
    "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-300",
  [OrderStatus.SHIPPED]:
    "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border border-purple-300",
  [OrderStatus.DELIVERED]:
    "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-300",
  [OrderStatus.CANCELLED]:
    "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-300",
};

const statusIcons: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "⏳",
  [OrderStatus.PROCESSING]: "⚙️",
  [OrderStatus.SHIPPED]: "🚚",
  [OrderStatus.DELIVERED]: "✅",
  [OrderStatus.CANCELLED]: "❌",
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
      className="group relative border border-gray-200 rounded-xl p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 cursor-pointer bg-white overflow-hidden"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/30 transition-all duration-300 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
              Order #{order.orderNumber}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">📅</span>
              <p className="text-sm text-gray-600 font-medium">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
              statusColors[order.status]
            }`}
          >
            <span className="mr-1">{statusIcons[order.status]}</span>
            {order.status}
          </span>
        </div>

        <div className="space-y-2.5 mb-5 bg-gray-50 rounded-lg p-4">
          {order.items.slice(0, 2).map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-gray-700 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {item.name}{" "}
                <span className="text-gray-500">× {item.quantity}</span>
              </span>
              <span className="text-gray-900 font-bold">
                ${item.subtotal.toFixed(2)}
              </span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
              <span>+{order.items.length - 2} more items</span>
              <span className="text-xs">→</span>
            </p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
          <div className="text-sm">
            <p className="text-gray-500 mb-1 flex items-center gap-1.5">
              <span>📦</span>
              <span className="font-medium">Shipping to:</span>
            </p>
            <p className="font-semibold text-gray-800">
              {order.shippingAddress.fullName}
            </p>
            <p className="text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
          </div>
          <div className="text-right bg-gradient-to-br from-blue-50 to-indigo-50 px-5 py-3 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
              Total
            </p>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              ${order.total.toFixed(2)}
            </p>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
              <span className="text-sm">🔍</span>
              <p className="text-sm text-gray-700">
                Tracking:{" "}
                <span className="font-bold text-purple-700">
                  {order.trackingNumber}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Hover indicator */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-blue-600 text-sm font-semibold flex items-center gap-1">
            View Details <span className="text-lg">→</span>
          </span>
        </div>
      </div>
    </div>
  );
};
