import { useMantineTheme, Flex, Text } from "@mantine/core";

export type InfoBoxProps = {
  leftSide: string;
  rightSide: string;
};

export function InfoBox(props: InfoBoxProps) {
  const theme = useMantineTheme();


  return (
    <Flex
      w='fit-content'
      h='fit-content'
      style={{
        borderRadius: theme.radius.xs,
        overflow: 'hidden',
        border: `0.2vh solid rgba(86, 105, 95,0.3)`
      }}
      align='center'
    >
      <Flex
        miw='4vh'
        p='xxs'
        bg='rgba(86, 105, 95,0.2)'
        direction='column'
        justify='center'
        align='center'
      >
        <Text c='lightgrey' size='xxs'
          style={{
            fontFamily: 'LSX Display',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>{props.leftSide}</Text>
      </Flex>

      <Flex
        p='xxs'
        flex={1}
        miw='4vh'
        bg='rgba(86, 105, 95,0.5)'
        direction='column'
        align='center'
        justify='center'
      >
        <Text c='lightgrey' size='xxs'
          style={{
            fontFamily: 'LSX Display',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >{props.rightSide}</Text>
      </Flex>

    </Flex>
  );
}
