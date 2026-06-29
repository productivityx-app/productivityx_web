import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface Item {
  label: string;
  value?: string;
  icon?: LucideIcon;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
}

interface SmartDropdownProps {
  trigger: React.ReactNode;
  items?: Item[];
  checkedItems?: string[];
  onCheck?: (value: string) => void;
  selectedValue?: string;
  onSelect?: (value: string) => void;
  submenu?: { label: string; items: Item[] };
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export default function SmartDropdown({
  trigger,
  items,
  checkedItems,
  onCheck,
  selectedValue,
  onSelect,
  submenu,
  className,
  align = 'end',
}: SmartDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn('min-w-[180px]', className)}>
        {onCheck && checkedItems ? (
          <>
            {items?.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuCheckboxItem
                  key={item.value || item.label}
                  checked={checkedItems.includes(item.value || item.label)}
                  onCheckedChange={() => onCheck(item.value || item.label)}
                  disabled={item.disabled}
                  className={cn(item.danger && 'text-destructive focus:text-destructive')}
                >
                  {Icon && <Icon size={14} />}
                  {item.label}
                  {item.shortcut && (
                    <kbd className="ml-auto text-[10px] text-muted-foreground/40 font-mono">{item.shortcut}</kbd>
                  )}
                </DropdownMenuCheckboxItem>
              );
            })}
          </>
        ) : onSelect && selectedValue ? (
          <DropdownMenuRadioGroup value={selectedValue} onValueChange={onSelect}>
            {items?.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuRadioItem
                  key={item.value || item.label}
                  value={item.value || item.label}
                  disabled={item.disabled}
                  className={cn(item.danger && 'text-destructive focus:text-destructive')}
                >
                  {Icon && <Icon size={14} />}
                  {item.label}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        ) : (
          <>
            {items?.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.value || item.label}
                  disabled={item.disabled}
                  className={cn(item.danger && 'text-destructive focus:text-destructive')}
                >
                  {Icon && <Icon size={14} />}
                  {item.label}
                  {item.shortcut && (
                    <kbd className="ml-auto text-[10px] text-muted-foreground/40 font-mono">{item.shortcut}</kbd>
                  )}
                </DropdownMenuItem>
              );
            })}
            {submenu && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {submenu.label}
                    <ChevronRight size={14} className="ml-auto" />
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {submenu.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.value || item.label} disabled={item.disabled}>
                          {Icon && <Icon size={14} />}
                          {item.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
