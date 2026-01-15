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
      const galleryUrls: string[] = [];
      const itineraryWithImages = [...data.rawItinerary];

      // 1. Main Image Upload
      if (data.imageFile) {
        const file = await storage.createFile(
          BUCKETS.PACKAGE_IMAGES,
          ID.unique(),
          data.imageFile,
        );
        imageUrl = storage.getFileView(BUCKETS.PACKAGE_IMAGES, file.$id);
      }

      // 2. Gallery Images Upload
      if (data.galleryFiles && data.galleryFiles.length > 0) {
        for (const file of data.galleryFiles) {
          const uploaded = await storage.createFile(
            BUCKETS.PACKAGE_IMAGES,
            ID.unique(),
            file,
          );
          const url = storage.getFileView(BUCKETS.PACKAGE_IMAGES, uploaded.$id);
          galleryUrls.push(url);
        }
      }

      // 3. Itinerary Images Upload
      for (let i = 0; i < itineraryWithImages.length; i++) {
        const day = itineraryWithImages[i];
        if (day.imageFile) {
          const uploaded = await storage.createFile(
            BUCKETS.PACKAGE_IMAGES,
            ID.unique(),
            day.imageFile,
          );
          const url = storage.getFileView(BUCKETS.PACKAGE_IMAGES, uploaded.$id);
          itineraryWithImages[i] = {
            ...day,
            image: url, // Save URL
            imageFile: undefined, // Remove file object
            previewUrl: undefined,
          };
        } else {
          // Clean up if no new file (keep existing URL if any, though create page starts empty)
          itineraryWithImages[i] = {
            ...day,
            imageFile: undefined,
            previewUrl: undefined,
          };
        }
      }

      // 4. Transform data
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
        itinerary: JSON.stringify(itineraryWithImages), // Use updated itinerary
        isActive: data.isActive,
        imageUrl: imageUrl,
        images: galleryUrls, // Add gallery URLs
      };

      // 5. Create Document
      await databases.createDocument(
        DATABASE_ID,
        TABLES.PACKAGES,
        ID.unique(),
        payload,
      );

      // 6. Redirect
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
