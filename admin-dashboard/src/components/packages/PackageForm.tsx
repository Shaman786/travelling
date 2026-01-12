"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Image from "next/image";
import React, { useState } from "react";
import ItineraryBuilder from "./ItineraryBuilder";

interface PackageFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function PackageForm({
  initialData,
  onSubmit,
  isLoading,
}: PackageFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    destination: initialData?.destination || "",
    country: initialData?.country || "",
    category: initialData?.category || "beach",
    price: initialData?.price || "",
    duration: initialData?.duration || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    images: initialData?.images || [], // Gallery array
    highlights: initialData?.highlights?.join(", ") || "",
    inclusions: initialData?.inclusions?.join(", ") || "",
    exclusions: initialData?.exclusions?.join(", ") || "",
    isActive: initialData?.isActive ?? true,
  });

  // Separate state for itinerary array
  const [itinerary, setItinerary] = useState<
    { day: number; title: string; description: string; activities: string[] }[]
  >(
    typeof initialData?.itinerary === "string"
      ? JSON.parse(initialData.itinerary || "[]")
      : initialData?.itinerary || [],
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.imageUrl || null,
  );

  // Gallery state
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Transform arrays back to data
    const submissionData = {
      ...formData,
      highlights: formData.highlights
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      inclusions: formData.inclusions
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      exclusions: formData.exclusions
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      imageFile,
      galleryFiles, // Pass gallery files
      itinerary: JSON.stringify(
        itinerary // Itinerary now contains imageFile properties which will be stripped by JSON.stringify but are available in state
          .map((day) => ({
            // Clean up for DB string, but we need the files elsewhere...
            ...day,
            imageFile: undefined, // Don't stringify file object
            previewUrl: undefined,
          })),
      ),
      rawItinerary: itinerary, // Pass raw itinerary with files for upload handler
    };
    await onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label>
                  Package Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="title"
                  placeholder="e.g. Bali Paradise Retreat"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Destination <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="destination"
                    placeholder="e.g. Bali"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="country"
                    placeholder="e.g. Indonesia"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>
                  Category <span className="text-red-500">*</span>
                </Label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="focus:border-brand-300 focus:ring-brand-500/10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:ring-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="beach">Beach</option>
                  <option value="mountain">Mountain</option>
                  <option value="city">City</option>
                  <option value="adventure">Adventure</option>
                  <option value="cultural">Cultural</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  name="description"
                  rows={4}
                  className="focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:ring-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  placeholder="Detailed description of the package..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
              Details & Lists (Comma Separated)
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Highlights</Label>
                <Input
                  name="highlights"
                  placeholder="e.g. Sunset Dinner, Scuba Diving"
                  value={formData.highlights}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Inclusions</Label>
                <Input
                  name="inclusions"
                  placeholder="e.g. Flights, Hotel, Breakfast"
                  value={formData.inclusions}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Exclusions</Label>
                <Input
                  name="exclusions"
                  placeholder="e.g. Personal Expenses, Visa"
                  value={formData.exclusions}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
              Pricing & Logistics
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Price ($) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="price"
                    placeholder="2500"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    type="text"
                    name="duration"
                    placeholder="e.g. 5 Days / 4 Nights"
                    value={formData.duration}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Main Image Upload */}
              <div>
                <Label>Main Package Image</Label>
                {previewUrl && (
                  <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-400 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold"
                />
              </div>

              {/* Gallery Images Upload */}
              <div>
                <Label>Gallery Images (Optional)</Label>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {/* Existing Gallery Images */}
                  {formData.images?.map((imgUrl: string, index: number) => (
                    <div
                      key={`existing-${index}`}
                      className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Gallery ${index}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images?.filter(
                            (_, i) => i !== index,
                          );
                          setFormData((prev) => ({
                            ...prev,
                            images: newImages,
                          }));
                        }}
                        className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* New Previews */}
                  {galleryPreviews.map((url, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <Image
                        src={url}
                        alt={`New ${index}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  className="file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-400 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Select multiple images to add to the gallery.
                </p>
              </div>

              <div>
                <Label>Itinerary</Label>
                <ItineraryBuilder value={itinerary} onChange={setItinerary} />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="text-brand-500 focus:ring-brand-500 h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive">Active (Visible in App)</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button size="sm" disabled={isLoading} type="submit">
          {isLoading ? "Saving..." : "Save Package"}
        </Button>
      </div>
    </form>
  );
}
