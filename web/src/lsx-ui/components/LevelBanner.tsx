
import { Flex, Progress, Text, useMantineTheme } from "@mantine/core";
import { MotionFlex } from "./Motion";


export function LevelBanner(props: {
  exp: number;
  level: number;
  nextLevelXP: number;
  progressToLevel: number;

  color?: string;
}){ 
  return (
    <MotionFlex
      // bg='rgba(86, 105, 95, 0.3)'
      w='35vh'
      pos='absolute'
      left='50%'
      align='center'
      gap='xs'
      style={{
        
        borderRadius: useMantineTheme().radius.xxs,
      }}
      // direction={'column'}
      initial={{ opacity: 0, y: -10, transform: 'translateX(-50%)' }}
      animate={{ opacity: 1, y: 0, transform: 'translateX(-50%)' }}
      exit={{ opacity: 0, y: -10, transform: 'translateX(-50%)' }}
      transition={{ duration: 0.3 }}
      direction={'column'}
    >
      <Flex
        w='100%'
        justify={'space-between'}
      >
        <Text
          size='xxs'
          c='rgba(255, 255, 255, 0.9)'
          style={{
            fontFamily: 'LSX Display',
            letterSpacing: '0.1em',
          }}
        >LVL {props.level}</Text>
        <Text
          size='xxs'
          c='rgba(255, 255, 255, 0.7)'
          style={{
            fontFamily: 'LSX Display',
            letterSpacing: '0.1em',
          }}
        >{props.exp}/{props.nextLevelXP} XP</Text>
        <Text
          size='xxs'
          c='rgba(255, 255, 255, 0.7)'
          style={{
            fontFamily: 'LSX Display',
            letterSpacing: '0.1em', 
          }}
        >LVL {props.level + 1}</Text>
      </Flex>
      <Progress
        color={props.color}
        w='100%'
        size='sm'
        value={props.progressToLevel}
      />
    </MotionFlex>

  )
}

