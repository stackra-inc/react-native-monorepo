/**
 * Home Screen
 *
 * Main landing screen with rich scrollable content designed to
 * showcase the Liquid Glass navigation effect on iOS 26+. The
 * content scrolls behind the translucent tab bar and header,
 * demonstrating the glass material in action.
 *
 * @module screens/home
 */

import { useInject } from "@stackra/ts-container";
import { Str } from "@stackra/ts-support";
import { Button, Card, Alert, Chip } from "@repo/ui";
import { View, Text, ScrollView, Image } from "react-native";
import { StatusBar } from "expo-status-bar";

import { LoggerService } from "@/services/logger.service";

/**
 * Home screen component.
 *
 * Displays a component showcase with enough scrollable content
 * for the Liquid Glass tab bar and header to be visible over
 * the underlying content.
 *
 * @returns The home screen UI.
 */
export function HomeScreen() {
  const logger = useInject(LoggerService);

  const appName = Str.title("heroui native");
  const subtitle = Str.lower("TURBOREPO + EXPO + HEROUI NATIVE TEMPLATE");

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        contentContainerClassName="p-4 pb-safe-offset-6 gap-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="gap-1">
          <Text className="text-3xl font-semibold text-foreground">{appName}</Text>
          <Text className="text-base text-muted">{subtitle}</Text>
        </View>

        {/* Hero Card */}
        <Card>
          <View className="gap-4">
            <Card.Body>
              <Card.Title>Liquid Glass Navigation</Card.Title>
              <Card.Description>
                Scroll this content to see the tab bar and header render with Apple's Liquid Glass
                material on iOS 26+. The translucent glass effect dynamically reflects the content
                behind it.
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

        {/* Success Alert */}
        <Alert status="success" className="items-center">
          <Alert.Indicator className="pt-0" />
          <Alert.Content>
            <Alert.Title>Native tabs active</Alert.Title>
          </Alert.Content>
        </Alert>

        {/* Chips */}
        <View className="flex-row flex-wrap gap-2">
          <Chip variant="primary" color="accent">
            Expo 55
          </Chip>
          <Chip variant="secondary" color="success">
            iOS 26
          </Chip>
          <Chip variant="tertiary" color="warning">
            Liquid Glass
          </Chip>
          <Chip variant="soft" color="danger">
            SF Symbols
          </Chip>
        </View>

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

        {/* Cards */}
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">Cards</Text>
          <Card>
            <Card.Body>
              <Card.Title>Default Card</Card.Title>
              <Card.Description>
                Standard card with surface background. Scroll down to see more content behind the
                glass navigation.
              </Card.Description>
            </Card.Body>
          </Card>
          <Card variant="secondary">
            <Card.Body>
              <Card.Title>Secondary Card</Card.Title>
              <Card.Description>Secondary surface variant for visual hierarchy.</Card.Description>
            </Card.Body>
          </Card>
          <Card variant="tertiary">
            <Card.Body>
              <Card.Title>Tertiary Card</Card.Title>
              <Card.Description>Tertiary surface for subtle grouping.</Card.Description>
            </Card.Body>
          </Card>
        </View>

        {/* Color Swatches — visual content for glass effect */}
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">Color Palette</Text>
          <View className="flex-row gap-2">
            <View className="flex-1 h-20 rounded-xl bg-accent" />
            <View className="flex-1 h-20 rounded-xl bg-success" />
            <View className="flex-1 h-20 rounded-xl bg-warning" />
            <View className="flex-1 h-20 rounded-xl bg-danger" />
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1 h-20 rounded-xl bg-surface" />
            <View className="flex-1 h-20 rounded-xl bg-surface-secondary" />
            <View className="flex-1 h-20 rounded-xl bg-surface-tertiary" />
            <View className="flex-1 h-20 rounded-xl bg-default" />
          </View>
        </View>

        {/* Extra padding content so glass effect is visible at bottom */}
        <Card>
          <Card.Body>
            <Card.Title>Enterprise Ready</Card.Title>
            <Card.Description>
              Configured with HeroUI Native, Uniwind (Tailwind v4), Inter fonts, Reanimated, Gesture
              Handler, Keyboard Controller, DI container, and custom themes.
            </Card.Description>
          </Card.Body>
        </Card>
      </ScrollView>
    </View>
  );
}
