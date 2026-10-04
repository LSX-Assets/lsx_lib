import { alpha, Flex, Portal, Text, TextInput, useMantineTheme } from "@mantine/core";
import { motion } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useState } from "react";

export type ConfirmModalProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  /** If provided, user must type this exact string to enable the confirm button */
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
  zIndex?: number;
};

export function ConfirmModal({
  title,
  description,
  confirmLabel = "Delete",
  confirmText,
  onConfirm,
  onClose,
  zIndex = 200,
}: ConfirmModalProps) {
  const theme = useMantineTheme();
  const [typed, setTyped] = useState("");
  const canConfirm = !confirmText || typed === confirmText;

  return (
    <Portal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.7)",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: alpha(theme.colors.dark[9], 0.98),
            border: `0.1vh solid ${alpha("#FF7A6B", 0.3)}`,
            borderRadius: theme.radius.sm,
            width: "44vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Flex
            justify="space-between"
            align="center"
            px="sm"
            py="xs"
            style={{
              borderBottom: `0.1vh solid ${alpha("#FF7A6B", 0.2)}`,
              background: alpha("#FF7A6B", 0.06),
              flexShrink: 0,
            }}
          >
            <Flex align="center" gap="xs">
              <AlertTriangle size="1.8vh" color="#FF7A6B" />
              <Text
                ff="LSX Display"
                size="sm"
                tt="uppercase"
                lts="0.05em"
                c="#FF7A6B"
              >
                {title}
              </Text>
            </Flex>
            <motion.button
              onClick={onClose}
              whileHover={{ background: alpha(theme.colors.dark[7], 0.5) }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: theme.spacing.xxs,
                borderRadius: theme.radius.xs,
                display: "flex",
              }}
            >
              <X color="rgba(255,255,255,0.4)" />
            </motion.button>
          </Flex>

          {/* Body */}
          <Flex direction="column" gap="sm" p="sm">
            <Text
              ff="LSX Sans"
              size="xs"
              c="rgba(255,255,255,0.65)"
              style={{ lineHeight: 1.5 }}
            >
              {description}
            </Text>

            {confirmText && (
              <Flex direction="column" gap="xxs">
                <Text
                  ff="LSX Display"
                  size="xxs"
                  tt="uppercase"
                  lts="0.07em"
                  c="rgba(255,255,255,0.35)"
                >
                  Type{" "}
                  <Text component="span" ff="LSX Display" c="#FF7A6B">
                    {confirmText}
                  </Text>{" "}
                  to confirm
                </Text>
                <TextInput
                  size="xs"
                  placeholder={confirmText}
                  value={typed}
                  onChange={(e) => setTyped(e.currentTarget.value)}
                  styles={(t) => ({
                    input: {
                      backgroundColor: alpha(t.colors.dark[7], 0.5),
                      border: `0.1vh solid ${alpha(
                        typed === confirmText
                          ? "#FF7A6B"
                          : t.colors.dark[5],
                        0.5
                      )}`,
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: "LSX Sans",
                    },
                  })}
                  autoFocus
                />
              </Flex>
            )}
          </Flex>

          {/* Footer */}
          <Flex
            justify="flex-end"
            gap="xs"
            px="sm"
            py="sm"
            style={{
              borderTop: `0.1vh solid ${theme.colors.dark[7]}`,
              flexShrink: 0,
            }}
          >
            <motion.button
              onClick={onClose}
              whileHover={{ background: alpha(theme.colors.dark[7], 0.5) }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: "transparent",
                border: `0.1vh solid ${theme.colors.dark[6]}`,
                borderRadius: theme.radius.xs,
                padding: "0.5vh 1vh",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4vh",
              }}
            >
              <X size="1.4vh" color="rgba(255,255,255,0.4)" />
              <Text
                ff="LSX Display"
                size="xxs"
                tt="uppercase"
                lts="0.05em"
                c="rgba(255,255,255,0.4)"
              >
                Cancel
              </Text>
            </motion.button>

            <motion.button
              onClick={() => {
                if (canConfirm) {
                  onConfirm();
                  onClose();
                }
              }}
              whileHover={
                canConfirm
                  ? {
                      background: alpha("#FF7A6B", 0.22),
                      borderColor: alpha("#FF7A6B", 0.6),
                    }
                  : undefined
              }
              whileTap={canConfirm ? { scale: 0.97 } : undefined}
              style={{
                background: alpha("#FF7A6B", canConfirm ? 0.14 : 0.05),
                border: `0.1vh solid ${alpha(
                  "#FF7A6B",
                  canConfirm ? 0.45 : 0.15
                )}`,
                borderRadius: theme.radius.xs,
                padding: "0.5vh 1vh",
                cursor: canConfirm ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: "0.4vh",
                opacity: canConfirm ? 1 : 0.45,
                transition: "opacity 0.15s",
              }}
            >
              <Trash2 size="1.4vh" color="#FF7A6B" />
              <Text
                ff="LSX Display"
                size="xxs"
                tt="uppercase"
                lts="0.05em"
                c="#FF7A6B"
              >
                {confirmLabel}
              </Text>
            </motion.button>
          </Flex>
        </motion.div>
      </motion.div>
    </Portal>
  );
}
