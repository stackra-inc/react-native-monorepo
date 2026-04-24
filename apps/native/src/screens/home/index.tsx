/**
 * Home Screen
 *
 * Main landing screen showing HeroUI Native component showcase.
 * Demonstrates Button, Card, Alert, and Chip components with
 * DI-injected LoggerService and Str utilities.
 *
 * @module screens/home
 */

import { useInject } from "@stackra/ts-container";
import { Str } from "@stackra/ts-support";
import { Button, Card, Alert, Chip } from "@repo/ui";
import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";

import { LoggerService } from "@/services/logger.service";

export function HomeScreen() {
  const logger = useInject(LoggerService);

  const appName = Str.title("heroui native");
  const subtitle = Str.lower("TURBOREPO + EXPO + HEROUI NATIVE TEMPLATE");

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        contentContainerClassName="p-4 pt-safe-offset-4 pb-safe-offset-6 gap-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="gap-1">
          <Text className="text-3xl font-semibold text-foreground">{appName}</Text>
          <Text className="text-base text-muted">{subtitle}</Text>
        </View>

        {/* Uniwind Test — plain RN components with Tailwind classes */}
        <View className="bg-blue-500 p-4 rounded-xl">
          <Text className="text-white text-lg font-bold">
            Uniwind Test: Blue bg + white text = working
          </Text>
        </View>
        <View className="bg-red-500 p-4 rounded-xl">
          <Text className="text-white text-lg font-bold">Red bg test</Text>
        </View>
        <View className="bg-green-500 p-4 rounded-xl">
          <Text className="text-white text-lg font-bold">Green bg test</Text>
        </View>

        {/* Success Alert */}
        <Alert status="success" className="items-center">
          <Alert.Indicator className="pt-0" />
          <Alert.Content>
            <Alert.Title>Setup complete</Alert.Title>
          </Alert.Content>
        </Alert>

        {/* Chips */}
        <View className="flex-row flex-wrap gap-2">
          <Chip variant="primary" color="accent">
            Expo 55
          </Chip>
          <Chip variant="secondary" color="success">
            Turborepo
          </Chip>
          <Chip variant="tertiary" color="warning">
            Uniwind
          </Chip>
          <Chip variant="soft" color="danger">
            HeroUI Native
          </Chip>
        </View>

        {/* Card */}
        <Card>
          <View className="gap-4">
            <Card.Body>
              <Card.Title>Enterprise Ready</Card.Title>
              <Card.Description>
                Configured with HeroUI Native, Uniwind (Tailwind v4), Inter fonts, Reanimated,
                Gesture Handler, Keyboard Controller, DI container, and custom themes.
              </Card.Description>
            </Card.Body>
            <Card.Footer className="gap-3">
              <Button variant="primary" onPress={() => logger.log("Get started!", "HomeScreen")}>
                Get Started
              </Button>
              <Button variant="ghost">
                <Button.Label>Learn More</Button.Label>
              </Button>
            </Card.Footer>
          </View>
        </Card>

        {/* Button Variants */}
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">Button Variants</Text>
          <View className="gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </View>
        </View>

        {/* Button Sizes */}
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">Button Sizes</Text>
          <View className="flex-row gap-2 items-center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </View>
        </View>

        {/* Alerts */}
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">Alerts</Text>
          <Alert status="accent">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Info</Alert.Title>
              <Alert.Description>This is an informational alert.</Alert.Description>
            </Alert.Content>
          </Alert>
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Warning</Alert.Title>
              <Alert.Description>Please review before continuing.</Alert.Description>
            </Alert.Content>
          </Alert>
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Error</Alert.Title>
              <Alert.Description>Something went wrong. Please try again.</Alert.Description>
            </Alert.Content>
          </Alert>
        </View>
      </ScrollView>
    </View>
  );
}
