import { colorWithAlpha, locale } from "../utils";
import { Flex, RingProgress, Text, alpha, useMantineTheme } from "@mantine/core";

export function LevelPanel(props: {
  exp: number;
  level: number;
  nextLevelXP: number;
  progressToLevel: number;
  text?: string;
  color?: string;
}){
  const theme = useMantineTheme();

  return (
    <Flex
      w='fit-content'
      pr='8vh'
      pl='8vh'
      
      bg='linear-gradient(180deg, rgba(30, 30, 30, 0.82) 0%, rgba(30, 30, 30, 0.3) 50%, rgba(30, 30, 30, 0.6) 100%)' 
      style={{
        borderRadius: theme.radius.xs,
        boxShadow: theme.shadows.sm,
        outline: '0.2vh solid rgba(255,255,255,0.1)',
      }}
      justify={'center'}
      align={'center'}
      direction={'column'}
      p='sm'
    >

      <RingProgress
        size={190}
        roundCaps
        thickness={10}
        sections={[{ value: props.progressToLevel, color:colorWithAlpha(props.color || theme.colors[theme.primaryColor][theme.primaryShade as number], 0.9) }]}
        label={
          <Flex
            justify={'center'}
            align={'center'}
            direction={'column'}
          >
            <Text
              size='6vh'
              c={colorWithAlpha(props.color || theme.colors[theme.primaryColor][theme.primaryShade as number], 0.9)}
              style={{
                fontFamily: 'LSX Display Bold',
                textShadow: `0 0 10px ${colorWithAlpha(props.color || theme.colors[theme.primaryColor][theme.primaryShade as number], 0.7)}`,  
              }}
            >
              {props.level}
            </Text>
          </Flex>
        }
      />
      <Text
        size='sm'
        style={{
          fontFamily: 'LSX Display Bold',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {props.text || locale('Level')}
      </Text>
      <Text
        size='xs'
        c='rgba(255,255,255,0.6)'
      >
        {props.exp}/{props.nextLevelXP} {locale('EXP')}
      </Text>
    </Flex>
  )
}
