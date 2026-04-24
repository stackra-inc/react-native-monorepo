/**
 * Login Route
 *
 * Placeholder login screen. Replace with your auth implementation.
 *
 * @module app/(auth)/login
 */

import { Button } from "heroui-native";
import { useRouter } from "expo-router";
import { View, Text } from "react-native";

export default function LoginRoute() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background justify-center items-center p-6 gap-6">
      <Text className="text-3xl font-bold text-foreground">Welcome Back</Text>
      <Text className="text-base text-muted text-center">Sign in to continue</Text>
      <Button variant="primary" className="w-full" onPress={() => router.replace("/(tabs)")}>
        Sign In
      </Button>
    </View>
  );
}
