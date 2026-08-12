import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ClientSetupHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  addingNew: boolean;
  onToggleAddingNew: () => void;
}

export function ClientSetupHeader({
  searchTerm,
  onSearchChange,
  addingNew,
  onToggleAddingNew,
}: ClientSetupHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 flex-1">
        <Input
          placeholder="Search users by name or email"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xs h-8"
        />
      </div>
      <Button size="sm" onClick={onToggleAddingNew}>
        {addingNew ? 'Cancel' : '+ New User'}
      </Button>
    </div>
  );
}
