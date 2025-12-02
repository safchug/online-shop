import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createOrderAsync } from "@/store/slices/orderSlice";
import { OrderItem, ShippingAddress } from "@/types/order.types";

// Mock products for demonstration
const MOCK_PRODUCTS = [
  { id: "1", name: "Laptop", price: 999.99 },
  { id: "2", name: "Mouse", price: 29.99 },
  { id: "3", name: "Keyboard", price: 79.99 },
  { id: "4", name: "Monitor", price: 299.99 },
  { id: "5", name: "Headphones", price: 149.99 },
];

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.order);

  const [cart, setCart] = useState<
    Array<{ productId: string; name: string; price: number; quantity: number }>
  >([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: "",
  });

  const addToCart = (product: { id: string; name: string; price: number }) => {
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    return 10.0; // Flat shipping rate
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping();
    return subtotal + tax + shipping;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Please add items to your cart");
      return;
    }

    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shippingCost = calculateShipping();
    const total = calculateTotal();

    const items: OrderItem[] = cart.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    try {
      const result = await dispatch(
        createOrderAsync({
          items,
          subtotal,
          tax,
          shippingCost,
          total,
          shippingAddress,
        })
      ).unwrap();

      navigate(`/orders/${result.id}`);
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          Create New Order
        </h1>
        <p className="text-gray-600 text-lg">
          Select products and add shipping details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Products Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🛍️</span>
            <h2 className="text-2xl font-bold text-gray-900">
              Available Products
            </h2>
          </div>
          <div className="space-y-4">
            {MOCK_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="group flex justify-between items-center p-5 border-2 border-gray-200 rounded-xl bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </p>
                  <p className="text-gray-600 font-semibold mt-1">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  + Add to Cart
                </button>
              </div>
            ))}
          </div>

          {/* Cart Section */}
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🛒</span>
              <h2 className="text-2xl font-bold text-gray-900">
                Shopping Cart
              </h2>
              {cart.length > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            {cart.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <span className="text-6xl mb-4 block">🛒</span>
                <p className="text-gray-500 text-lg font-medium">
                  Your cart is empty
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Add products to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center p-5 border-2 border-gray-200 rounded-xl bg-white hover:shadow-lg transition-shadow"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">
                        {item.name}
                      </p>
                      <p className="text-gray-600 font-medium mt-1">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.productId,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                      <p className="font-black text-blue-600 text-xl w-28 text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-600 hover:text-red-800 font-semibold px-3 py-2 hover:bg-red-50 rounded-lg transition-all"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-lg">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700 text-lg">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">
                      ${calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-lg">
                    <span className="font-medium">Tax (8%)</span>
                    <span className="font-semibold">
                      ${calculateTax(calculateSubtotal()).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-lg">
                    <span className="font-medium">Shipping</span>
                    <span className="font-semibold">
                      ${calculateShipping().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-2xl font-black pt-4 border-t-2 border-blue-300">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      Total
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address Form */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📦</span>
            <h2 className="text-2xl font-bold text-gray-900">
              Shipping Address
            </h2>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg"
          >
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={shippingAddress.fullName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    fullName: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Address Line 1 *
              </label>
              <input
                type="text"
                required
                value={shippingAddress.addressLine1}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    addressLine1: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Address Line 2
              </label>
              <input
                type="text"
                value={shippingAddress.addressLine2}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    addressLine2: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                placeholder="Apt, Suite, Unit (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      city: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      state: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  placeholder="NY"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.postalCode}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      postalCode: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  placeholder="10001"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.country}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      country: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  placeholder="USA"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={shippingAddress.phoneNumber}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    phoneNumber: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-800 px-5 py-4 rounded-xl font-semibold shadow-md">
                ❌ {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700 hover:border-gray-400 shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || cart.length === 0}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? "⏳ Creating Order..." : "🚀 Place Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;
