import { Skeleton as MotiSkeleton } from "moti/skeleton";
import React from "react";
import { StyleSheet, View } from "react-native";

export const Skeleton = ({
  width,
  height,
  radius = 4,
}: {
  width: number | string;
  height: number | string;
  radius?: number;
}) => {
  return (
    <MotiSkeleton
      colorMode="light"
      width={width as any}
      height={height as any}
      radius={radius}
      colors={["#E1E9EE", "#F2F8FC"]}
    />
  );
};

export const PackageCardSkeleton = () => {
  return (
    <View style={styles.card}>
      {/* Image Placeholder */}
      <Skeleton width="100%" height={180} radius={12} />

      <View style={styles.content}>
        {/* Title & Rating */}
        <View style={styles.row}>
          <Skeleton width="70%" height={24} />
          <Skeleton width={40} height={20} />
        </View>

        {/* Location & Reviews */}
        <View style={[styles.row, { marginTop: 12 }]}>
          <Skeleton width="40%" height={16} />
          <Skeleton width="30%" height={16} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    elevation: 3,
  },
  content: {
    padding: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
