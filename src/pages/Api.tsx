import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { apiEndpoints } from "@/data/mock";
import { Code2, Key, Copy, Webhook, Terminal, Book } from "lucide-react";

const sampleCurl = `curl -X POST https://api.nativeid.io/v1/automations/trigger \\
  -H "Authorization: Bearer nid_live_•••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "+2348031234567",
    "automation": "order_confirmation",
    "variables": {
      "customer_name": "Adaeze",
      "order_id": "4821"
    }
  }'`;

const Api = () => {
  return (
    <AppLayout>
      <PageHeader
        title="Public API"
        subtitle="Trigger NativeID automations from your e-commerce, CRM or support stack. The customer doesn't need a NativeID account."
        actions={<Button variant="outline" className="rounded-xl"><Book className="h-4 w-4 mr-1.5" />Docs</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2"><Key className="h-4 w-4 text-primary" /><h3 className="font-display font-bold">API keys</h3></div>
          <div className="rounded-xl bg-muted/40 p-4 font-mono text-xs flex items-center justify-between">
            <span>nid_live_••••••••••••••••3f9c</span>
            <Button variant="ghost" size="sm" className="rounded-lg h-7"><Copy className="h-3 w-3 mr-1" />Copy</Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Created Apr 2 · Last used 3 minutes ago · Scoped to all automations</p>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-2"><Webhook className="h-4 w-4 text-primary" /><h3 className="font-display font-bold">Webhooks</h3></div>
          <p className="text-xs text-muted-foreground mb-3">Receive events when conversations move state.</p>
          <Button variant="outline" size="sm" className="rounded-xl w-full">+ Add endpoint</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="surface-card overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" /><h3 className="font-display font-bold">Endpoints</h3>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {apiEndpoints.map(e => (
                <tr key={e.path} className="hover:bg-muted/30">
                  <td className="px-5 py-4 w-20">
                    <span className={`inline-flex items-center justify-center text-[10px] font-bold px-2 py-1 rounded ${e.method === "GET" ? "bg-info/15 text-info" : "bg-success/15 text-success"}`}>{e.method}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs">{e.path}</td>
                  <td className="px-5 py-4 text-muted-foreground text-xs">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3"><Terminal className="h-4 w-4 text-primary" /><h3 className="font-display font-bold">Quickstart</h3></div>
          <pre className="rounded-xl bg-foreground text-background p-4 text-[11px] overflow-x-auto font-mono leading-relaxed">{sampleCurl}</pre>
        </div>
      </div>

      <div className="mt-8 rounded-2xl grad-primary p-6 text-primary-foreground flex items-center justify-between flex-wrap gap-4 shadow-[var(--shadow-glow)]">
        <div>
          <h3 className="font-display font-bold text-xl">Sandbox environment</h3>
          <p className="text-sm text-primary-foreground/85">Test every endpoint with realistic payloads at nativeid.io/developers · no charge until you go live.</p>
        </div>
        <Button variant="secondary" className="rounded-xl">Open sandbox</Button>
      </div>
    </AppLayout>
  );
};

export default Api;
