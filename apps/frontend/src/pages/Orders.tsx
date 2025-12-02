import React from "react";
import { useNavigate } from "react-router-dom";
import { OrderList } from "@/components/Orders";

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            My Orders
          </h1>
          <p className="text-gray-600 text-lg flex items-center gap-2">
            <span aria-hidden="true">📦</span>
            <span>View and manage your order history</span>
          </p>
        </div>
        <button
          onClick={() => navigate("/orders/create")}
          className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          aria-label="Create new order"
        >
          <span aria-hidden="true" className="text-xl">+</span>
          <span>Create New Order</span>
        </button>
      </div>
      <OrderList />
    </div>
  );
};

export default OrdersPage;
