import React from "react";
import { useNavigate } from "react-router-dom";
import { SearchAutocomplete } from "@/components/Products/SearchAutocomplete";
import { Product } from "@/types/product.types";

interface SearchBarProps {
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState("");

  const handleSelectProduct = (product: Product) => {
    navigate(`/products/${product._id}`);
    setSearchValue("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue)}`);
      setSearchValue("");
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <SearchAutocomplete
        value={searchValue}
        onChange={setSearchValue}
        onSelectProduct={handleSelectProduct}
        placeholder="Search for products..."
        className="w-full"
      />
    </form>
  );
};
