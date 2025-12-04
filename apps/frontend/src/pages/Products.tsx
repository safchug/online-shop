import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProducts,
  deleteProduct,
  setFilters,
  clearFilters,
} from "@/store/slices/productSlice";
import { ProductList, ProductFilters } from "@/components/Products";
import { ProductFilters as IProductFilters } from "@/types/product.types";

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products, loading, error, filters, page, totalPages, total } =
    useAppSelector((state) => state.product);
  const { user } = useAppSelector((state) => state.auth);

  const [showFilters, setShowFilters] = useState(false);

  const isVendorOrAdmin =
    user?.role === "vendor" || user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters: IProductFilters) => {
    dispatch(setFilters({ ...newFilters, page: 1 }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleEdit = (product: any) => {
    navigate(`/products/${product._id}/edit`);
  };

  const handleDelete = async (productId: string) => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      // Refresh the list
      dispatch(fetchProducts(filters));
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setFilters({ ...filters, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Browse our collection of {total} products
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          {isVendorOrAdmin && (
            <button
              onClick={() => navigate("/products/create")}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Product
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {showFilters && (
          <div className="w-64 flex-shrink-0">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

        <div className="flex-1">
          <ProductList
            products={products}
            loading={loading}
            onEdit={isVendorOrAdmin ? handleEdit : undefined}
            onDelete={isVendorOrAdmin ? handleDelete : undefined}
            showActions={isVendorOrAdmin}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 border rounded-md ${
                          page === pageNum
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return <span key={pageNum} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
