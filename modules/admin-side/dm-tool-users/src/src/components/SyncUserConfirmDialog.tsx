import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Role, WMInternalUser } from '@/types';

interface Props {
  open: boolean;
  user: WMInternalUser | null;
  role: Role | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SyncUserConfirmDialog({ open, user, role, isSubmitting, onConfirm, onCancel }: Props) {
  if (!user || !role) return null;
  const fullName = `${user.Firstname} ${user.Lastname}`.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add internal user?</DialogTitle>
          <DialogDescription>
            This will create a Client Portal account for the selected Works Manager user.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{fullName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium break-all">{user.NewOfficialEmailID}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium">{role.title}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Confirm & Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
