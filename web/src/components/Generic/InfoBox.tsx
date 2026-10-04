import { useMantineTheme, Flex, Text } from "@mantine/core";

type InfoBoxProps = {
  leftSide: string;
  rightSide: string;
};
export default function InfoBox(props: InfoBoxProps) {
  const theme = useMantineTheme();


  return (
    <Flex
      w='fit-content'
      h='60%'
      style={{
        borderRadius: theme.radius.xxs,
        overflow: 'hidden',
        border: `1px solid rgba(86, 105, 95,0.6)`
      }}
      align='center'
    >
      <Flex
        p='xs'
        bg='rgba(86, 105, 95,0.2)'
        direction='column'
        justify='center'
        align='center'
      >
        <Text c='lightgrey' size='xs'
          style={{
            fontFamily: 'LSX Display'
          }}>{props.leftSide}</Text>
      </Flex>

      <Flex
        p='xs'
        bg='rgba(86, 105, 95,0.5)'
        direction='column'
        align='center'
        justify='center'
      >
        <Text c='lightgrey' size='xs'
          style={{
            fontFamily: 'LSX Display'
          }}
        >{props.rightSide}</Text>
      </Flex>

    </Flex>
  );
}
