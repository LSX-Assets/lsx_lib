import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Flex, Text, useMantineTheme } from "@mantine/core";
import { MotionFlex } from "./Motion";


export type PromptButton = {
  icon?: string;
  text: string;
  color?: string;
  variant?: 'filled' | 'outline' | 'light' | 'subtle' | 'default';
  onClick: () => void;
}

export type Prompt = {
  message: string;
  buttons: PromptButton[];
};

export function PromptModal(props: Prompt) {
  const theme = useMantineTheme();
  return (
    <MotionFlex
      gap='sm'
      direction={'column'}
      flex={1}
    >
      <Text
        size='xs'
        c='rgba(255, 255, 255, 0.8)'
      >{props.message}</Text>
      <Flex
        gap='sm'
      >
        {props.buttons.map((button, index) => (
          <Button
            key={index}
            variant={button.variant}
            color={button.color}
            flex={0.5}
            onClick={button.onClick}
            leftSection={button.icon ? (
              <FontAwesomeIcon
                icon={button.icon as IconProp}
                style={{
                  fontSize: theme.fontSizes.xs,
                }}
              />
            ): undefined}
          >
            {button.text}
          </Button>
        ))}
      </Flex>
    </MotionFlex>
  )
} 

