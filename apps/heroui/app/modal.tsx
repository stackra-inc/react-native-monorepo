import { Link } from "expo-router";
import { Button, Card } from "heroui-native";
import { Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Card className="w-full">
        <Card.Body className="items-center gap-4">
          <Text className="text-4xl">🎉</Text>
          <Card.Title className="text-center text-xl">
            HeroUI Native Modal
          </Card.Title>
          <Card.Description className="text-center">
            This modal is styled with HeroUI Native components and Tailwind
            classes via Uniwind.
          </Card.Description>
        </Card.Body>
        <Card.Footer className="justify-center">
          <Link href="/" dismissTo asChild>
            <Button variant="primary">
              <Button.Label>Go Home</Button.Label>
            </Button>
          </Link>
        </Card.Footer>
      </Card>
    </View>
  );
}
