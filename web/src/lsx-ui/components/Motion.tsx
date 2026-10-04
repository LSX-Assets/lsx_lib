import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Flex, Image, Text } from "@mantine/core";
import { motion } from "framer-motion";
import React from "react";

// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'Flex' implicitly has an 'any' type.
export const MotionFlex = motion.create(Flex) as React.ComponentType<any>;
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'Text' implicitly has an 'any' type.
export const MotionText = motion.create(Text) as React.ComponentType<any>;
// @ts-expect-error ts-migrate(7006) FIXME: Parameter 'Image' implicitly has an 'any' type.
export const MotionImage = motion.create(Image) as React.ComponentType<any>;

export const MotionIcon = motion.create(FontAwesomeIcon);




