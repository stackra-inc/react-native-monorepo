/**
 * Explore Screen
 *
 * Placeholder screen for the Explore tab.
 *
 * @module screens/explore
 */

import { Card } from "heroui-native";
import { View, Text, ScrollView } from "react-native";

export function ExploreScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-4 pt-safe-offset-4 pb-safe-offset-6 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-semibold text-foreground">Explore</Text>
        <Text className="text-base text-muted">Discover components and patterns</Text>

        <Card>
          <Card.Body>
            <Card.Title>Components</Card.Title>
            <Card.Description>
              Browse the full HeroUI Native component library with live examples and usage patterns.
            </Card.Description>
          </Card.Body>
        </Card>

        <Card variant="secondary">
          <Card.Body>
            <Card.Title>Themes</Card.Title>
            <Card.Description>
              Switch between Lavender, Mint, Sky, and default themes to see the design system in
              action.
            </Card.Description>
          </Card.Body>
        </Card>

        <Card variant="tertiary">
          <Card.Body>
            <Card.Title>Showcases</Card.Title>
            <Card.Description>
              Real-world UI patterns built with HeroUI Native components.
            </Card.Description>
          </Card.Body>
        </Card>
      </ScrollView>
    </View>
  );
}
