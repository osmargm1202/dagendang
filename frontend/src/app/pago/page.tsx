"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("mensual");
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    // Simulate API call to subscribe
    const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login?redirect=/pago");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/subscriptions/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ plan: selectedPlan })
      });

      if (res.ok) {
        alert("¡Gracias por suscribirte! Ahora tienes acceso premium.");
        router.push("/");
      } else {
        alert("Hubo un error en el proceso. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Elige tu Plan Premium</h1>
        <p className="text-muted-foreground">Acceso ilimitado a análisis económicos exclusivos, sin anuncios y alertas prioritarias.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Plan Mensual */}
        <div 
          onClick={() => setSelectedPlan("mensual")}
          className={`cursor-pointer p-8 border-2 rounded-xl transition-all ${selectedPlan === "mensual" ? "border-dr-blue bg-dr-blue/5" : "border-border hover:border-dr-blue/50"}`}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-xl uppercase tracking-wider">Mensual</h3>
            {selectedPlan === "mensual" && <span className="bg-dr-blue text-white p-1 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></span>}
          </div>
          <div className="text-3xl font-bold mb-2">RD$ 495<span className="text-sm font-normal text-muted-foreground">/mes</span></div>
          <p className="text-sm text-muted-foreground mb-6">Ideal para estar al día con la actualidad económica dominicana.</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><span className="text-dr-blue">✓</span> Acceso ilimitado a notas premium</li>
            <li className="flex items-center gap-2"><span className="text-dr-blue">✓</span> Sin publicidad intrusiva</li>
            <li className="flex items-center gap-2"><span className="text-dr-blue">✓</span> Reportes PDF semanales</li>
          </ul>
        </div>

        {/* Plan Anual */}
        <div 
          onClick={() => setSelectedPlan("anual")}
          className={`relative cursor-pointer p-8 border-2 rounded-xl transition-all ${selectedPlan === "anual" ? "border-dr-blue bg-dr-blue/5" : "border-border hover:border-dr-blue/50"}`}
        >
          <div className="absolute top-0 right-0 bg-dr-red text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl rounded-tr-lg uppercase tracking-tighter">Ahorra 20%</div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-xl uppercase tracking-wider">Anual</h3>
            {selectedPlan === "anual" && <span className="bg-dr-blue text-white p-1 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></span>}
          </div>
          <div className="text-3xl font-bold mb-2">RD$ 4,750<span className="text-sm font-normal text-muted-foreground">/año</span></div>
          <p className="text-sm text-muted-foreground mb-6">La mejor opción para profesionales y tomadores de decisiones.</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><span className="text-dr-blue">✓</span> Todo lo del plan mensual</li>
            <li className="flex items-center gap-2"><span className="text-dr-red font-bold">✓</span> Alertas de mercado prioritarias</li>
            <li className="flex items-center gap-2"><span className="text-dr-red font-bold">✓</span> Soporte personalizado</li>
          </ul>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <button 
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 bg-dr-blue text-white font-bold rounded-sm shadow-xl hover:translate-y-[-2px] transition active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 uppercase tracking-widest"
        >
          {loading ? "Procesando..." : "Proceder al Pago"}
        </button>
        <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-widest">
          Pago seguro cifrado con tecnología SSL
        </p>
      </div>
    </div>
  );
}
