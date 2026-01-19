"use client";
import ContentManager from "@/components/content/ContentManager";

export default function ServicesPage() {
  return (
    <ContentManager
      title="Services (Consulting Grid)"
      collectionId="services"
      columns={[
        { key: "label", label: "Label" },
        { key: "icon", label: "Icon" },
        { key: "route", label: "Route" },
        { key: "sortOrder", label: "Order" },
      ]}
    />
  );
}
