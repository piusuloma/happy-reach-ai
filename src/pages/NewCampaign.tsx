import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Image as ImageIcon, Sparkles, Send, Calendar, Users, Eye, Info } from "lucide-react";
import { useState } from "react";
import { segments, business } from "@/data/mock";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const NewCampaign = () => {
  const [message, setMessage] = useState("Hi {{customer_name}}! 🍛 Big news — we have a new menu at Mama's Kitchen this weekend.\n\n3 new rice dishes · Prices from ₦2,500\nOrder now: nativeid.io/mamas-kitchen");
  const [segmentId, setSegmentId] = useState("s1");
  const [followUp, setFollowUp] = useState(true);
  const [stopOnOrder, setStopOnOrder] = useState(true);
  const [schedule, setSchedule] = useState("now");
  const reach = segments.find(s => s.id === segmentId)?.count ?? 0;
  const preview = message.replace(/\{\{customer_name\}\}/g, "Adaeze").replace(/\{\{business_name\}\}/g, business.name);

  return (
    <AppLayout>
      <PageHeader
        title="New broadcast"
        subtitle="Compose, target, schedule. Send to opted-in contacts only."
        actions={
          <>
            <Button variant="outline" asChild className="rounded-xl"><Link to="/campaigns">Cancel</Link></Button>
            <Button variant="outline" className="rounded-xl">Save draft</Button>
            <Button onClick={() => toast.success(`Campaign queued for ${reach.toLocaleString()} contacts`)} className="rounded-xl grad-primary text-primary-foreground border-0">
              <Send className="h-4 w-4 mr-1.5" /> {schedule === "now" ? "Send now" : "Schedule"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Message */}
          <section className="surface-card p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Message</h3>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7} className="rounded-xl text-sm leading-relaxed" maxLength={1024} />
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-wrap gap-1.5">
                {["{{customer_name}}", "{{business_name}}", "{{offer_code}}"].map(v => (
                  <button key={v} onClick={() => setMessage(m => m + " " + v)} className="text-[11px] px-2 py-1 rounded-md bg-accent text-accent-foreground hover:bg-accent/70 font-mono">{v}</button>
                ))}
                <Button variant="outline" size="sm" className="rounded-lg h-7 ml-2"><ImageIcon className="h-3.5 w-3.5 mr-1" />Add media</Button>
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">{message.length} / 1024</span>
            </div>
          </section>

          {/* Audience */}
          <section className="surface-card p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Audience</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Segment</Label>
                <Select value={segmentId} onValueChange={setSegmentId}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {segments.map(s => <SelectItem key={s.id} value={s.id}>{s.name} · {s.count.toLocaleString()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Filters</Label>
                <Input className="mt-1 rounded-xl" placeholder="+ Add filter (location, tag, last order…)" />
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-accent p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-4 w-4 text-primary" /></div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Estimated reach: <span className="tabular-nums">{reach.toLocaleString()}</span> contacts</div>
                <div className="text-[11px] text-muted-foreground">All recipients are opted-in. {business.totalCustomers - business.optedInContacts} contacts excluded (no opt-in).</div>
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className="surface-card p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Schedule</h3>
            <Tabs value={schedule} onValueChange={setSchedule}>
              <TabsList className="rounded-xl bg-muted/50">
                <TabsTrigger value="now" className="rounded-lg">Send now</TabsTrigger>
                <TabsTrigger value="later" className="rounded-lg">Schedule for later</TabsTrigger>
              </TabsList>
              <TabsContent value="later" className="grid sm:grid-cols-2 gap-3 mt-4">
                <Input type="date" className="rounded-xl" defaultValue="2026-04-25" />
                <Input type="time" className="rounded-xl" defaultValue="10:00" />
              </TabsContent>
            </Tabs>
          </section>

          {/* Follow up */}
          <section className="surface-card p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="font-display font-bold text-lg">Auto follow-up</h3>
                <p className="text-xs text-muted-foreground">If a contact does not order, send a single follow-up. Stops as soon as they convert.</p>
              </div>
              <Switch checked={followUp} onCheckedChange={setFollowUp} />
            </div>
            {followUp && (
              <div className="mt-4 space-y-3">
                <div className="grid sm:grid-cols-[140px_1fr] gap-3 items-start">
                  <Select defaultValue="48">
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">After 24 hours</SelectItem>
                      <SelectItem value="48">After 48 hours</SelectItem>
                      <SelectItem value="72">After 72 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea rows={3} className="rounded-xl text-sm" defaultValue="Missed our new menu? Order before Sunday and get 10% off with code MAMA10." />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={stopOnOrder} onCheckedChange={setStopOnOrder} />
                  Stop all follow-ups as soon as the contact places an order
                </label>
              </div>
            )}
          </section>
        </div>

        {/* Right rail — preview & guardrails */}
        <div className="space-y-5">
          <section className="surface-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold flex items-center gap-2"><Eye className="h-4 w-4" /> Live preview</h3>
              <span className="text-[10px] text-muted-foreground">As recipient</span>
            </div>
            <div className="rounded-2xl bg-[#E5DDD5] p-3 min-h-[300px] flex flex-col gap-2">
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 max-w-[88%] shadow-sm">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-success mb-1">
                  <ShieldCheck className="h-3 w-3" /> {business.name} · Verified business
                </div>
                <p className="text-[13px] whitespace-pre-wrap text-gray-800 leading-snug">{preview}</p>
                <div className="text-[10px] text-gray-400 text-right mt-1">10:00 ✓✓</div>
              </div>
              {followUp && (
                <div className="text-[10px] text-center text-gray-500 bg-white/40 rounded-full py-1 my-1">+48h follow-up if no order</div>
              )}
            </div>
          </section>

          <section className="surface-card p-5">
            <h3 className="font-display font-bold flex items-center gap-2 mb-3"><Info className="h-4 w-4 text-info" /> Guardrails</h3>
            <ul className="space-y-2.5 text-xs">
              <Guard ok title="Opt-in required" desc="Only sending to contacts who consented at checkout." />
              <Guard ok title="2 per 24h cap" desc="Across all campaigns and triggers — protects your sender quality." />
              <Guard ok title="STOP honoured instantly" desc="Anyone who replies STOP is removed from all automations." />
              <Guard title="Template approval" desc="Promotional template auto-submitted to WhatsApp on send." />
            </ul>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

function Guard({ title, desc, ok }: { title: string; desc: string; ok?: boolean }) {
  return (
    <li className="flex gap-2.5">
      <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${ok ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
        {ok ? "✓" : "!"}
      </div>
      <div>
        <div className="font-semibold text-[12px]">{title}</div>
        <div className="text-muted-foreground text-[11px]">{desc}</div>
      </div>
    </li>
  );
}

export default NewCampaign;
