import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addonService } from "../../../src/lib/databaseService";
import { useStore } from "../../../src/store/useStore";
import { Addon } from "../../../src/types";

export default function BookingAddonsScreen() {
  const { packageId } = useLocalSearchParams();
  const router = useRouter();

  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);

  const bookingDraft = useStore((state) => state.bookingDraft);
  const addAddon = useStore((state) => state.addAddon);
  const removeAddon = useStore((state) => state.removeAddon);

  const selectedAddons = bookingDraft.selectedAddons || [];

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    try {
      const data = await addonService.getAddons();
      setAddons(data);
    } catch (error) {
      console.error("Failed to fetch add-ons", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAddon = (addon: Addon) => {
    if (selectedAddons.includes(addon.$id)) {
      removeAddon(addon.$id);
    } else {
      addAddon(addon.$id);
    }
  };

  const handleNext = () => {
    router.push(`/booking/${packageId}/review`);
  };

  const getAddonPrice = (addon: Addon) => {
    // Calculate display price (logic mainly for UI, final calc in review)
    if (addon.type === "per_person") {
      const totalPeople =
        (bookingDraft.adultsCount || 1) + (bookingDraft.childrenCount || 0);
      return `$${addon.price * totalPeople} ($${addon.price} x ${totalPeople})`;
    }
    return `$${addon.price}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 active:opacity-70 active:scale-95"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-bold">Enhance Your Trip</Text>
          <Text className="text-xs text-gray-500">Step 3 of 4</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <Text className="text-xl font-bold mb-2">Recommended Add-ons</Text>
        <Text className="text-gray-500 mb-6">
          Optional services to make your journey more comfortable.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : addons.length === 0 ? (
          <View className="py-8 items-center">
            <Text className="text-gray-400">
              No add-ons available for this trip.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {addons.map((addon) => {
              const isSelected = selectedAddons.includes(addon.$id);
              return (
                <Pressable
                  key={addon.$id}
                  onPress={() => toggleAddon(addon)}
                  className={`flex-row p-4 rounded-xl border-2 items-center active:scale-[0.98] active:opacity-90 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <View
                    className={`h-12 w-12 rounded-full items-center justify-center mr-4 ${isSelected ? "bg-blue-100" : "bg-gray-100"}`}
                  >
                    <MaterialCommunityIcons
                      name={(addon.icon as any) || "bag-suitcase"}
                      size={24}
                      color={isSelected ? "#2563EB" : "#6B7280"}
                    />
                  </View>

                  <View className="flex-1">
                    <Text
                      className={`font-bold text-base ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                    >
                      {addon.name}
                    </Text>
                    <Text className="text-sm text-gray-500 mb-1">
                      {addon.description}
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {getAddonPrice(addon)}
                    </Text>
                  </View>

                  <View
                    className={`h-6 w-6 rounded-full border-2 items-center justify-center ml-2 ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
                  >
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="white"
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="p-4 border-t border-gray-100 bg-white shadow-lg">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-500">Selected Add-ons</Text>
          <Text className="font-bold text-lg">{selectedAddons.length}</Text>
        </View>
        <Pressable
          onPress={handleNext}
          className="bg-blue-600 py-4 rounded-xl items-center shadow-blue-200 shadow-md active:scale-[0.98] active:opacity-90"
        >
          <Text className="text-white font-bold text-lg">
            Continue to Review
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
