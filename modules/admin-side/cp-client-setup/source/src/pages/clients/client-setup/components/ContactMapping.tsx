import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Loader2, Search } from 'lucide-react';
import { userService } from '@/services/user.service';
import type { WMClientUser } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MappedContact {
  Code: number;
  SecondaryCid: number;
  SecondaryName: string;
  SecondaryEmail: string;
  SecondaryDesignation: string;
}

const ROLE_OPTIONS = ['All', 'Partner', 'Director', 'Manager', 'Accountant'];

// ── Contact card ──────────────────────────────────────────────────────────────

function ContactCard({
  contact,
  onDragStart,
}: {
  contact: WMClientUser;
  onDragStart: (e: React.DragEvent, cid: number) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, contact.cid)}
      className="flex flex-col gap-0.5 rounded-md border bg-background px-3 py-2 cursor-grab active:cursor-grabbing select-none shadow-sm hover:border-primary/50 transition-colors"
    >
      <span className="text-xs font-medium">{contact.Contactname}</span>
      <span className="text-[11px] text-muted-foreground">{contact.Emailaddress}</span>
      <span className="text-[11px] text-muted-foreground">{contact.Designation}</span>
    </div>
  );
}

// ── Drop zone ─────────────────────────────────────────────────────────────────

function DropZone({
  label,
  count,
  contacts,
  onDragStart,
  onDrop,
  accent,
  header,
  footer,
}: {
  label: string;
  count: number;
  contacts: WMClientUser[];
  onDragStart: (e: React.DragEvent, cid: number) => void;
  onDrop: (e: React.DragEvent) => void;
  accent?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [isOver, setIsOver] = useState(false);
  const counter = useRef(0);

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0 mt-2">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
        <span className="ml-1 text-[10px] text-muted-foreground/60">({count})</span>
      </span>

      {header}

      <div
        onDragEnter={(e) => { e.preventDefault(); counter.current++; setIsOver(true); }}
        onDragLeave={() => { counter.current--; if (counter.current === 0) setIsOver(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { counter.current = 0; setIsOver(false); onDrop(e); }}
        className={[
          'flex flex-col gap-2 rounded-md border-2 p-2 min-h-[220px] overflow-y-auto max-h-[300px] transition-colors',
          isOver
            ? accent
              ? 'border-green-500 bg-green-50'
              : 'border-muted-foreground/50 bg-muted/50 border-dashed'
            : accent
            ? 'border-primary/20 bg-muted/20'
            : 'border-muted-foreground/20 border-dashed',
        ].join(' ')}
      >
        {contacts.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-[11px] text-muted-foreground">
            {accent ? 'Drop contacts here' : 'No contacts found'}
          </div>
        ) : (
          contacts.map((c) => (
            <ContactCard key={c.cid} contact={c} onDragStart={onDragStart} />
          ))
        )}
      </div>

      {footer}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ContactMappingProps {
  companyId: number;
  userEmail: string;
  allContacts: WMClientUser[];
  onSavingChange?: (saving: boolean) => void;
}

export function ContactMapping({ companyId, userEmail, allContacts, onSavingChange }: ContactMappingProps) {
  const [mappedCids, setMappedCids]     = useState<number[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess]   = useState(false);

  const draggingCid = useRef<number | null>(null);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    setMappedCids([]);
    setSearch('');
    setSelectedRole('All');
    setSaveError(null);
    setSaveSuccess(false);

    const primary = allContacts.find(
      (c) => c.Emailaddress.toLowerCase() === userEmail.toLowerCase()
    );
    if (!primary) {
      setLoading(false);
      return;
    }

    userService.getContactMapping(companyId, primary.cid)
      .then((mappingRes) => {
        if (!mappingRes.data?.status) return;
        const rows: MappedContact[] = mappingRes.data.data ?? [];
        setMappedCids(rows.map((r) => Number(r.SecondaryCid)));
      })
      .catch(() => setError('Failed to load contact mapping'))
      .finally(() => setLoading(false));
  }, [companyId, userEmail, allContacts]);

  // Derive primary contact's cid and pid by matching on email
  const primaryContact = allContacts.find(
    (c) => c.Emailaddress.toLowerCase() === userEmail.toLowerCase()
  );

  const availableContacts = allContacts.filter((c) => !mappedCids.includes(c.cid));
  const mappedContacts    = allContacts.filter((c) =>  mappedCids.includes(c.cid));

  const filteredAvailable = availableContacts
    .filter((c) => selectedRole === 'All' || c.Designation === selectedRole)
    .filter((c) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return c.Contactname.toLowerCase().includes(s) || c.Emailaddress.toLowerCase().includes(s);
    });

  const handleDragStart = (_e: React.DragEvent, cid: number) => {
    draggingCid.current = cid;
  };

  const handleDropToMapped = (_e: React.DragEvent) => {
    if (draggingCid.current === null) return;
    const cid = draggingCid.current;
    draggingCid.current = null;
    if (!mappedCids.includes(cid)) {
      setMappedCids((prev) => [...prev, cid]);
      setSaveSuccess(false);
    }
  };

  const handleDropToAvailable = (_e: React.DragEvent) => {
    if (draggingCid.current === null) return;
    const cid = draggingCid.current;
    draggingCid.current = null;
    setMappedCids((prev) => prev.filter((id) => id !== cid));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!primaryContact) return;
    setSaving(true);
    onSavingChange?.(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await userService.saveContactMapping({
        primary_cid:    primaryContact.cid,
        pid:            primaryContact.pid,
        secondary_cids: mappedCids,
      });
      if (res.data?.status) {
        setSaveSuccess(true);
      } else {
        setSaveError(res.data?.message ?? 'Failed to save');
      }
    } catch {
      setSaveError('Failed to save contact mapping');
    } finally {
      setSaving(false);
      onSavingChange?.(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[260px] text-xs text-muted-foreground">
        Loading contacts…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[260px] text-xs text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2.5">
          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
          <div>
            <p className="text-xs font-medium text-green-800">Contact mapping saved successfully</p>
            <p className="text-[11px] text-green-700">The selected contacts' jobs are now visible to this user.</p>
          </div>
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
          <p className="text-xs text-destructive">{saveError}</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Drag contacts from <strong>Available</strong> to <strong>Added</strong>. Added contacts' jobs will be visible to this user.
      </p>

      <div className="flex gap-3">
        {/* Left — Available */}
        <DropZone
          label="Available"
          count={availableContacts.length}
          contacts={filteredAvailable}
          onDragStart={handleDragStart}
          onDrop={handleDropToAvailable}
          header={
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="h-7 pl-6 text-xs"
                />
              </div>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v ?? 'All')}>
                <SelectTrigger className="h-7 w-[110px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />

        {/* Right — Added */}
        <DropZone
          label="Added"
          count={mappedContacts.length}
          contacts={mappedContacts}
          onDragStart={handleDragStart}
          onDrop={handleDropToMapped}
          accent
          footer={
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                className="w-full h-7 text-xs"
                onClick={handleSave}
                disabled={saving || !primaryContact}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Saving…
                  </>
                ) : 'Save Mapping'}
              </Button>
              {!primaryContact && !loading && (
                <p className="text-[11px] text-muted-foreground text-center">
                  User email not found in WM contacts
                </p>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}
