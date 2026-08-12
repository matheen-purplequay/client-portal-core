import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useClientStore } from '@/store/useClientStore';
import { queriesService } from '@/services/queries.service';
import { teamsService } from '@/services/teams.service';
import { useToast } from '@/components/ui/toast';
import type { Reviewer } from '@/types';
import { Trash2 } from 'lucide-react';

export function ClientReviewers() {
  const { existingCompany } = useClientStore();
  const toast = useToast();

  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [internalUsers, setInternalUsers] = useState<Reviewer[]>([]);
  const [selectedUser, setSelectedUser] = useState<Reviewer | null>(null);
  const [gettingReviewers, setGettingReviewers] = useState(false);
  const [addingReviewer, setAddingReviewer] = useState(false);
  const [removingReviewer, setRemovingReviewer] = useState(false);
  const [isGettingUsers, setIsGettingUsers] = useState(false);

  const fetchReviewers = useCallback(async () => {
    if (!existingCompany) return;
    setGettingReviewers(true);
    try {
      const res = await queriesService.getQueryApprovers({ client_id: existingCompany.works_manager_client_id });
      if (res.data?.status) setReviewers(res.data.data ?? []);
    } finally {
      setGettingReviewers(false);
    }
  }, [existingCompany?.works_manager_client_id]);

  const fetchTeamUsers = useCallback(async () => {
    setIsGettingUsers(true);
    try {
      const res = await teamsService.getSelfUsers({});
      if (res.data?.status) {
        setInternalUsers(res.data.data ?? []);
        if (res.data.data?.length > 0) setSelectedUser(res.data.data[0]);
      }
    } finally {
      setIsGettingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchReviewers();
    fetchTeamUsers();
  }, [existingCompany?.id]);

  const addReviewer = async () => {
    if (!existingCompany || !selectedUser) return;
    if (reviewers.some((r) => r.id === selectedUser.id)) {
      toast.warning('Reviewer already added');
      return;
    }
    setAddingReviewer(true);
    try {
      const res = await queriesService.addQueryApprovers({
        client_id: existingCompany.works_manager_client_id,
        user_id: selectedUser.wm_user_id,
      });
      if (res.data?.status) {
        toast.success('Reviewer added');
        fetchReviewers();
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setAddingReviewer(false);
    }
  };

  const removeReviewer = async (id: number) => {
    setRemovingReviewer(true);
    try {
      const res = await queriesService.removeQueryApprovers({ approver_id: id });
      if (res.data?.status) {
        toast.success('Reviewer removed');
        fetchReviewers();
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setRemovingReviewer(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Add Reviewer ───────────────────────────────────────── */}
      <div className="border rounded-md p-4 bg-muted/20 space-y-3">
        <h4 className="text-sm font-medium">Add Query Reviewer</h4>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label className="text-xs mb-1 block">Select Internal User</Label>
            <Select
              value={selectedUser?.id?.toString() ?? ''}
              onValueChange={(v: string | null) => {
                if (!v) return;
                const user = internalUsers.find((u) => u.id.toString() === v);
                if (user) setSelectedUser(user);
              }}
              disabled={isGettingUsers}
            >
              <SelectTrigger className="h-8"><SelectValue>{selectedUser ? `${selectedUser.name} (${selectedUser.email})` : 'Select user'}</SelectValue></SelectTrigger>
              <SelectContent>
                {internalUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={addReviewer} disabled={addingReviewer || !selectedUser}>
            {addingReviewer ? 'Adding...' : 'Add Reviewer'}
          </Button>
        </div>
      </div>

      <Separator />

      {/* ── Reviewers List ─────────────────────────────────────── */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          {reviewers.length} reviewer{reviewers.length !== 1 ? 's' : ''}
        </h4>

        {gettingReviewers ? (
          <div className="text-sm text-muted-foreground text-center py-6">Loading reviewers...</div>
        ) : reviewers.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">No reviewers configured</div>
        ) : (
          <div className="divide-y border rounded-md overflow-hidden">
            {reviewers.map((reviewer) => (
              <div key={reviewer.id} className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{reviewer.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{reviewer.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive shrink-0"
                  onClick={() => removeReviewer(reviewer.id)}
                  disabled={removingReviewer}
                >
                  <Trash2 strokeWidth={1.5} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
