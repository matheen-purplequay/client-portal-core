import { useMemo } from 'react';
import type { ClientUser, Role } from '@/types';
import { ClientUserRow } from './ClientUserRow';

interface ClientUserListProps {
  users: ClientUser[];
  roles: Role[];
  isFetching: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onStartEdit: (user: ClientUser) => void;
  onRemove: (user: ClientUser) => void;
}

const ROLE_ORDER = ['Director', 'Partner', 'Manager', 'Accountant'];

export function ClientUserList({
  users,
  roles,
  isFetching,
  canEdit,
  canDelete,
  onStartEdit,
  onRemove,
}: ClientUserListProps) {
  const groups = useMemo(() => {
    const byTitle = new Map<string, ClientUser[]>();
    for (const user of users) {
      const title = roles.find((r) => r.code === user.role)?.title ?? user.role;
      if (!byTitle.has(title)) byTitle.set(title, []);
      byTitle.get(title)!.push(user);
    }

    const ordered: { title: string; users: ClientUser[] }[] = [];
    for (const title of ROLE_ORDER) {
      const list = byTitle.get(title);
      if (list) {
        ordered.push({ title, users: list });
        byTitle.delete(title);
      }
    }
    for (const [title, list] of byTitle) {
      ordered.push({ title, users: list });
    }
    return ordered;
  }, [users, roles]);

  if (isFetching) {
    return <div className="text-center py-6 text-sm text-muted-foreground">Loading users...</div>;
  }

  if (users.length === 0) {
    return <div className="text-center py-6 text-sm text-muted-foreground">No users found</div>;
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.title}>
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 px-1">
            {group.title}
            <span className="ml-2 text-muted-foreground/70 normal-case">({group.users.length})</span>
          </h4>
          <div className="divide-y border rounded-md overflow-hidden">
            {group.users.map((user) => (
              <ClientUserRow
                key={user.user_id}
                user={user}
                canEdit={canEdit}
                canDelete={canDelete}
                onStartEdit={onStartEdit}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
