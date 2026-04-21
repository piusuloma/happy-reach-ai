import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { stockNotifications } from "@/data/mock";
import { StatusPill } from "@/components/StatusPill";
import { Boxes, Bell, Send, Package, ShoppingBag } from "lucide-react";

const Stock = () => {
  const totalWaiting = stockNotifications.reduce((a, p) => a + p.waiting, 0);

  return (
    <AppLayout>
      <PageHeader
        title="Back-in-Stock Notifications"
        subtitle="When a customer asks about an out-of-stock item, the bot offers to notify them. The moment you restock, everyone on the list gets a verified WhatsApp message."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="surface-card p-5">
          <Boxes className="h-5 w-5 text-warning mb-2" />
          <div className="text-2xl font-bold font-display tabular-nums">{stockNotifications.filter(p => p.status === 'out_of_stock').length}</div>
          <div className="text-xs text-muted-foreground">Out of stock</div>
        </div>
        <div className="surface-card p-5">
          <Bell className="h-5 w-5 text-info mb-2" />
          <div className="text-2xl font-bold font-display tabular-nums">{totalWaiting}</div>
          <div className="text-xs text-muted-foreground">Customers waiting</div>
        </div>
        <div className="surface-card p-5">
          <ShoppingBag className="h-5 w-5 text-success mb-2" />
          <div className="text-2xl font-bold font-display tabular-nums text-success">68%</div>
          <div className="text-xs text-muted-foreground">Restock → order conversion</div>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-bold">Products with notification lists</h3>
          <Button variant="outline" className="rounded-xl"><Package className="h-4 w-4 mr-1.5" />Sync inventory</Button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-5 py-3">Product</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
              <th className="text-right font-medium px-5 py-3">Waiting</th>
              <th className="text-right font-medium px-5 py-3">Last restock</th>
              <th className="text-right font-medium px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stockNotifications.map(p => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-5 py-4">
                  <div className="font-medium">{p.product}</div>
                  <div className="text-xs text-muted-foreground">{p.price}</div>
                </td>
                <td className="px-5 py-4"><StatusPill status={p.status} /></td>
                <td className="px-5 py-4 text-right">
                  <span className="font-semibold tabular-nums">{p.waiting}</span>
                  {p.waiting > 0 && <div className="text-[10px] text-muted-foreground">customers</div>}
                </td>
                <td className="px-5 py-4 text-right text-muted-foreground">{p.lastRestock}</td>
                <td className="px-5 py-4 text-right">
                  {p.status === "out_of_stock" && p.waiting > 0 ? (
                    <Button size="sm" className="rounded-lg grad-primary text-primary-foreground border-0"><Send className="h-3.5 w-3.5 mr-1" />Mark in stock & notify</Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="rounded-lg">Manage list</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

export default Stock;
