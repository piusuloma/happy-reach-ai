import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/identity/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const categories = ["Food & Beverage", "Fashion & Beauty", "Electronics", "Services", "Logistics", "Health", "Other"];

const Profile = () => {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const valid = name.length > 1 && category;

  return (
    <AuthShell
      step={{ current: 3, total: 3 }}
      title="Set up your profile"
      subtitle="This is what customers will see when they verify you. You can edit anything later."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          toast.success("Tier 1 verified — your NativeID is ready");
          nav("/identity");
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Business name
          </Label>
          <Input
            id="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mama's Kitchen"
            className="h-12 rounded-xl mt-1.5"
          />
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Business category
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-12 rounded-xl mt-1.5">
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-accent p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Tier 1 badge unlocks immediately
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
            Add CAC and a utility bill later to unlock higher escrow limits and the full Verified badge.
          </p>
        </div>

        <Button
          type="submit"
          disabled={!valid}
          className="w-full h-12 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)]"
        >
          Create my NativeID
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  );
};

export default Profile;
