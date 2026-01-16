import * as LocalAuthentication from "expo-local-authentication";
import { useCallback, useEffect, useState } from "react";

export function useBiometrics() {
  const [isCompatible, setIsCompatible] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [biometricType, setBiometricType] =
    useState<LocalAuthentication.AuthenticationType | null>(null);

  useEffect(() => {
    checkHardware();
  }, []);

  const checkHardware = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsCompatible(compatible);

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        const types =
          await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (
          types.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          )
        ) {
          setBiometricType(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          );
        } else if (
          types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
        ) {
          setBiometricType(LocalAuthentication.AuthenticationType.FINGERPRINT);
        }
      }
    } catch (e) {
      console.error("Biometric hardware check failed", e);
    }
  };

  const authenticate = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login to Host-Palace",
        fallbackLabel: "Use Password",
      });
      return result.success;
    } catch (e) {
      console.error("Biometric auth failed", e);
      return false;
    }
  }, []);

  return { isCompatible, isEnrolled, biometricType, authenticate };
}
