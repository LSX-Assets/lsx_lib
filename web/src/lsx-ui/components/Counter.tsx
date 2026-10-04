import { AnimatePresence } from "framer-motion";
import { MotionFlex } from "./Motion";

export function Counter(props: {count: number, color?: string, style?: React.CSSProperties}) {
  return (
    <AnimatePresence>
      {props.count > 0 && (
        <MotionFlex
          key='counter'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}

          fz='1.25vh'
          h='1.75vh'
          justify={'center'}
          align='center'
          bg={props.color || 'rgba(0, 0, 0, 0.51)'}
          style={{
            borderRadius: '50%',
            aspectRatio: '1/1',
            marginBottom: '0.3vh',
            fontFamily: 'LSX Display',
            boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
            ...props.style
          }}
        >
          {props.count}
        </MotionFlex> 
      )}
    </AnimatePresence>

  )
}