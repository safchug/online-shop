import React, { useState } from "react";
import { ProductCategory, ProductFilters as IProductFilters } from "@/types/product.types";

interface ProductFiltersProps {
  filters: IProductFilters;
  onFilterChange: (filters: IProductFilters) => void;
  onClearFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<IProductFilters>(filters);

  const handleChange = (key: keyof IProductFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    setLocalFilters({ page: 1, limit: 12 });
    onClearFilters();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <button
          onClick={handleClear}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={localFilters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            placeholder="Search products..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={localFilters.category || ""}
            onChange={(e) =>
              handleChange(
                "category",
                e.target.value ? (e.target.value as ProductCategory) : undefined
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {Object.values(ProductCategory).map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={localFilters.minPrice || ""}
              onChange={(e) =>
                handleChange(
                  "minPrice",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              placeholder="Min"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={localFilters.maxPrice || ""}
              onChange={(e) =>
                handleChange(
                  "maxPrice",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              placeholder="Max"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stock Status */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localFilters.inStock || false}
              onChange={(e) => handleChange("inStock", e.target.checked || undefined)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>
        </div>

        {/* Featured */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localFilters.isFeatured || false}
              onChange={(e) => handleChange("isFeatured", e.target.checked || undefined)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Featured Only</span>
          </label>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={localFilters.sortBy || ""}
            onChange={(e) =>
              handleChange("sortBy", e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Default</option>
            <option value="price">Price</option>
            <option value="name">Name</option>
            <option value="rating">Rating</option>
            <option value="sold">Most Sold</option>
            <option value="createdAt">Newest</option>
          </select>
        </div>

        {/* Sort Order */}
        {localFilters.sortBy && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort Order
            </label>
            <select
              value={localFilters.sortOrder || "asc"}
              onChange={(e) =>
                handleChange("sortOrder", e.target.value as "asc" | "desc")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
