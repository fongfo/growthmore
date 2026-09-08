import { MaterialCommunityIcons } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import { colors, icon } from "../theme";

export type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type AppIconProps = {
  color?: keyof typeof colors.light;
  name: IconName;
  size?: keyof typeof icon;
};

export function AppIcon({ color = "textSecondary", name, size = "md" }: AppIconProps) {
  return <MaterialCommunityIcons color={colors.light[color]} name={name} size={icon[size]} />;
}
