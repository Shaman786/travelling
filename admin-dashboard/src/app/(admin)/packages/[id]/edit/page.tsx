"use client";

import PackageForm from "@/components/packages/PackageForm";
import {
  BUCKETS,
  DATABASE_ID,
  databases,
  ID,
  storage,
  TABLES,
} from "@/lib/appwrite";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      if (!id) return;

      try {
        const response = await databases.getDocument(
          DATABASE_ID,
          TABLES.PACKAGES,
          id,
        );
        // Map Appwrite document to form data format
        setInitialData({
          title: response.title,
          destination: response.destination,
          country: response.country,
          category: response.category,
          price: response.price,
          duration: response.duration,
          description: response.description,
          imageUrl: response.imageUrl,
          images: response.images || [], // Load existing gallery images
          highlights: response.highlights,
          inclusions: response.inclusions,
          exclusions: response.exclusions,
          itinerary: response.itinerary,
          isActive: response.isActive,
        });
      } catch (error) {
        console.error("Error fetching package:", error);
        alert("Failed to load package details.");
        router.push("/packages");
      } finally {
        setFetching(false);
      }
    };

    fetchPackage();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      let imageUrl = initialData?.imageUrl || "";
      let galleryUrls = [...(data.images || [])]; // Start with existing images
      const itineraryWithImages = [...data.rawItinerary];

      // 1. Upload new main image if selected
      if (data.imageFile) {
        const file = await storage.createFile(
          BUCKETS.PACKAGE_IMAGES,
          ID.unique(),
          data.imageFile,
        );
        imageUrl = storage.getFileView(BUCKETS.PACKAGE_IMAGES, file.$id);
      }

      // 2. Upload new gallery images
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

      // 3. Upload itinerary images
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
            image: url, // Update with new URL
            imageFile: undefined,
            previewUrl: undefined,
          };
        } else {
          // Keep existing image URL if present, clean up transient fields
          itineraryWithImages[i] = {
            ...day,
            imageFile: undefined,
            previewUrl: undefined,
          };
        }
      }

      const payload = {
        title: data.title,
        destination: data.destination,
        country: data.country,
        category: data.category,
        price: parseFloat(data.price),
        duration: data.duration,
        description: data.description,
        highlights: data.highlights,
        inclusions: data.inclusions,
        exclusions: data.exclusions,
        itinerary: JSON.stringify(itineraryWithImages), // Use updated itinerary
        isActive: data.isActive,
        imageUrl: imageUrl, // Update image URL
        images: galleryUrls, // Update gallery URLs
      };

      await databases.updateDocument(DATABASE_ID, TABLES.PACKAGES, id, payload);

      router.push("/packages");
    } catch (error: any) {
      console.error("Error updating package:", error);
      alert(`Failed to update package: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-brand-500 h-8 w-8 animate-spin rounded-full border-4 border-solid border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Edit Package
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update the details of your travel package.
        </p>
      </div>

      <PackageForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </div>
  );
}
