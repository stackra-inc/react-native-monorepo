/**
 * @fileoverview ConsentBanner — Dialog-based consent prompt for React Native.
 *
 * Uses HeroUI Native `Dialog` to create a GDPR-compliant consent prompt
 * that requires explicit user action. Delegates consent state changes
 * to the {@link ConsentService}.
 *
 * All HeroUI Native components are imported from `@repo/ui` per the
 * architecture guidelines — never directly from `heroui-native`.
 *
 * @module @stackra/react-native-tracking
 * @category Components
 */

import React, { useCallback } from "react";
import { View } from "react-native";
import { Dialog, Button, Alert } from "@repo/ui";

import { ConsentCategory } from "@/enums/consent-category.enum";
import { useConsent } from "@/hooks/use-consent.hook";
import type { ConsentState } from "@/interfaces/consent-state.interface";
import type { ConsentService } from "@/services/consent.service";

/**
 * Props for the {@link ConsentBanner} component.
 */
export interface ConsentBannerProps {
  /**
   * The consent service instance resolved from the DI container.
   */
  consentService: ConsentService;

  /**
   * Whether the consent dialog is open.
   */
  isOpen: boolean;

  /**
   * Callback fired when the dialog open state changes.
   *
   * @param isOpen - The new open state.
   */
  onOpenChange: (isOpen: boolean) => void;

  /**
   * Dialog title text.
   *
   * @default 'Privacy Preferences'
   */
  title?: string;

  /**
   * Dialog body text explaining why consent is needed.
   *
   * @default 'We use tracking to improve your experience. You can choose which categories to allow.'
   */
  description?: string;

  /**
   * Label for the accept-all button.
   *
   * @default 'Accept All'
   */
  acceptLabel?: string;

  /**
   * Label for the reject-all button.
   *
   * @default 'Reject All'
   */
  rejectLabel?: string;

  /**
   * Label for the manage-preferences button. When provided, a third
   * button is rendered that calls `onManage`.
   *
   * @default undefined (no manage button)
   */
  manageLabel?: string;

  /**
   * Callback fired when the user taps the manage-preferences button.
   * Use this to navigate to a {@link ConsentManager} screen.
   */
  onManage?: () => void;

  /**
   * Callback fired after the user accepts or rejects all categories.
   */
  onComplete?: () => void;
}

/**
 * ConsentBanner — Dialog-based consent prompt for React Native.
 *
 * Uses HeroUI Native `Dialog` for a native modal experience. The dialog
 * is not swipeable to dismiss — the user must explicitly accept or reject.
 *
 * @param props - Component props.
 * @returns The consent Dialog.
 *
 * @example
 * ```tsx
 * const [showConsent, setShowConsent] = useState(true);
 *
 * <ConsentBanner
 *   consentService={consentSvc}
 *   isOpen={showConsent}
 *   onOpenChange={setShowConsent}
 *   manageLabel="Manage"
 *   onManage={() => navigation.navigate('ConsentSettings')}
 * />
 * ```
 */
export function ConsentBanner({
  consentService,
  isOpen,
  onOpenChange,
  title = "Privacy Preferences",
  description = "We use tracking to improve your experience. You can choose which categories to allow.",
  acceptLabel = "Accept All",
  rejectLabel = "Reject All",
  manageLabel,
  onManage,
  onComplete,
}: ConsentBannerProps): React.JSX.Element {
  const { updateConsent } = useConsent(consentService);

  const handleAcceptAll = useCallback(() => {
    const allGranted: ConsentState = {
      [ConsentCategory.ANALYTICS]: true,
      [ConsentCategory.MARKETING]: true,
      [ConsentCategory.FUNCTIONAL]: true,
    };
    updateConsent(allGranted);
    onOpenChange(false);
    onComplete?.();
  }, [updateConsent, onOpenChange, onComplete]);

  const handleRejectAll = useCallback(() => {
    const allDenied: ConsentState = {
      [ConsentCategory.ANALYTICS]: false,
      [ConsentCategory.MARKETING]: false,
      [ConsentCategory.FUNCTIONAL]: false,
    };
    updateConsent(allDenied);
    onOpenChange(false);
    onComplete?.();
  }, [updateConsent, onOpenChange, onComplete]);

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay isCloseOnPress={false} />
        <Dialog.Content isSwipeable={false}>
          <View className="mb-5 gap-1.5">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>{description}</Dialog.Description>
          </View>
          <View className="gap-3">
            <Button variant="primary" onPress={handleAcceptAll}>
              <Button.Label>{acceptLabel}</Button.Label>
            </Button>
            {manageLabel && onManage ? (
              <Button variant="secondary" onPress={onManage}>
                <Button.Label>{manageLabel}</Button.Label>
              </Button>
            ) : null}
            <Button variant="ghost" onPress={handleRejectAll}>
              <Button.Label>{rejectLabel}</Button.Label>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
