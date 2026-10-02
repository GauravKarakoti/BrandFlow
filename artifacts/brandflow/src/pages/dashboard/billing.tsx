import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Sparkles, Zap } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for solo creators and small brands.",
    features: [
      "Up to 3 social profiles",
      "50 AI generations / month",
      "Basic analytics",
      "Standard support"
    ],
    popular: false,
    current: true
  },
  {
    name: "Pro",
    price: "$99",
    description: "For growing marketing teams and agencies.",
    features: [
      "Up to 10 social profiles",
      "Unlimited AI generations",
      "Advanced trend analytics",
      "Team collaboration (3 seats)",
      "Priority support"
    ],
    popular: true,
    current: false
  },
  {
    name: "Enterprise",
    price: "$299",
    description: "Custom solutions for large organizations.",
    features: [
      "Unlimited social profiles",
      "Custom AI model training",
      "API access",
      "Unlimited team seats",
      "Dedicated success manager"
    ],
    popular: false,
    current: false
  }
];

export default function DashboardBilling() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-violet-400" /> Billing & Plans
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Manage your subscription and usage limits</p>
        </div>
      </div>

      <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80 mb-8">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Current Plan: <span className="text-violet-400 font-bold">Starter</span></h3>
              <p className="text-sm text-zinc-400">You've used 32 of 50 AI generations this month.</p>
            </div>
          </div>
          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-zinc-400">Usage</span>
              <span className="text-white font-medium">64%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div className="bg-violet-500 h-2 rounded-full" style={{ width: '64%' }}></div>
            </div>
          </div>
          <Button className="w-full md:w-auto bg-white text-black hover:bg-zinc-200">
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative glass-panel bg-[#0A0A0F]/80 flex flex-col ${plan.popular ? 'border-violet-500 shadow-[0_0_30px_rgba(124,58,237,0.15)]' : 'border-white/5'}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-600 text-white text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
              <CardDescription className="text-zinc-400 min-h-[40px]">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-zinc-500">/mo</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-violet-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full ${plan.current ? 'bg-white/5 text-white hover:bg-white/10' : plan.popular ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}