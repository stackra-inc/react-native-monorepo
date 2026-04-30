import { Ionicons } from "@expo/vector-icons";
import { Str, collect, collectMap, collectSet } from "@stackra/ts-support";
import {
  Button,
  Card,
  Chip,
  Separator,
  useThemeColor,
  useToast,
} from "heroui-native";
import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";

interface DemoResult {
  id: string;
  category: string;
  method: string;
  input: string;
  output: string;
}

export default function SupportScreen() {
  const { toast } = useToast();
  const [results, setResults] = useState<DemoResult[]>([]);
  const counterRef = useRef(0);
  const foreground = useThemeColor("foreground");

  const addResult = (
    category: string,
    method: string,
    input: string,
    output: string,
  ) => {
    setResults((prev) =>
      [
        { id: `sup-${counterRef.current++}`, category, method, input, output },
        ...prev,
      ].slice(0, 30),
    );
  };

  // ── Str demos ──

  const runStrDemo = () => {
    addResult("Str", "camel()", '"hello_world"', Str.camel("hello_world"));
    addResult("Str", "kebab()", '"helloWorld"', Str.kebab("helloWorld"));
    addResult(
      "Str",
      "headline()",
      '"hello_world_foo"',
      Str.headline("hello_world_foo"),
    );
    addResult(
      "Str",
      "after()",
      '"hello@world", "@"',
      Str.after("hello@world", "@"),
    );
    addResult(
      "Str",
      "before()",
      '"hello@world", "@"',
      Str.before("hello@world", "@"),
    );
    addResult(
      "Str",
      "between()",
      '"[tag]content[/tag]"',
      Str.between("[tag]content[/tag]", "[tag]", "[/tag]"),
    );
    addResult(
      "Str",
      "limit()",
      '"The quick brown fox", 10',
      Str.limit("The quick brown fox", 10),
    );
    addResult(
      "Str",
      "mask()",
      '"4111111111111111", "*", 4',
      Str.mask("4111111111111111", "*", 4),
    );
    addResult(
      "Str",
      "isUuid()",
      '"550e8400-e29b..."',
      String(Str.isUuid("550e8400-e29b-41d4-a716-446655440000")),
    );
    addResult("Str", "isJson()", "'{\"a\":1}'", String(Str.isJson('{"a":1}')));
    addResult("Str", "random()", "16", Str.random(16));
    addResult("Str", "plural()", '"child"', Str.plural("child"));
    addResult(
      "Str",
      "contains()",
      '"Hello World", "World"',
      String(Str.contains("Hello World", "World")),
    );
    addResult("Str", "finish()", '"/path", "/"', Str.finish("/path", "/"));
    addResult("Str", "padBoth()", '"hi", 10, "-"', Str.padBoth("hi", 10, "-"));

    toast.show({
      variant: "success",
      label: "Str demo complete",
      description: "15 string operations executed.",
    });
  };

  // ── Collection demos ──

  const runCollectionDemo = () => {
    const items = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    addResult("Collection", "sum()", "[1..10]", String(items.sum()));
    addResult("Collection", "avg()", "[1..10]", String(items.avg()));
    addResult("Collection", "max()", "[1..10]", String(items.max()));
    addResult("Collection", "min()", "[1..10]", String(items.min()));
    addResult(
      "Collection",
      "filter(>5)",
      "[1..10]",
      items
        .filter((n) => n > 5)
        .all()
        .join(", "),
    );
    addResult(
      "Collection",
      "map(*2)",
      "[1..10]",
      items
        .map((n) => n * 2)
        .all()
        .join(", "),
    );
    addResult(
      "Collection",
      "chunk(3)",
      "[1..10]",
      JSON.stringify(
        items
          .chunk(3)
          .all()
          .map((c) => c.all()),
      ),
    );
    addResult(
      "Collection",
      "reverse()",
      "[1..10]",
      items.reverse().all().join(", "),
    );
    addResult(
      "Collection",
      "unique()",
      "[1,2,2,3,3]",
      collect([1, 2, 2, 3, 3]).unique().all().join(", "),
    );
    addResult("Collection", "count()", "[1..10]", String(items.count()));

    toast.show({
      variant: "success",
      label: "Collection demo complete",
      description: "10 collection operations.",
    });
  };

  // ── MapCollection demos ──

  const runMapDemo = () => {
    const map = collectMap<string, number>([
      ["apples", 5],
      ["bananas", 3],
      ["oranges", 8],
      ["grapes", 2],
    ]);

    addResult(
      "MapCollection",
      'get("apples")',
      "fruit map",
      String(map.get("apples")),
    );
    addResult(
      "MapCollection",
      'has("bananas")',
      "fruit map",
      String(map.has("bananas")),
    );
    addResult("MapCollection", "keys()", "fruit map", map.keys().join(", "));
    addResult(
      "MapCollection",
      "values()",
      "fruit map",
      map.values().join(", "),
    );
    addResult("MapCollection", "count()", "fruit map", String(map.count()));
    addResult(
      "MapCollection",
      "toObject()",
      "fruit map",
      JSON.stringify(map.toObject()),
    );

    toast.show({
      variant: "success",
      label: "MapCollection demo",
      description: "6 map operations.",
    });
  };

  // ── SetCollection demos ──

  const runSetDemo = () => {
    const setA = collectSet([1, 2, 3, 4, 5]);
    const setB = collectSet([3, 4, 5, 6, 7]);

    addResult(
      "SetCollection",
      "union()",
      "{1..5} ∪ {3..7}",
      setA.union(setB).toArray().join(", "),
    );
    addResult(
      "SetCollection",
      "intersect()",
      "{1..5} ∩ {3..7}",
      setA.intersect(setB).toArray().join(", "),
    );
    addResult(
      "SetCollection",
      "diff()",
      "{1..5} \\ {3..7}",
      setA.diff(setB).toArray().join(", "),
    );
    addResult("SetCollection", "has(3)", "{1..5}", String(setA.has(3)));
    addResult("SetCollection", "count()", "{1..5}", String(setA.count()));
    addResult(
      "SetCollection",
      "toArray()",
      "{1..5}",
      setA.toArray().join(", "),
    );

    toast.show({
      variant: "success",
      label: "SetCollection demo",
      description: "6 set operations.",
    });
  };

  const clearResults = () => {
    setResults([]);
    counterRef.current = 0;
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Str":
        return "accent" as const;
      case "Collection":
        return "success" as const;
      case "MapCollection":
        return "warning" as const;
      case "SetCollection":
        return "danger" as const;
      default:
        return "default" as const;
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 pt-16 pb-8 gap-6">
        <View className="gap-2">
          <Text className="text-3xl font-semibold text-foreground">
            Support
          </Text>
          <Text className="text-base text-muted leading-relaxed">
            Laravel-style utilities from @stackra/ts-support. String helpers,
            collections, maps, and sets.
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">Run Demos</Text>

          <Button variant="primary" onPress={runStrDemo}>
            <Ionicons
              name="text-outline"
              size={16}
              color={useThemeColor("accent-foreground")}
            />
            <Button.Label>Str — String Helpers (15)</Button.Label>
          </Button>

          <Button variant="secondary" onPress={runCollectionDemo}>
            <Ionicons name="list-outline" size={16} color={foreground} />
            <Button.Label>Collection — Array Ops (10)</Button.Label>
          </Button>

          <View className="flex-row gap-3">
            <Button variant="tertiary" className="flex-1" onPress={runMapDemo}>
              <Button.Label>MapCollection (6)</Button.Label>
            </Button>
            <Button variant="tertiary" className="flex-1" onPress={runSetDemo}>
              <Button.Label>SetCollection (6)</Button.Label>
            </Button>
          </View>
        </View>

        <Separator />

        {/* Results */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-medium text-foreground">
              Results ({results.length})
            </Text>
            {results.length > 0 && (
              <Button variant="ghost" size="sm" onPress={clearResults}>
                <Button.Label>Clear</Button.Label>
              </Button>
            )}
          </View>

          {results.length === 0 ? (
            <Card variant="secondary">
              <Card.Body className="items-center gap-2 py-6">
                <Ionicons name="flask-outline" size={32} color={foreground} />
                <Card.Description className="text-center">
                  Tap a button above to run utility demos. Results appear here
                  with input/output pairs.
                </Card.Description>
              </Card.Body>
            </Card>
          ) : (
            <View className="gap-2">
              {results.map((r) => (
                <Card key={r.id} variant="secondary">
                  <Card.Body className="gap-1">
                    <View className="flex-row items-center gap-2">
                      <Chip
                        size="sm"
                        color={getCategoryColor(r.category)}
                        variant="soft"
                      >
                        <Chip.Label>{r.category}</Chip.Label>
                      </Chip>
                      <Text className="text-sm font-medium text-foreground">
                        {r.method}
                      </Text>
                    </View>
                    <Text className="text-xs text-muted">Input: {r.input}</Text>
                    <Text className="text-sm text-accent font-medium">
                      → {r.output}
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
