"use client";

import React from "react";
import { Category } from "@/types";

interface CategoryFilterProps {
    categories: Category[];
    activeCategory: string;
    onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({
    categories,
    activeCategory,
    onCategoryChange,
}: CategoryFilterProps) {
    return (
        <div className="category-filter">
            <div className="category-scroll">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        id={`category-${category.id}`}
                        className={`category-chip ${activeCategory === category.id ? "active" : ""}`}
                        onClick={() => onCategoryChange(category.id)}
                    >
                        <span className="category-chip-icon">{category.icon}</span>
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
