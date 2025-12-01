import React from "react";
import { useNavigate } from "react-router-dom";
import { OrderList } from "@/components/Orders";

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            View and manage your order history
          </p>
        </div>
        <button
          onClick={() => navigate("/orders/create")}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Create New Order
        </button>
      </div>
      <OrderList />
    </div>
  );
};

export default OrdersPage;
