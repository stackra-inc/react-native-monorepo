import { Ionicons } from "@expo/vector-icons";
import {
  Button,
  ControlField,
  Description,
  Input,
  Label,
  Tabs,
  TextField,
  useToast,
} from "heroui-native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

export default function FormsScreen() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = () => {
    if (!email || !password) {
      toast.show({
        variant: "danger",
        label: "Missing fields",
        description: "Please fill in all required fields.",
      });
      return;
    }
    toast.show({
      variant: "success",
      label: "Login successful",
      description: `Welcome back, ${email}!`,
      actionLabel: "Dismiss",
      onActionPress: ({ hide }) => hide(),
    });
  };

  const handleSignup = () => {
    if (!name || !email || !password) {
      toast.show({
        variant: "danger",
        label: "Missing fields",
        description: "Please fill in all required fields.",
      });
      return;
    }
    toast.show({
      variant: "success",
      label: "Account created",
      description: `Welcome, ${name}! Your account has been created.`,
    });
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 pt-16 pb-8 gap-8">
        <Text className="text-3xl font-semibold text-foreground">Forms</Text>

        {/* Login / Signup Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} variant="primary">
          <Tabs.List>
            <Tabs.Indicator />
            <Tabs.Trigger value="login">
              <Tabs.Label>Login</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="signup">
              <Tabs.Label>Sign Up</Tabs.Label>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="login">
            <View className="gap-4 pt-6">
              <TextField isRequired>
                <Label>Email</Label>
                <Input
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </TextField>

              <TextField isRequired>
                <Label>Password</Label>
                <View className="w-full flex-row items-center">
                  <Input
                    value={password}
                    onChangeText={setPassword}
                    className="flex-1 px-10"
                    placeholder="Enter your password"
                    secureTextEntry={!isPasswordVisible}
                  />
                  <StyledIonicons
                    name="lock-closed-outline"
                    size={16}
                    className="absolute left-3.5 text-muted"
                    pointerEvents="none"
                  />
                  <Pressable
                    className="absolute right-4"
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <StyledIonicons
                      name={
                        isPasswordVisible ? "eye-off-outline" : "eye-outline"
                      }
                      size={16}
                      className="text-muted"
                    />
                  </Pressable>
                </View>
                <Description>Must be at least 8 characters</Description>
              </TextField>

              <Button variant="primary" onPress={handleLogin}>
                <Button.Label>Sign In</Button.Label>
              </Button>
            </View>
          </Tabs.Content>

          <Tabs.Content value="signup">
            <View className="gap-4 pt-6">
              <TextField isRequired>
                <Label>Full Name</Label>
                <Input
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                />
              </TextField>

              <TextField isRequired>
                <Label>Email</Label>
                <Input
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </TextField>

              <TextField isRequired>
                <Label>Password</Label>
                <Input
                  placeholder="Create a password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <Description>Must be at least 8 characters</Description>
              </TextField>

              <TextField>
                <Label>Bio</Label>
                <Input
                  placeholder="Tell us about yourself..."
                  multiline
                  numberOfLines={3}
                  value={bio}
                  onChangeText={setBio}
                />
                <Description>Optional. Max 200 characters.</Description>
              </TextField>

              <Button variant="primary" onPress={handleSignup}>
                <Button.Label>Create Account</Button.Label>
              </Button>
            </View>
          </Tabs.Content>
        </Tabs>

        {/* Settings Section */}
        <View className="gap-4">
          <Text className="text-lg font-medium text-foreground">
            Notification Settings
          </Text>

          <ControlField
            isSelected={emailNotifications}
            onSelectedChange={setEmailNotifications}
          >
            <View className="flex-1">
              <Label>Email notifications</Label>
              <Description>Receive updates via email</Description>
            </View>
            <ControlField.Indicator />
          </ControlField>

          <ControlField
            isSelected={pushNotifications}
            onSelectedChange={setPushNotifications}
          >
            <View className="flex-1">
              <Label>Push notifications</Label>
              <Description>
                Receive push notifications on your device
              </Description>
            </View>
            <ControlField.Indicator />
          </ControlField>
        </View>

        {/* Toast Demo */}
        <View className="gap-3">
          <Text className="text-lg font-medium text-foreground">
            Toast Notifications
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              onPress={() =>
                toast.show({
                  variant: "success",
                  label: "Saved!",
                  description: "Your changes have been saved.",
                })
              }
            >
              <Button.Label>Success</Button.Label>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onPress={() =>
                toast.show({
                  variant: "warning",
                  label: "Warning",
                  description: "Please review before continuing.",
                })
              }
            >
              <Button.Label>Warning</Button.Label>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onPress={() =>
                toast.show({
                  variant: "danger",
                  label: "Error",
                  description: "Something went wrong. Please try again.",
                  actionLabel: "Retry",
                  onActionPress: ({ hide }) => hide(),
                })
              }
            >
              <Button.Label>Error</Button.Label>
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
