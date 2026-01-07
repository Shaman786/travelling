import { useNetInfo } from "@react-native-community/netinfo";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const OfflineNotice = () => {
  const netInfo = useNetInfo();

  if (netInfo.type !== "unknown" && netInfo.isInternetReachable === false) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.banner}>
          <Text style={styles.text}>No Internet Connection</Text>
        </View>
      </SafeAreaView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FF3B30",
  },
  banner: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default OfflineNotice;
