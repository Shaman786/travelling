"use client";
import ContentManager from "@/components/content/ContentManager";

export default function CategoriesPage() {
  return (
    <ContentManager
      title="Categories"
      collectionId="categories"
      columns={[
        { key: "name", label: "Name" },
        { key: "icon", label: "Icon" },
        { key: "sortOrder", label: "Order" },
      ]}
    />
  );
}
