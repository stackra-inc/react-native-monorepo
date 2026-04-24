/**
 * Auth Layout
 *
 * Layout for authentication screens (login, register, forgot password).
 * No tab bar, no header — clean full-screen experience.
 *
 * @module app/(auth)/_layout
 */

import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
}
