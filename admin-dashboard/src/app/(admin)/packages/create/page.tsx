"use client";

import PackageForm from "@/components/packages/PackageForm";
import {
  account,
  BUCKETS,
  DATABASE_ID,
  databases,
  ID,
  storage,
  TABLES,
} from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreatePackagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await account.get();
      } catch (error) {
        console.error("Not authenticated:", error);
        router.push("/signin");
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      let imageUrl = "";

      // 1. Upload Image if exists
      if (data.imageFile) {
        const file = await storage.createFile(
          BUCKETS.PACKAGE_IMAGES,
          ID.unique(),
          data.imageFile,
        );
        // Construct View URL provided by Appwrite client
        // Note: SDK doesn't always return full URL in createFile response, we generate it or use getFileView
        // We can store the file ID and construct URL on frontend, OR generate a view URL here.
        // For simplicity and to match the 'imageUrl' string schema, let's try to generate the view URL.
        const fileId = file.$id;
        // In client SDK, generating URL is a sync method on 'storage'
        const result = storage.getFileView(BUCKETS.PACKAGE_IMAGES, fileId);
        imageUrl = result; // result is the URL string
      }

      // 2. Transform data
      const payload = {
        title: data.title,
        destination: data.destination,
        country: data.country,
        category: data.category,
        price: parseFloat(data.price),
        duration: data.duration,
        description: data.description,
        rating: 0,
        reviewCount: 0,
        highlights: data.highlights,
        inclusions: data.inclusions,
        exclusions: data.exclusions,
        itinerary: data.itinerary,
        isActive: data.isActive,
        imageUrl: imageUrl,
      };

      // 3. Create Document
      await databases.createDocument(
        DATABASE_ID,
        TABLES.PACKAGES,
        ID.unique(),
        payload,
      );

      // 4. Redirect
      router.push("/packages");
    } catch (error: any) {
      console.error("Error creating package:", error);
      alert(`Failed to create package: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Create New Package
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add a new travel destination to your catalog.
        </p>
      </div>

      <PackageForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
}
