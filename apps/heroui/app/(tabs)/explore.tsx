import { Ionicons } from "@expo/vector-icons";
import {
  Accordion,
  Alert,
  Avatar,
  Button,
  Card,
  Chip,
  Separator,
  useThemeColor,
} from "heroui-native";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const PRODUCTS = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: "$129",
    description: "Premium noise-cancelling headphones with 30hr battery life.",
    badge: "New",
    badgeColor: "accent" as const,
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    price: "$299",
    description: "Health tracking, GPS, and 5-day battery in a sleek design.",
    badge: "Popular",
    badgeColor: "success" as const,
  },
  {
    id: 3,
    name: "Portable Speaker",
    price: "$79",
    description: "Waterproof Bluetooth speaker with 360° immersive sound.",
    badge: "Sale",
    badgeColor: "danger" as const,
  },
];

const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Alice Chen",
    role: "Lead Designer",
    initials: "AC",
    color: "accent" as const,
  },
  {
    id: 2,
    name: "Bob Smith",
    role: "Engineer",
    initials: "BS",
    color: "success" as const,
  },
  {
    id: 3,
    name: "Carol Davis",
    role: "PM",
    initials: "CD",
    color: "warning" as const,
  },
  {
    id: 4,
    name: "Dan Lee",
    role: "QA Lead",
    initials: "DL",
    color: "danger" as const,
  },
];

export default function ExploreScreen() {
  const [accentFg, mutedColor] = useThemeColor(["accent-foreground", "muted"]);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 pt-16 pb-8 gap-8">
        <View className="gap-2">
          <Text className="text-3xl font-semibold text-foreground">
            Explore
          </Text>
          <Text className="text-base text-muted">
            Real-world UI patterns built with HeroUI Native components.
          </Text>
        </View>

        {/* Product Cards */}
        <View className="gap-4">
          <Text className="text-lg font-medium text-foreground">Products</Text>
          {PRODUCTS.map((product) => (
            <Card key={product.id}>
              <View className="gap-4">
                <Card.Body>
                  <View className="flex-row items-center justify-between mb-2">
                    <Card.Title>{product.name}</Card.Title>
                    <Chip size="sm" color={product.badgeColor} variant="soft">
                      <Chip.Label>{product.badge}</Chip.Label>
                    </Chip>
                  </View>
                  <Text className="text-accent text-xl font-semibold mb-1">
                    {product.price}
                  </Text>
                  <Card.Description>{product.description}</Card.Description>
                </Card.Body>
                <Card.Footer className="gap-3">
                  <Button variant="primary" size="sm">
                    <Ionicons name="cart-outline" size={16} color={accentFg} />
                    <Button.Label>Add to Cart</Button.Label>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Button.Label>Details</Button.Label>
                  </Button>
                </Card.Footer>
              </View>
            </Card>
          ))}
        </View>

        <Separator />

        {/* Team Section */}
        <View className="gap-4">
          <Text className="text-lg font-medium text-foreground">
            Team Members
          </Text>
          {TEAM_MEMBERS.map((member) => (
            <Card key={member.id} className="flex-row items-center gap-4">
              <Avatar size="lg" color={member.color} alt={member.name}>
                <Avatar.Fallback>{member.initials}</Avatar.Fallback>
              </Avatar>
              <View className="flex-1">
                <Text className="text-foreground font-medium text-base">
                  {member.name}
                </Text>
                <Text className="text-muted text-sm">{member.role}</Text>
              </View>
              <Button variant="ghost" size="sm" isIconOnly>
                <Ionicons name="chevron-forward" size={16} color={mutedColor} />
              </Button>
            </Card>
          ))}
        </View>

        <Separator />

        {/* FAQ */}
        <View className="gap-4">
          <Text className="text-lg font-medium text-foreground">FAQ</Text>
          <Accordion selectionMode="multiple" variant="surface">
            <Accordion.Item value="1">
              <Accordion.Trigger>
                <Text className="text-foreground text-base flex-1">
                  Is HeroUI Native free?
                </Text>
                <Accordion.Indicator />
              </Accordion.Trigger>
              <Accordion.Content>
                <Text className="text-muted text-base/relaxed px-1">
                  Yes, completely free and open source under the Apache License
                  2.0.
                </Text>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="2">
              <Accordion.Trigger>
                <Text className="text-foreground text-base flex-1">
                  Does it work with TypeScript?
                </Text>
                <Accordion.Indicator />
              </Accordion.Trigger>
              <Accordion.Content>
                <Text className="text-muted text-base/relaxed px-1">
                  Fully typed with excellent IDE support and autocompletion for
                  all components and props.
                </Text>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="3">
              <Accordion.Trigger>
                <Text className="text-foreground text-base flex-1">
                  Can I customize the components?
                </Text>
                <Accordion.Indicator />
              </Accordion.Trigger>
              <Accordion.Content>
                <Text className="text-muted text-base/relaxed px-1">
                  Yes! Update default styles, animations, or compose component
                  parts differently. Every slot is customizable via className.
                </Text>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </View>

        {/* Info Alert */}
        <Alert status="accent">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>38 Components Available</Alert.Title>
            <Alert.Description>
              From buttons and cards to dialogs and toasts — everything you need
              to build beautiful mobile apps.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      </View>
    </ScrollView>
  );
}
