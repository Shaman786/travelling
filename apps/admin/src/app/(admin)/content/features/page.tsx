"use client";
import ContentManager from "@/components/content/ContentManager";

export default function FeaturesPage() {
  return (
    <ContentManager
      title="Features (Why Book With Us)"
      collectionId="features"
      columns={[
        { key: "title", label: "Title" },
        { key: "subtitle", label: "Subtitle" },
        { key: "icon", label: "Icon" },
        { key: "color", label: "Color" },
        { key: "sortOrder", label: "Order" },
      ]}
    />
  );
}
