import { IconType } from "react-icons";

interface MenuHeaderProps {
  title: string;
  icon: IconType;
  iconSize?: string;
  iconColor?: string;
}

export const MenuHeader = ({ title, icon: Icon, iconSize = "17px", iconColor = "#4f5eff" }: MenuHeaderProps) => {
  return (
    <div className="flex justify-center py-1 overflow-hidden">
      <div className="flex items-center text-sm text-muted-foreground max-w-full">
        <Icon size={iconSize} color={iconColor} className="w-4 h-4 mr-2 flex-shrink-0" />
        <div className="truncate flex-1">{title}</div>
      </div>
    </div>
  );
};
