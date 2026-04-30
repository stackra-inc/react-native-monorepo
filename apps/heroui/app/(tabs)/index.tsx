import { ThemeSwitcher } from "@/components/theme-switcher";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  Button,
  Card,
  Chip,
  Separator,
  useThemeColor,
} from "heroui-native";
import { ScrollView, Text, View } from "react-native";

interface DemoCard {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tab: string;
  chips: {
    label: string;
    color: "accent" | "success" | "warning" | "danger" | "default";
  }[];
}

const DEMO_CARDS: DemoCard[] = [
  {
    title: "Components",
    description:
      "Buttons, Cards, Chips, Avatars, Switches, Accordion, Alerts, and Spinners — all HeroUI Native components.",
    icon: "grid-outline",
    tab: "/(tabs)/components",
    chips: [
      { label: "HeroUI Native", color: "accent" },
      { label: "38 Components", color: "success" },
    ],
  },
  {
    title: "Forms & Toasts",
    description:
      "Login/Signup forms with TextField, ControlField switches, and Toast notifications with multiple variants.",
    icon: "create-outline",
    tab: "/(tabs)/forms",
    chips: [
      { label: "TextField", color: "accent" },
      { label: "Toast", color: "warning" },
    ],
  },
  {
    title: "Explore",
    description:
      "Real-world UI patterns: product cards, team member lists, and FAQ accordions.",
    icon: "compass-outline",
    tab: "/(tabs)/explore",
    chips: [
      { label: "Patterns", color: "accent" },
      { label: "Cards", color: "default" },
    ],
  },
  {
    title: "DI Services",
    description:
      "Dependency injection demo with @stackra/ts-container. Test LoggerService with live log output.",
    icon: "code-slash-outline",
    tab: "/(tabs)/services",
    chips: [
      { label: "@stackra/ts-container", color: "accent" },
      { label: "useInject()", color: "success" },
    ],
  },
  {
    title: "Support Utilities",
    description:
      "Laravel-style Str helpers, Collection, MapCollection, and SetCollection from @stackra/ts-support.",
    icon: "construct-outline",
    tab: "/(tabs)/support",
    chips: [
      { label: "@stackra/ts-support", color: "accent" },
      { label: "Str / Collection", color: "warning" },
    ],
  },
  {
    title: "Redis Client",
    description:
      "Upstash Redis integration via @stackra/ts-redis. Test get/set, TTL, pipelines, and pub/sub.",
    icon: "server-outline",
    tab: "/(tabs)/redis",
    chips: [
      { label: "@stackra/ts-redis", color: "accent" },
      { label: "Upstash", color: "danger" },
    ],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [accentFg, foreground] = useThemeColor([
    "accent-foreground",
    "foreground",
  ]);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 pt-16 pb-8 gap-8">
        {/* Hero */}
        <View className="gap-2">
          <Text className="text-3xl font-semibold text-foreground">
            HeroUI Native
          </Text>
          <Text className="text-base text-muted leading-relaxed">
            Beautiful, accessible components for React Native. Built on Tailwind
            v4 via Uniwind Pro.
          </Text>
        </View>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        <Separator />

        {/* Demo Cards */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">
            Demo Pages
          </Text>

          {DEMO_CARDS.map((card) => (
            <Card key={card.title}>
              <View className="gap-3">
                <Card.Body>
                  <View className="flex-row items-center gap-3 mb-2">
                    <View className="bg-accent/10 p-2.5 rounded-xl">
                      <Ionicons name={card.icon} size={20} color={foreground} />
                    </View>
                    <View className="flex-1">
                      <Card.Title>{card.title}</Card.Title>
                    </View>
                    <Button
                      variant="ghost"
                      size="sm"
                      isIconOnly
                      onPress={() => router.push(card.tab as any)}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={foreground}
                      />
                    </Button>
                  </View>
                  <Card.Description>{card.description}</Card.Description>
                  <View className="flex-row flex-wrap gap-1.5 mt-2">
                    {card.chips.map((chip) => (
                      <Chip
                        key={chip.label}
                        size="sm"
                        color={chip.color}
                        variant="soft"
                      >
                        <Chip.Label>{chip.label}</Chip.Label>
                      </Chip>
                    ))}
                  </View>
                </Card.Body>
              </View>
            </Card>
          ))}
        </View>

        {/* Info */}
        <Alert status="accent">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Powered by Stackra</Alert.Title>
            <Alert.Description>
              DI container, support utilities, and Redis client — all integrated
              with HeroUI Native and Uniwind Pro.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      </View>
    </ScrollView>
  );
}
