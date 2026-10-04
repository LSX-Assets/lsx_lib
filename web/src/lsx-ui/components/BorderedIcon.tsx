import { colorWithAlpha } from "../utils";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Flex, useMantineTheme } from "@mantine/core";

export type BorderedIconProps = {
  icon: string;
  color?: string;
  fontSize?: string;
  hovered?: boolean;
  hoverable?: boolean;
  radius?: string;
  p?: string;
}

export function BorderedIcon(props: BorderedIconProps){
  const theme = useMantineTheme();
  return (
    <Flex
      bg='rgba(0, 0, 0, 0.5)'
      p={props.p || 'xs'}
      justify='center'
      align='center'
      style={{
        aspectRatio: '1/1', 
     
        borderRadius: theme.radius.xs,
        // border: `2px solid var(--mantine-primary-color-9)`,
        outline: `0.2vh solid ${colorWithAlpha(props.color ? props.color : theme.colors[theme.primaryColor][9], 0.8)}`,
        boxShadow: `inset 0 0 2vh ${colorWithAlpha(props.color ? props.color : theme.colors[theme.primaryColor][7], 0.5)}`
      }}
    
    >
      <FontAwesomeIcon
        icon={props.icon as IconName}
        color={colorWithAlpha(props.color ? props.color : theme.colors[theme.primaryColor][theme.primaryShade as number], props.hovered ? 0.9: 0.9)}
        style={{
          fontSize: props.fontSize ? props.fontSize: '2.5vh',
        }}
      />
    </Flex>
  )
}