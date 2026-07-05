import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      desc: "Perfect for testing the platform.",
      features: [
        "2 AI Mock Interviews / day",
        "Basic 3-dimension evaluation",
        "PDF Report downloads",
        "Email performance alerts"
      ],
      cta: "Start Free",
      popular: false,
      border: "border-white/5",
      badge: ""
    },
    {
      name: "Professional",
      price: "$29",
      desc: "For serious active job seekers.",
      features: [
        "10 AI Mock Interviews / day",
        "Full 7-dimension scoring",
        "Visual timeline & filler-word check",
        "ATS resume scanning & suggestion",
        "Personalized career roadmaps",
        "AI job role matching recommendations"
      ],
      cta: "Upgrade to Pro",
      popular: true,
      border: "border-violet-500/40 relative",
      badge: "bg-violet-600 text-white font-bold"
    },
    {
      name: "Enterprise",
      price: "$99",
      desc: "Custom solutions for teams & colleges.",
      features: [
        "Unlimited mock interviews",
        "Custom question sets & bank uploads",
        "Admin leaderboard tracking",
        "API integration endpoints",
        "24/7 dedicated support representative"
      ],
      cta: "Contact Sales",
      popular: false,
      border: "border-white/5",
      badge: ""
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-[#0b0c16]/30 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400">
            Choose the plan that matches your current career preparation pace.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`glass p-8 rounded-2xl border flex flex-col justify-between hover:shadow-xl hover:border-white/10 transition-all duration-300 ${p.border}`}
            >
              {p.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold tracking-wider bg-violet-600 text-white shadow-lg uppercase">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{p.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-white">{p.price}</span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>

                {/* Features list */}
                <ul className="space-y-3 pt-6 border-t border-white/5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                {p.name === "Enterprise" ? (
                  <Button variant="outline" className="w-full">
                    {p.cta}
                  </Button>
                ) : (
                  <Link to="/register">
                    <Button className="w-full" variant={p.popular ? "default" : "outline"}>
                      {p.cta}
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
