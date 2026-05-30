import React from "react";

export default function InventoryCategoryTabs({ activeCategory, setActiveCategory }) {
  const categories = [
    "All",
    "Counter",
    "Dish",
    "Glassware",
    "Furniture",
    "Cooking",
    "Cloth",
    "Tent",
    "Accessories",
  ];

  return (
    <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-3 flex-wrap">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`h-[34px] sm:h-[38px] md:h-[40px] px-3 sm:px-4 rounded-[10px] sm:rounded-[12px] border text-[13px] sm:text-[14px] font-medium ${
            activeCategory === category
              ? "bg-[#2563eb] text-white border-[#2563eb]"
              : "bg-white text-[#111827] border-[#d1d5db]"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
