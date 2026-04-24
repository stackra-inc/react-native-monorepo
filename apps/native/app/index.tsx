import { Button, Card, Alert } from "heroui-native";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View className="flex-1 p-4 pt-safe-offset-4 gap-6">
        <View className="gap-1">
          <Text className="text-3xl font-semibold text-foreground">
            HeroUI Native
          </Text>
          <Text className="text-base text-muted">
            Running in Turborepo with Expo Router
          </Text>
        </View>

        <Alert status="success" className="items-center">
          <Alert.Indicator className="pt-0" />
          <Alert.Content>
            <Alert.Title>Setup complete</Alert.Title>
          </Alert.Content>
        </Alert>

        <Card>
          <Card.Body>
            <Card.Title>Welcome</Card.Title>
            <Card.Description>
              HeroUI Native is configured with Uniwind, Reanimated, and Gesture
              Handler inside a Turborepo monorepo.
            </Card.Description>
          </Card.Body>
          <Card.Footer className="gap-3">
            <Button
              variant="primary"
              onPress={() => console.log("Get started!")}
            >
              Get Started
            </Button>
            <Button variant="ghost">
              <Button.Label>Learn More</Button.Label>
            </Button>
          </Card.Footer>
        </Card>

        <View className="gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
        </View>
      </View>
    </View>
  );
}
