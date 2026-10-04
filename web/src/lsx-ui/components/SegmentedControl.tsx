
import { useAudio } from "../hooks/useAudio/store";
import { colorWithAlpha } from "../utils";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { alpha, Flex, FlexProps, useMantineTheme } from "@mantine/core";
import { motion } from "framer-motion";
import { MotionFlex, MotionIcon, MotionText } from "./Motion";


export type SegmentProps = {
  label: string;
  value: string;
  icon?: string; // Optional icon for the segment
  rightSection?: React.ReactNode;
  color?: string;
}

export type SegmentedControlProps = {
  w?: string; // Width of the entire control
  multi?: boolean; // Optional prop to allow multiple selections
  value?: string | string[]; // Controlled value, if provided
  onChange?: (value: string | string[]) => void; // Callback for value change
  fz?: string; // Font size for the segments
  justify?: FlexProps['justify']; 
  items: SegmentProps[];
  sounds?: boolean;
  roundEdges?: boolean;
  color?: string;
} & FlexProps;

export  function SegmentedControl(props: SegmentedControlProps) {
  const theme = useMantineTheme();
  const play = useAudio((state) => state.play);

  const handleChange = (newValue: string | string[]) => {
    if (props.sounds) play('click');
    if (props.onChange) {
      props.onChange(newValue);
    }
  };

  return (
    <Flex
      bg='rgba(33, 33, 33, 0.6)'
      w={props.w || 'fit-content'}
      style={{
        borderRadius: props.roundEdges !== false ? theme.radius.xs : 0,
        overflow: 'hidden',
      }}
      {...props}
    >
      {props.items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1, ease: 'easeInOut' }}

          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Segment
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
            rightSection={item.rightSection}
            fz={props.fz}
            color={props.color}
            selected={!props.multi ? props.value === item.value : Array.isArray(props.value) && props.value.includes(item.value)}
            onClick={() => {

              if (props.multi) {
                const newValue = Array.isArray(props.value)
                  ? props.value.includes(item.value)
                    ? props.value.filter((v) => v !== item.value)
                    : [...props.value, item.value]
                  : [item.value];

                handleChange(newValue);
              } else {
                handleChange(item.value);
              }
            }}
          />
        </motion.div>
      ))}
    </Flex>
  )
}

function Segment(props: SegmentProps & {
  selected: boolean;
  onClick: () => void;
  fz?: string;
}) {
  const theme = useMantineTheme();

  return (
    <MotionFlex
      onClick={props.onClick}
      w='100%'
      direction="column"
      align="center"
      // p='xs'
      h='100%'
      bg={props.selected ? props.color ? colorWithAlpha(props.color, 0.2) : colorWithAlpha(theme.colors[theme.primaryColor][theme.primaryShade as number], 0.2) : 'transparent'}
      pos="relative"
      style={{
        // position: "relative",
        cursor: "pointer",
      }}
      justify={'center'}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Flex
        align='center'
        gap='xs'
        // bg='red'
        p='xs'
      >
        
        {props.icon && 
          <MotionIcon
            icon={props.icon as IconProp}
            // size='sm'
            initial={{
              color: props.selected ? props.color || theme.colors[theme.primaryColor][5] : 'inherit',  
            }}
            animate={{
              color: props.selected ? props.color || theme.colors[theme.primaryColor][5] : 'inherit',  
            }}
            exit={{
              color: 'inherit',
            }}
            style={{
              fontSize: theme.fontSizes.xs,
              marginBottom: '0.2vh',
            }}
          />
        }
        <MotionText
          size={props.fz || 'xs'}
          initial={{
            color: props.selected ? props.color || theme.colors[theme.primaryColor][5] : 'rgba(255, 255, 255, 0.7)',  
          }}
          animate={{
            color: props.selected ? props.color || theme.colors[theme.primaryColor][5] : 'rgba(255, 255, 255, 0.7)',  
          }}
          exit={{
            color: 'rgba(255, 255, 255, 0.7)',
          }}
          style={{
            fontFamily: 'LSX Display',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >{props.label.toUpperCase()}</MotionText>
        {props.rightSection}
      </Flex>

      {/* Enhanced bottom border with smooth animation */}
      <motion.div
        initial={false}
        animate={{
          scaleX: props.selected ? 1 : 0,
          opacity: props.selected ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1], // Custom easing curve for smooth feel
        }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '0.2vh',
          backgroundColor: props.color || theme.colors[theme.primaryColor][5],
          transformOrigin: 'center',
        }}
      />
    </MotionFlex>
  );
}