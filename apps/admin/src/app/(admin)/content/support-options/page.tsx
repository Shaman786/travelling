"use client";
import ContentManager from "@/components/content/ContentManager";

export default function SupportOptionsPage() {
  return (
    <ContentManager
      title="Support Options"
      collectionId="support_options"
      columns={[
        { key: "title", label: "Title" },
        { key: "subtitle", label: "Subtitle" },
        { key: "icon", label: "Icon" },
        { key: "route", label: "Route" },
        { key: "sortOrder", label: "Order" },
      ]}
    />
  );
}
