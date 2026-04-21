import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shipmentTemplates } from "@/data/mock";
import { useState } from "react";
import { Truck, Package, Bike, CheckCircle2, Clock, MapPin, Pencil } from "lucide-react";

const iconFor: Record<string, any> = { Confirmed: CheckCircle2, Dispatched: Package, "Out for delivery": Bike, Delivered: CheckCircle2, Delayed: Clock };
const colorFor: Record<string, string> = { Confirmed: "grad-emerald", Dispatched: "grad-sky", "Out for delivery": "grad-orange", Delivered: "grad-primary", Delayed: "grad-violet" };

const Shipment = () => {
  const [items, setItems] = useState(shipmentTemplates);

  return (
    <AppLayout>
      <PageHeader
        title="Shipment Tracking"
        subtitle="Tap a status in your order dashboard — the matching WhatsApp update fires automatically. Courier API integration is on the roadmap."
        actions={<Button variant="outline" className="rounded-xl"><MapPin className="h-4 w-4 mr-1.5" />Connect courier (soon)</Button>}
      />

      <div className="rounded-2xl bg-accent p-5 mb-6 flex items-start gap-3">
        <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-semibold text-accent-foreground">How it works today</div>
          <p className="text-muted-foreground text-xs mt-0.5">In your order view, tap a status button (Dispatched, Out for delivery, Delivered). The customer instantly receives the matching verified WhatsApp message — no typing required. Delivery automatically schedules the satisfaction rating 3 hours later.</p>
        </div>
      </div>

      <div className="grid gap-3">
        {items.map(s => {
          const Icon = iconFor[s.status] ?? Truck;
          return (
            <div key={s.id} className="surface-card p-5">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl ${colorFor[s.status]} text-white flex items-center justify-center`}><Icon className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{s.status}</h4>
                    {s.enabled && <span className="text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded">Active</span>}
                  </div>
                  <Input defaultValue={s.message} className="mt-2 rounded-xl text-sm" />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["{{order_id}}", "{{rider_name}}", "{{rider_phone}}", "{{tracking_url}}", "{{new_eta}}"].map(v => (
                      <span key={v} className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{v}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Switch checked={s.enabled} onCheckedChange={(v) => setItems(p => p.map(x => x.id === s.id ? { ...x, enabled: v } : x))} />
                  <Button variant="ghost" size="sm" className="rounded-lg text-xs"><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Shipment;
