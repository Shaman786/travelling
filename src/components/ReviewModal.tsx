import React, { useState } from "react";
import {
  Keyboard,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  Button,
  HelperText,
  IconButton,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { Toast } from "toastify-react-native";
import { reviewService } from "../lib/databaseService";
import { useStore } from "../store/useStore";

interface ReviewModalProps {
  visible: boolean;
  onDismiss: () => void;
  bookingId: string;
  packageId: string;
  packageTitle: string;
  onSuccess: () => void;
}

const ReviewModal = ({
  visible,
  onDismiss,
  bookingId,
  packageId,
  packageTitle,
  onSuccess,
}: ReviewModalProps) => {
  const theme = useTheme();
  const user = useStore((state) => state.user);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError("Please write a comment about your experience.");
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    setError("");

    try {
      await reviewService.createReview({
        userId: user.$id,
        userName: user.name,
        userAvatar: user.avatar,
        packageId,
        bookingId,
        rating,
        comment,
      } as any); // Type assertion until full type compliance

      Toast.success("Review submitted successfully!");
      onSuccess();
      onDismiss();
      setComment("");
      setRating(5);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Surface style={styles.container} elevation={5}>
              <View style={styles.header}>
                <Text
                  variant="titleLarge"
                  style={{ fontWeight: "bold", flex: 1 }}
                >
                  Write a Review
                </Text>
                <IconButton icon="close" onPress={onDismiss} />
              </View>

              <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                How was your trip to{" "}
                <Text style={{ fontWeight: "bold" }}>{packageTitle}</Text>?
              </Text>

              {/* Star Rating */}
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton
                    key={star}
                    icon={star <= rating ? "star" : "star-outline"}
                    iconColor={
                      star <= rating ? "#FFC107" : theme.colors.outline
                    }
                    size={32}
                    onPress={() => setRating(star)}
                    style={{ margin: 0 }}
                  />
                ))}
              </View>
              <Text
                style={{ textAlign: "center", marginBottom: 16, color: "#666" }}
              >
                Tap to rate
              </Text>

              {/* Comment Input */}
              <TextInput
                mode="outlined"
                label="Your Experience"
                placeholder="Tell us what you liked..."
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={(text) => {
                  setComment(text);
                  if (error) setError("");
                }}
                style={styles.input}
                error={!!error}
              />
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>

              {/* Actions */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.button}
              >
                Submit Review
              </Button>
            </Surface>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fff",
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 16,
  },
});

export default ReviewModal;
