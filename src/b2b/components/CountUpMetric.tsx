// Count-up metric for the hero figure. Reuses the framer-motion useSpring
// pattern from the B2C KPICard, formats each frame so digits never reflow
// (tabular figures), and honours prefers-reduced-motion (renders final value
// instantly when motion is reduced).
import React from 'react';
import { Box } from '@mui/material';
import { motion, useSpring, useReducedMotion, type MotionValue } from 'framer-motion';
import { colors, type, tabularNums } from '../theme/b2bTokens';

interface CountUpMetricProps {
  value: number;
  format: (n: number) => string;
  color?: string;
}

const Animated: React.FC<{ spring: MotionValue<number>; format: (n: number) => string }> = ({
  spring,
  format,
}) => {
  const [text, setText] = React.useState(() => format(spring.get()));
  React.useEffect(() => spring.on('change', (latest) => setText(format(latest))), [spring, format]);
  return <>{text}</>;
};

const CountUpMetric: React.FC<CountUpMetricProps> = ({ value, format, color = colors.ink }) => {
  const reduce = useReducedMotion();
  const spring = useSpring(reduce ? value : 0, { stiffness: 80, damping: 22 });

  React.useEffect(() => {
    if (!reduce) spring.set(value);
  }, [value, reduce, spring]);

  return (
    <Box
      component="span"
      sx={{
        display: 'block',
        fontSize: type.metric.fontSize,
        lineHeight: type.metric.lineHeight,
        fontWeight: type.metric.fontWeight,
        color,
        ...tabularNums,
      }}
    >
      {reduce ? format(value) : <Animated spring={spring} format={format} />}
    </Box>
  );
};

export default CountUpMetric;
