"use client";
import ContentManager from "@/components/content/ContentManager";

export default function DestinationsPage() {
  return (
    <ContentManager
      title="Destinations"
      collectionId="destinations"
      columns={[
        { key: "name", label: "Name" },
        { key: "image", label: "Image URL" },
        { key: "sortOrder", label: "Order" },
      ]}
    />
  );
}
