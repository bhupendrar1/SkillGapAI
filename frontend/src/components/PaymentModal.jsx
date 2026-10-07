import React, { useState } from 'react';
import { X, CreditCard, Check, Sparkles, ShieldCheck, Loader2, Zap } from 'lucide-react';
import { checkoutSubscription } from '../services/api';

export default function PaymentModal({ isOpen, onClose, onUpgradeSuccess, currentPlan }) {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expDate, setExpDate] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [isLoading, setIsLoading] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Academic Free',
      price: '$0',
      period: 'forever',
      features: [
        'Core 7-step Explainable AI pipeline',
        'Standard PDF resume parsing',
        'Baseline threshold gap detection',
        'Standard curriculum recommendations'
      ],
      isPopular: false
    },
    {
      id: 'pro',
      name: 'Researcher Pro',
      price: '$19',
      period: 'per month',
      features: [
        'Unlimited AI Resume & Job Analyses',
        'AI Career Coach & Skill Chatbot Assistant',
        'Traceable Evidence Context Drawer',
        'Full Saved Analysis History & Profiles',
        'Priority Transformer Embedding Speed'
      ],
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'University Lab',
      price: '$49',
      period: 'per month',
      features: [
        'Multi-seat Viva Reviewer Access',
        'Custom ESCO Skill Taxonomy Upload',
        'Threshold Sensitivity & Ablation Testing',
        'Bulk Candidate PDF Analysis'
      ],
      isPopular: false
    }
  ];

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const planObj = plans.find((p) => p.id === selectedPlan);
    const amount = selectedPlan === 'pro' ? 19.0 : selectedPlan === 'enterprise' ? 49.0 : 0.0;

    const res = await checkoutSubscription({
      plan_name: planObj?.name || 'Researcher Pro',
      amount,
      card_last4: cardNumber.replace(/\D/g, '').slice(-4) || '4242',
      payment_method: 'card'
    });

    setIsLoading(false);

    if (res.success) {
      setSuccessReceipt(res.data.transaction);
      if (onUpgradeSuccess) onUpgradeSuccess('pro');
    } else {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {successReceipt ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              Subscription Activated!
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your account has been upgraded to <strong>{successReceipt.plan_name}</strong>. You now have unlimited analyses, AI career coaching, and complete historical traces.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left font-mono text-xs max-w-sm mx-auto space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-bold text-slate-800">{successReceipt.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold text-slate-800">${successReceipt.amount} USD</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-emerald-700 font-bold uppercase">{successReceipt.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Card:</span>
                <span>Ending in •••• {successReceipt.card_last4}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors cursor-pointer shadow-md shadow-blue-500/20"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Subscription & Pro Upgrade</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Upgrade Your Research Plan
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Unlock full AI Coach guidance, unlimited analysis history, and exportable dissertation reports.
              </p>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {plans.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/20 shadow-xs ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {p.isPopular && (
                      <span className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                        Most Popular
                      </span>
                    )}

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                      <div className="mt-2 mb-3">
                        <span className="text-2xl font-extrabold text-slate-900 font-mono">{p.price}</span>
                        <span className="text-[11px] text-slate-500 ml-1">/{p.period}</span>
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-slate-600">
                        {p.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className={`w-full py-1.5 text-center rounded-lg text-xs font-semibold ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isSelected ? 'Selected' : 'Select Plan'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mock Checkout Form */}
            <form onSubmit={handleCheckout} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Mock Payment Simulation (Sandboxed)
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono font-bold">
                  Test Gateway Active
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Expires</label>
                  <input
                    type="text"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">CVC / CVV</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md shadow-blue-500/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <span>
                    Confirm Upgrade ({selectedPlan === 'pro' ? '$19/mo' : selectedPlan === 'enterprise' ? '$49/mo' : '$0'})
                  </span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

