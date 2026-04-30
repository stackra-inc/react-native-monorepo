/**
 * @fileoverview ConsentManager — per-category consent toggle UI for React Native.
 *
 * Renders a list of consent categories with HeroUI Native `Switch` compound
 * components inside a `Card`, allowing the user to grant or revoke consent
 * for each category individually.
 *
 * All HeroUI Native components are imported from `@repo/ui` per the
 * architecture guidelines — never directly from `heroui-native`.
 *
 * @module @stackra/react-native-tracking
 * @category Components
 */

import React, { useCallback } from "react";
import { View, Text } from "react-native";
import { Button, Card, Switch, Separator } from "@repo/ui";

import { ConsentCategory } from "@/enums/consent-category.enum";
import { useConsent } from "@/hooks/use-consent.hook";
import type { ConsentState } from "@/interfaces/consent-state.interface";
import type { ConsentService } from "@/services/consent.service";

/**
 * Configuration for a single consent category displayed in the manager.
 */
export interface ConsentCategoryConfig {
  /**
   * The consent category enum value.
   */
  category: ConsentCategory;

  /**
   * Human-readable label for the category.
   */
  label: string;

  /**
   * Description explaining what this category covers.
   */
  description: string;

  /**
   * Whether this category can be toggled by the user.
   * Set to `false` for categories that are always required.
   *
   * @default true
   */
  toggleable?: boolean;
}

/**
 * Props for the {@link ConsentManager} component.
 */
export interface ConsentManagerProps {
  /**
   * The consent service instance resolved from the DI container.
   */
  consentService: ConsentService;

  /**
   * Configuration for each consent category to display.
   *
   * @default Default categories with standard labels.
   */
  categories?: ConsentCategoryConfig[];

  /**
   * Label for the save button.
   *
   * @default 'Save Preferences'
   */
  saveLabel?: string;

  /**
   * Label for the accept-all button.
   *
   * @default 'Accept All'
   */
  acceptAllLabel?: string;

  /**
   * Callback fired after the user saves their preferences.
   */
  onSave?: () => void;
}

/** Default category configurations. */
const DEFAULT_CATEGORIES: ConsentCategoryConfig[] = [
  {
    category: ConsentCategory.FUNCTIONAL,
    label: "Functional",
    description: "Essential for the app to function properly.",
    toggleable: false,
  },
  {
    category: ConsentCategory.ANALYTICS,
    label: "Analytics",
    description: "Help us understand how you use the app.",
    toggleable: true,
  },
  {
    category: ConsentCategory.MARKETING,
    label: "Marketing",
    description: "Used to deliver personalized ads and measure campaigns.",
    toggleable: true,
  },
];

/**
 * ConsentManager — per-category consent toggle UI using HeroUI Native components.
 *
 * Renders HeroUI Native `Switch` toggles inside a `Card` for each consent
 * category. Non-toggleable categories (e.g., functional) are shown as
 * always-on and disabled. Changes are applied immediately via the
 * {@link ConsentService}.
 *
 * @param props - Component props.
 * @returns The consent manager Card.
 *
 * @example
 * ```tsx
 * <ConsentManager
 *   consentService={consentSvc}
 *   onSave={() => navigation.goBack()}
 * />
 * ```
 */
export function ConsentManager({
  consentService,
  categories = DEFAULT_CATEGORIES,
  saveLabel = "Save Preferences",
  acceptAllLabel = "Accept All",
  onSave,
}: ConsentManagerProps): React.JSX.Element {
  const { consentState, grantConsent, revokeConsent, updateConsent } = useConsent(consentService);

  const handleToggle = useCallback(
    (category: ConsentCategory, granted: boolean) => {
      if (granted) {
        grantConsent(category);
      } else {
        revokeConsent(category);
      }
    },
    [grantConsent, revokeConsent],
  );

  const handleAcceptAll = useCallback(() => {
    const allGranted: ConsentState = {
      [ConsentCategory.ANALYTICS]: true,
      [ConsentCategory.MARKETING]: true,
      [ConsentCategory.FUNCTIONAL]: true,
    };
    updateConsent(allGranted);
    onSave?.();
  }, [updateConsent, onSave]);

  const handleSave = useCallback(() => {
    onSave?.();
  }, [onSave]);

  return (
    <Card>
      <Card.Body>
        <Card.Title>Consent Preferences</Card.Title>
        <Card.Description>Choose which categories of tracking you allow.</Card.Description>
      </Card.Body>
      <View className="gap-0">
        {categories.map((cat, index) => {
          const isGranted = cat.toggleable === false || consentState[cat.category];

          return (
            <React.Fragment key={cat.category}>
              {index > 0 && <Separator className="my-1" />}
              <View className="flex-row items-center justify-between py-3 px-4">
                <View className="flex-1 mr-3">
                  <Text className="text-sm font-medium text-foreground">{cat.label}</Text>
                  <Text className="text-xs text-muted mt-0.5">{cat.description}</Text>
                </View>
                <Switch
                  isSelected={isGranted}
                  isDisabled={cat.toggleable === false}
                  onSelectedChange={(selected: boolean) => handleToggle(cat.category, selected)}
                >
                  <Switch.Thumb />
                </Switch>
              </View>
            </React.Fragment>
          );
        })}
      </View>
      <Card.Footer className="gap-3">
        <Button variant="ghost" onPress={handleSave}>
          <Button.Label>{saveLabel}</Button.Label>
        </Button>
        <Button variant="primary" onPress={handleAcceptAll}>
          <Button.Label>{acceptAllLabel}</Button.Label>
        </Button>
      </Card.Footer>
    </Card>
  );
}
