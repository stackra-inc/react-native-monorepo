import { Ionicons } from "@expo/vector-icons";
import {
  Accordion,
  Alert,
  Avatar,
  Button,
  Card,
  Chip,
  Separator,
  Spinner,
  Switch,
  useThemeColor,
} from "heroui-native";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function ComponentsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const themeColorMuted = useThemeColor("muted");
  const [accentFg, dangerFg, defaultFg] = useThemeColor([
    "accent-foreground",
    "danger-foreground",
    "default-foreground",
  ]);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 pt-16 pb-8 gap-8">
        <Text className="text-3xl font-semibold text-foreground">
          Components
        </Text>

        {/* Buttons */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">Buttons</Text>
          <View className="flex-row flex-wrap gap-3">
            <Button variant="primary">
              <Button.Label>Primary</Button.Label>
            </Button>
            <Button variant="secondary">
              <Button.Label>Secondary</Button.Label>
            </Button>
            <Button variant="tertiary">
              <Button.Label>Tertiary</Button.Label>
            </Button>
          </View>
          <View className="flex-row flex-wrap gap-3">
            <Button variant="outline">
              <Button.Label>Outline</Button.Label>
            </Button>
            <Button variant="ghost">
              <Button.Label>Ghost</Button.Label>
            </Button>
            <Button variant="danger">
              <Button.Label>Danger</Button.Label>
            </Button>
          </View>

          <Text className="text-sm font-medium text-muted mt-2">Sizes</Text>
          <View className="flex-row items-center gap-3">
            <Button size="sm">
              <Button.Label>Small</Button.Label>
            </Button>
            <Button size="md">
              <Button.Label>Medium</Button.Label>
            </Button>
            <Button size="lg">
              <Button.Label>Large</Button.Label>
            </Button>
          </View>

          <Text className="text-sm font-medium text-muted mt-2">
            Icon Buttons
          </Text>
          <View className="flex-row gap-3">
            <Button size="sm" isIconOnly>
              <Ionicons name="heart" size={16} color={accentFg} />
            </Button>
            <Button size="sm" variant="secondary" isIconOnly>
              <Ionicons name="bookmark" size={16} color={defaultFg} />
            </Button>
            <Button size="sm" variant="danger" isIconOnly>
              <Ionicons name="trash" size={16} color={dangerFg} />
            </Button>
            <Button size="sm" variant="ghost" isIconOnly>
              <Ionicons name="share-outline" size={16} color={defaultFg} />
            </Button>
          </View>
        </View>

        <Separator />

        {/* Cards */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">Cards</Text>

          <Card>
            <View className="gap-4">
              <Card.Body className="mb-2">
                <View className="gap-1 mb-2">
                  <Card.Title className="text-accent">$450</Card.Title>
                  <Card.Title>Living Room Sofa</Card.Title>
                </View>
                <Card.Description>
                  This sofa is perfect for modern tropical spaces, baroque
                  inspired spaces.
                </Card.Description>
              </Card.Body>
              <Card.Footer className="gap-3">
                <Button variant="primary">
                  <Button.Label>Buy now</Button.Label>
                </Button>
                <Button variant="ghost">
                  <Button.Label>Add to cart</Button.Label>
                  <Ionicons name="bag-outline" size={16} color={defaultFg} />
                </Button>
              </Card.Footer>
            </View>
          </Card>

          <Card variant="secondary">
            <Card.Body>
              <Card.Title>Secondary Card</Card.Title>
              <Card.Description>
                Cards support multiple variants for different visual emphasis.
              </Card.Description>
            </Card.Body>
          </Card>
        </View>

        <Separator />

        {/* Chips */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">Chips</Text>
          <View className="flex-row flex-wrap gap-2">
            <Chip size="sm" color="accent">
              Small
            </Chip>
            <Chip size="md" color="success">
              Medium
            </Chip>
            <Chip size="lg" color="warning">
              Large
            </Chip>
          </View>
          <View className="flex-row flex-wrap gap-2">
            <Chip variant="primary" color="accent">
              Primary
            </Chip>
            <Chip variant="secondary" color="success">
              <View className="size-1.5 rounded-full bg-success" />
              <Chip.Label>Secondary</Chip.Label>
            </Chip>
            <Chip variant="tertiary" color="warning">
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Chip.Label>Tertiary</Chip.Label>
            </Chip>
            <Chip variant="soft" color="danger">
              Soft
            </Chip>
          </View>
        </View>

        <Separator />

        {/* Avatars */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">Avatars</Text>
          <View className="flex-row gap-3 items-end">
            <Avatar size="sm" color="accent" alt="Small avatar">
              <Avatar.Fallback>SM</Avatar.Fallback>
            </Avatar>
            <Avatar size="md" color="success" alt="Medium avatar">
              <Avatar.Fallback>MD</Avatar.Fallback>
            </Avatar>
            <Avatar size="lg" color="warning" alt="Large avatar">
              <Avatar.Fallback>LG</Avatar.Fallback>
            </Avatar>
          </View>
          <View className="flex-row gap-3">
            <Avatar color="default" alt="Default variant">
              <Avatar.Fallback>DF</Avatar.Fallback>
            </Avatar>
            <Avatar color="accent" variant="soft" alt="Soft variant">
              <Avatar.Fallback>SF</Avatar.Fallback>
            </Avatar>
            <Avatar color="danger" alt="Danger variant">
              <Avatar.Fallback>DG</Avatar.Fallback>
            </Avatar>
          </View>
        </View>

        <Separator />

        {/* Switches */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">Switches</Text>
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground">Dark Mode</Text>
              <Switch isSelected={darkMode} onSelectedChange={setDarkMode}>
                <Switch.Thumb />
              </Switch>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground">Notifications</Text>
              <Switch
                isSelected={notifications}
                onSelectedChange={setNotifications}
              >
                <Switch.Thumb />
              </Switch>
            </View>
          </View>
        </View>

        <Separator />

        {/* Accordion */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">Accordion</Text>
          <Accordion selectionMode="single" variant="surface" defaultValue="1">
            <Accordion.Item value="1">
              <Accordion.Trigger>
                <View className="flex-row items-center flex-1 gap-3">
                  <Ionicons
                    name="bag-outline"
                    size={16}
                    color={themeColorMuted}
                  />
                  <Text className="text-foreground text-base flex-1">
                    How do I place an order?
                  </Text>
                </View>
                <Accordion.Indicator />
              </Accordion.Trigger>
              <Accordion.Content>
                <Text className="text-muted text-base/relaxed px-7">
                  Browse our products, add items to your cart, and proceed to
                  checkout. We accept all major payment methods.
                </Text>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="2">
              <Accordion.Trigger>
                <View className="flex-row items-center flex-1 gap-3">
                  <Ionicons
                    name="card-outline"
                    size={16}
                    color={themeColorMuted}
                  />
                  <Text className="text-foreground text-base flex-1">
                    What payment methods do you accept?
                  </Text>
                </View>
                <Accordion.Indicator />
              </Accordion.Trigger>
              <Accordion.Content>
                <Text className="text-muted text-base/relaxed px-7">
                  We accept Visa, Mastercard, American Express, PayPal, and
                  Apple Pay.
                </Text>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="3">
              <Accordion.Trigger>
                <View className="flex-row items-center flex-1 gap-3">
                  <Ionicons
                    name="cube-outline"
                    size={16}
                    color={themeColorMuted}
                  />
                  <Text className="text-foreground text-base flex-1">
                    How much does shipping cost?
                  </Text>
                </View>
                <Accordion.Indicator />
              </Accordion.Trigger>
              <Accordion.Content>
                <Text className="text-muted text-base/relaxed px-7">
                  Free shipping on orders over $50. Standard shipping is $5.99
                  and express is $12.99.
                </Text>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </View>

        <Separator />

        {/* Alerts */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">Alerts</Text>
          <Alert status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Payment successful</Alert.Title>
              <Alert.Description>
                Your order has been confirmed and is being processed.
              </Alert.Description>
            </Alert.Content>
          </Alert>
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Low stock</Alert.Title>
              <Alert.Description>
                Only 3 items remaining. Order soon to avoid missing out.
              </Alert.Description>
            </Alert.Content>
          </Alert>
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Connection lost</Alert.Title>
              <Alert.Description>
                Unable to connect to the server. Check your internet connection.
              </Alert.Description>
            </Alert.Content>
            <Button size="sm" variant="danger">
              <Button.Label>Retry</Button.Label>
            </Button>
          </Alert>
        </View>

        <Separator />

        {/* Spinner */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">Spinner</Text>
          <View className="flex-row gap-6 items-center">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
