import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Button,
  Card,
  Chip,
  Input,
  Label,
  Separator,
  TextField,
  useThemeColor,
  useToast,
} from "heroui-native";
import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";

interface RedisLogEntry {
  id: string;
  command: string;
  args: string;
  result: string;
  status: "success" | "error" | "info";
  timestamp: string;
}

/**
 * Redis Demo Screen
 *
 * Demonstrates @stackra/ts-redis API patterns.
 * Since we don't have a live Upstash connection configured,
 * this page simulates Redis operations using an in-memory store
 * to showcase the API surface and usage patterns.
 */
export default function RedisScreen() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<RedisLogEntry[]>([]);
  const counterRef = useRef(0);
  const [store, setStore] = useState<
    Map<string, { value: string; ttl?: number; setAt: number }>
  >(new Map());
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [ttl, setTtl] = useState("");

  const [accentFg, dangerFg, foreground] = useThemeColor([
    "accent-foreground",
    "danger-foreground",
    "foreground",
  ]);

  const addLog = (
    command: string,
    args: string,
    result: string,
    status: RedisLogEntry["status"] = "success",
  ) => {
    const id = `redis-${counterRef.current++}`;
    setLogs((prev) =>
      [
        {
          id,
          command,
          args,
          result,
          status,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ].slice(0, 30),
    );
  };

  // ── Simulated Redis Operations ──

  const handleSet = () => {
    if (!key) {
      toast.show({
        variant: "danger",
        label: "Key required",
        description: "Enter a key name.",
      });
      return;
    }
    const ttlNum = ttl ? parseInt(ttl, 10) : undefined;
    const newStore = new Map(store);
    newStore.set(key, {
      value: value || "(empty)",
      ttl: ttlNum,
      setAt: Date.now(),
    });
    setStore(newStore);

    const args = ttlNum
      ? `"${key}" "${value}" EX ${ttlNum}`
      : `"${key}" "${value}"`;
    addLog("SET", args, "OK");
    toast.show({
      variant: "success",
      label: "SET OK",
      description: `Key "${key}" stored.`,
    });
  };

  const handleGet = () => {
    if (!key) {
      toast.show({
        variant: "danger",
        label: "Key required",
        description: "Enter a key name.",
      });
      return;
    }
    const entry = store.get(key);
    if (entry) {
      if (entry.ttl && Date.now() - entry.setAt > entry.ttl * 1000) {
        const newStore = new Map(store);
        newStore.delete(key);
        setStore(newStore);
        addLog("GET", `"${key}"`, "(nil) — expired", "info");
      } else {
        addLog("GET", `"${key}"`, `"${entry.value}"`);
      }
    } else {
      addLog("GET", `"${key}"`, "(nil)", "info");
    }
  };

  const handleDel = () => {
    if (!key) return;
    const existed = store.has(key);
    const newStore = new Map(store);
    newStore.delete(key);
    setStore(newStore);
    addLog(
      "DEL",
      `"${key}"`,
      existed ? "1" : "0",
      existed ? "success" : "info",
    );
  };

  const handleKeys = () => {
    const keys = Array.from(store.keys());
    addLog("KEYS", '"*"', keys.length > 0 ? keys.join(", ") : "(empty)");
  };

  const handleFlush = () => {
    const count = store.size;
    setStore(new Map());
    addLog("FLUSHDB", "", `OK — ${count} keys removed`, "info");
    toast.show({
      variant: "warning",
      label: "FLUSHDB",
      description: `Cleared ${count} keys.`,
    });
  };

  const handlePipeline = () => {
    const newStore = new Map(store);
    const ops = [
      { cmd: "SET", key: "user:1:name", value: "Alice" },
      { cmd: "SET", key: "user:1:email", value: "alice@example.com" },
      { cmd: "SET", key: "user:1:role", value: "admin" },
      { cmd: "SET", key: "session:abc123", value: "user:1" },
    ];

    ops.forEach((op) => {
      newStore.set(op.key, { value: op.value, setAt: Date.now() });
    });
    setStore(newStore);

    addLog("PIPELINE", `${ops.length} commands`, "All OK — batched execution");
    ops.forEach((op) => {
      addLog("  SET", `"${op.key}" "${op.value}"`, "OK");
    });

    toast.show({
      variant: "success",
      label: "Pipeline executed",
      description: `${ops.length} commands batched.`,
    });
  };

  const handleTtlCheck = () => {
    if (!key) return;
    const entry = store.get(key);
    if (!entry) {
      addLog("TTL", `"${key}"`, "-2 (key does not exist)", "info");
    } else if (!entry.ttl) {
      addLog("TTL", `"${key}"`, "-1 (no expiry)", "info");
    } else {
      const elapsed = (Date.now() - entry.setAt) / 1000;
      const remaining = Math.max(0, Math.round(entry.ttl - elapsed));
      addLog("TTL", `"${key}"`, `${remaining}s remaining`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    counterRef.current = 0;
  };

  const getStatusColor = (status: RedisLogEntry["status"]) => {
    switch (status) {
      case "success":
        return "success" as const;
      case "error":
        return "danger" as const;
      case "info":
        return "default" as const;
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 pt-16 pb-8 gap-6">
        <View className="gap-2">
          <Text className="text-3xl font-semibold text-foreground">Redis</Text>
          <Text className="text-base text-muted leading-relaxed">
            @stackra/ts-redis API demo. Simulated in-memory store showcasing
            Redis command patterns with Upstash connector.
          </Text>
        </View>

        {/* Connection Status */}
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Simulation Mode</Alert.Title>
            <Alert.Description>
              Using in-memory store. Configure UPSTASH_REDIS_URL in .env to
              connect to a live Upstash Redis instance.
            </Alert.Description>
          </Alert.Content>
        </Alert>

        {/* Input Fields */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">
            Command Input
          </Text>
          <TextField>
            <Label>Key</Label>
            <Input
              placeholder="e.g. user:1:name"
              value={key}
              onChangeText={setKey}
              autoCapitalize="none"
            />
          </TextField>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField>
                <Label>Value</Label>
                <Input
                  placeholder="e.g. Alice"
                  value={value}
                  onChangeText={setValue}
                />
              </TextField>
            </View>
            <View className="w-24">
              <TextField>
                <Label>TTL (s)</Label>
                <Input
                  placeholder="60"
                  value={ttl}
                  onChangeText={setTtl}
                  keyboardType="numeric"
                />
              </TextField>
            </View>
          </View>
        </View>

        {/* Command Buttons */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">Commands</Text>
          <View className="flex-row gap-3">
            <Button variant="primary" className="flex-1" onPress={handleSet}>
              <Button.Label>SET</Button.Label>
            </Button>
            <Button variant="secondary" className="flex-1" onPress={handleGet}>
              <Button.Label>GET</Button.Label>
            </Button>
            <Button variant="danger" className="flex-1" onPress={handleDel}>
              <Button.Label>DEL</Button.Label>
            </Button>
          </View>
          <View className="flex-row gap-3">
            <Button
              variant="tertiary"
              className="flex-1"
              onPress={handleTtlCheck}
            >
              <Button.Label>TTL</Button.Label>
            </Button>
            <Button variant="tertiary" className="flex-1" onPress={handleKeys}>
              <Button.Label>KEYS *</Button.Label>
            </Button>
          </View>
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onPress={handlePipeline}
            >
              <Ionicons name="layers-outline" size={16} color={foreground} />
              <Button.Label>Pipeline (4 ops)</Button.Label>
            </Button>
            <Button
              variant="danger-soft"
              className="flex-1"
              onPress={handleFlush}
            >
              <Button.Label>FLUSHDB</Button.Label>
            </Button>
          </View>
        </View>

        {/* Store Info */}
        <View className="flex-row gap-2">
          <Chip size="sm" color="accent" variant="soft">
            <Chip.Label>{store.size} keys</Chip.Label>
          </Chip>
          <Chip size="sm" color="default" variant="soft">
            <Chip.Label>{logs.length} log entries</Chip.Label>
          </Chip>
        </View>

        <Separator />

        {/* Command Log */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-medium text-foreground">
              Command Log
            </Text>
            {logs.length > 0 && (
              <Button variant="ghost" size="sm" onPress={clearLogs}>
                <Button.Label>Clear</Button.Label>
              </Button>
            )}
          </View>

          {logs.length === 0 ? (
            <Card variant="secondary">
              <Card.Body className="items-center gap-2 py-6">
                <Ionicons
                  name="terminal-outline"
                  size={32}
                  color={foreground}
                />
                <Card.Description className="text-center">
                  Run Redis commands above. Results appear here like a Redis
                  CLI.
                </Card.Description>
              </Card.Body>
            </Card>
          ) : (
            <View className="gap-1.5">
              {logs.map((entry) => (
                <View
                  key={entry.id}
                  className="flex-row gap-2 items-start py-1"
                >
                  <Chip
                    size="sm"
                    color={getStatusColor(entry.status)}
                    variant="soft"
                  >
                    <Chip.Label className="font-mono text-xs">
                      {entry.command}
                    </Chip.Label>
                  </Chip>
                  <View className="flex-1">
                    <Text className="text-xs text-muted font-mono">
                      {entry.args}
                    </Text>
                    <Text className="text-sm text-foreground font-mono">
                      → {entry.result}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted">{entry.timestamp}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
