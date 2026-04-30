import { LoggerService } from "@/services/logger.service";
import { Ionicons } from "@expo/vector-icons";
import { useInject } from "@stackra/ts-container";
import {
  Alert,
  Button,
  Card,
  Chip,
  Separator,
  useThemeColor,
  useToast,
} from "heroui-native";
import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";

interface LogEntry {
  id: string;
  level: "log" | "warn" | "error";
  message: string;
  context?: string;
  timestamp: string;
}

export default function ServicesScreen() {
  const logger = useInject(LoggerService);
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const counterRef = useRef(0);

  const [accentFg, dangerFg, foreground] = useThemeColor([
    "accent-foreground",
    "danger-foreground",
    "foreground",
  ]);

  const addLog = (
    level: LogEntry["level"],
    message: string,
    context?: string,
  ) => {
    const id = `log-${counterRef.current++}`;
    const entry: LogEntry = {
      id,
      level,
      message,
      context,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [entry, ...prev].slice(0, 20));
  };

  const handleLog = () => {
    const msg = `User navigated to dashboard`;
    logger.log(msg, "Navigation");
    addLog("log", msg, "Navigation");
    toast.show({
      variant: "default",
      label: "Log sent",
      description: "Check the console and log list below.",
    });
  };

  const handleWarn = () => {
    const msg = `API response slow: 2.3s latency (threshold: 1s)`;
    logger.warn(msg, "API");
    addLog("warn", msg, "API");
    toast.show({
      variant: "warning",
      label: "Warning logged",
      description: "Performance warning captured.",
    });
  };

  const handleError = () => {
    const error = new Error("Connection refused: ECONNREFUSED 127.0.0.1:5432");
    const msg = `Database connection failed`;
    logger.error(msg, error, "Database");
    addLog("error", msg, "Database");
    toast.show({
      variant: "danger",
      label: "Error logged",
      description: "Database error captured with stack trace.",
    });
  };

  const handleBatchLogs = () => {
    logger.log("App started", "Lifecycle");
    addLog("log", "App started", "Lifecycle");

    logger.log("User authenticated: john@example.com", "Auth");
    addLog("log", "User authenticated: john@example.com", "Auth");

    logger.warn("Token expires in 5 minutes", "Auth");
    addLog("warn", "Token expires in 5 minutes", "Auth");

    logger.log("Fetching user profile...", "API");
    addLog("log", "Fetching user profile...", "API");

    logger.error(
      "Failed to load avatar image",
      new Error("404 Not Found"),
      "Media",
    );
    addLog("error", "Failed to load avatar image", "Media");

    toast.show({
      variant: "success",
      label: "Batch complete",
      description: "5 log entries created across multiple contexts.",
    });
  };

  const clearLogs = () => {
    setLogs([]);
    counterRef.current = 0;
    logger.log("Logs cleared by user", "Services");
  };

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "log":
        return "accent" as const;
      case "warn":
        return "warning" as const;
      case "error":
        return "danger" as const;
    }
  };

  const getLevelIcon = (
    level: LogEntry["level"],
  ): keyof typeof Ionicons.glyphMap => {
    switch (level) {
      case "log":
        return "information-circle-outline";
      case "warn":
        return "warning-outline";
      case "error":
        return "close-circle-outline";
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 pt-16 pb-8 gap-6">
        <View className="gap-2">
          <Text className="text-3xl font-semibold text-foreground">
            Services
          </Text>
          <Text className="text-base text-muted leading-relaxed">
            DI container demo using @stackra/ts-container. The LoggerService is
            injected via useInject() hook.
          </Text>
        </View>

        {/* Service Info Card */}
        <Card>
          <Card.Body className="gap-2">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="code-slash-outline"
                size={18}
                color={foreground}
              />
              <Card.Title>LoggerService</Card.Title>
            </View>
            <Card.Description>
              Injectable singleton service registered in AppModule. Provides
              log(), warn(), and error() methods with context prefixes.
            </Card.Description>
            <View className="flex-row gap-2 mt-2">
              <Chip size="sm" color="accent" variant="soft">
                <Chip.Label>@Injectable()</Chip.Label>
              </Chip>
              <Chip size="sm" color="success" variant="soft">
                <Chip.Label>Singleton</Chip.Label>
              </Chip>
              <Chip size="sm" color="default" variant="soft">
                <Chip.Label>@Global()</Chip.Label>
              </Chip>
            </View>
          </Card.Body>
        </Card>

        {/* Action Buttons */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">
            Test Logger Methods
          </Text>

          <View className="flex-row gap-3">
            <Button variant="primary" className="flex-1" onPress={handleLog}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={accentFg}
              />
              <Button.Label>log()</Button.Label>
            </Button>
            <Button variant="secondary" className="flex-1" onPress={handleWarn}>
              <Ionicons name="warning-outline" size={16} color={foreground} />
              <Button.Label>warn()</Button.Label>
            </Button>
            <Button variant="danger" className="flex-1" onPress={handleError}>
              <Ionicons
                name="close-circle-outline"
                size={16}
                color={dangerFg}
              />
              <Button.Label>error()</Button.Label>
            </Button>
          </View>

          <Button variant="tertiary" onPress={handleBatchLogs}>
            <Ionicons name="layers-outline" size={16} color={foreground} />
            <Button.Label>Run Batch (5 logs)</Button.Label>
          </Button>
        </View>

        <Separator />

        {/* Log Output */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-medium text-foreground">
              Log Output ({logs.length})
            </Text>
            {logs.length > 0 && (
              <Button variant="ghost" size="sm" onPress={clearLogs}>
                <Button.Label>Clear</Button.Label>
              </Button>
            )}
          </View>

          {logs.length === 0 ? (
            <Alert status="default">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>No logs yet</Alert.Title>
                <Alert.Description>
                  Tap the buttons above to test the LoggerService. Logs appear
                  here and in the Metro console.
                </Alert.Description>
              </Alert.Content>
            </Alert>
          ) : (
            <View className="gap-2">
              {logs.map((entry) => (
                <Card key={entry.id} variant="secondary">
                  <Card.Body className="gap-1.5">
                    <View className="flex-row items-center gap-2">
                      <Chip
                        size="sm"
                        color={getLevelColor(entry.level)}
                        variant="soft"
                      >
                        <Ionicons
                          name={getLevelIcon(entry.level)}
                          size={12}
                          color={foreground}
                        />
                        <Chip.Label>{entry.level.toUpperCase()}</Chip.Label>
                      </Chip>
                      {entry.context && (
                        <Chip size="sm" color="default" variant="tertiary">
                          <Chip.Label>{entry.context}</Chip.Label>
                        </Chip>
                      )}
                      <Text className="text-xs text-muted ml-auto">
                        {entry.timestamp}
                      </Text>
                    </View>
                    <Text className="text-sm text-foreground">
                      {entry.message}
                    </Text>
                  </Card.Body>
                </Card>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
