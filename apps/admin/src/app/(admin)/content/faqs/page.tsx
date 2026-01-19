"use client";
import ContentManager from "@/components/content/ContentManager";

export default function FAQsPage() {
  return (
    <ContentManager
      title="FAQs"
      collectionId="faqs"
      columns={[
        { key: "question", label: "Question" },
        { key: "answer", label: "Answer" },
        { key: "sortOrder", label: "Order" },
      ]}
    />
  );
}
