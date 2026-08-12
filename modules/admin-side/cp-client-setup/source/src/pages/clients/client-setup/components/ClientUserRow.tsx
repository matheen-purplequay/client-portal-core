import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import type { ClientUser } from '@/types';

interface ClientUserRowProps {
  user: ClientUser;
  canEdit: boolean;
  canDelete: boolean;
  onStartEdit: (user: ClientUser) => void;
  onRemove: (user: ClientUser) => void;
}

export function ClientUserRow({
  user,
  canEdit,
  canDelete,
  onStartEdit,
  onRemove,
}: ClientUserRowProps) {
  return (
    <div className={`flex items-center justify-between gap-3 text-sm hover:bg-yellow-50 ${!user.is_active && 'opacity-50'}`}>
      <div className="px-4 py-2.5 flex items-center justify-between flex-1">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.first_name} {user.middle_name} {user.last_name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {!!user.hide_in_selection &&
            <Badge variant="outline" className={`text-xs shrink-0 bg-primary/10`}>
              <EyeOff size={14} />
            </Badge>
          }
          <Badge variant="secondary" className="text-xs shrink-0 text-white">{user.role}</Badge>
          <Badge variant={user.is_active ? 'default' : 'outline'} className="text-xs shrink-0">
            {user.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <div className="flex gap-1 shrink-0">
            {canEdit && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onStartEdit(user)}>
                Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => onRemove(user)}>
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
