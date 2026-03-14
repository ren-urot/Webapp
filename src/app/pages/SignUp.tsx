import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, User, Check, Sparkles, Crown, Zap, ArrowLeft, ArrowRight, Loader2, Smartphone, Building2, Copy, RefreshCw, ShieldCheck } from "lucide-react";
import svgPaths from "../../imports/svg-vr1w7212pc";
import * as api from "../lib/api";
import { supabase } from "../lib/supabase";

type PlanType = "free" | "basic" | "premium";
type PaymentMethod = "gcash" | "bank";

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: typeof Sparkles;
  features: string[];
  highlight?: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free Trial",
    price: "P0",
    period: "for 14 days",
    description: "Try all features free for 14 days",
    icon: Zap,
    features: [
      "Up to 50 customers",
      "Basic POS",
      "1 user account",
      "Email support",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: "P999",
    period: "/month",
    description: "Perfect for small flower shops",
    icon: Sparkles,
    features: [
      "Up to 500 customers",
      "Full POS & inventory",
      "3 user accounts",
      "Delivery tracking",
      "Priority support",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "premium",
    name: "Premium",
    price: "P2,499",
    period: "/month",
    description: "For growing businesses",
    icon: Crown,
    features: [
      "Unlimited customers",
      "Advanced analytics",
      "Unlimited users",
      "Workshop management",
      "Delivery tracking",
      "24/7 phone support",
    ],
  },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("basic");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("gcash");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email verification state
  const [verificationCode, setVerificationCode] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [demoCode, setDemoCode] = useState("");
  const [resending, setResending] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Payment account details
  const [gcashName, setGcashName] = useState("");
  const [gcashNumber, setGcashNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  const isPaidPlan = selectedPlan !== "free";

  // If already logged in, redirect to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn("SignUp: stale session detected, staying on signup:", error.message);
        return;
      }
      if (session) {
        navigate("/", { replace: true });
      }
    });
  }, [navigate]);

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setVerificationCode(newDigits.join(""));
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || "";
    }
    setOtpDigits(newDigits);
    setVerificationCode(newDigits.join(""));
    const nextEmpty = newDigits.findIndex(d => !d);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(demoCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Step 2 submit: create account + get verification code
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions.");
      return;
    }

    // Validate payment details for paid plans
    if (isPaidPlan) {
      if (paymentMethod === "gcash") {
        if (!gcashName.trim() || !gcashNumber.trim()) {
          setError("Please fill in your GCash account details.");
          return;
        }
      } else {
        if (!bankName.trim() || !bankAccountName.trim() || !bankAccountNumber.trim()) {
          setError("Please fill in your bank account details.");
          return;
        }
      }
    }

    setLoading(true);
    try {
      console.log("Creating user account...");
      const normalizedEmail = email.trim().toLowerCase();
      const result = await api.signUp({
        fullName,
        email: normalizedEmail,
        password,
        plan: selectedPlan,
        paymentMethod: isPaidPlan ? paymentMethod : undefined,
        paymentDetails: isPaidPlan
          ? paymentMethod === "gcash"
            ? { accountName: gcashName, gcashNumber: gcashNumber }
            : { bankName: bankName, accountName: bankAccountName, accountNumber: bankAccountNumber }
          : undefined,
      });
      console.log("Account created, verification code received.");
      setDemoCode(result.verificationCode);
      setStep(3);
    } catch (err: any) {
      console.error("Signup error:", err);
      const msg = err?.message || "";
      if (msg.includes("already been registered") || msg.includes("already exists") || msg.includes("already_exists")) {
        setError("This email is already registered. Please log in instead.");
      } else {
        try {
          const jsonMatch = msg.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setError(parsed.error || "Signup failed. Please try again.");
          } else {
            setError(msg || "Signup failed. Please try again.");
          }
        } catch {
          setError("Signup failed. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3 submit: verify code
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const code = otpDigits.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await api.verifyEmail({ email: normalizedEmail, code });
      console.log("Email verified, signing in...");

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        console.error("Auto sign-in after verification failed:", signInError.message);
        setError("Email verified! But auto-login failed. Please go to Log In and sign in manually.");
        return;
      }

      if (data.session) {
        console.log("Sign-in successful, redirecting to dashboard...");
        navigate("/");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      const msg = err?.message || "";
      try {
        const jsonMatch = msg.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setError(parsed.error || "Verification failed. Please try again.");
        } else {
          setError(msg || "Verification failed. Please try again.");
        }
      } catch {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError("");
    try {
      const result = await api.resendCode(email);
      setDemoCode(result.verificationCode);
      setOtpDigits(["", "", "", "", "", ""]);
      setVerificationCode("");
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      console.error("Resend error:", err);
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const currentPlan = plans.find(p => p.id === selectedPlan)!;

  const stepLabels = ["Choose Plan", "Account Details", "Verify Email"];

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col px-6 overflow-y-auto py-8">
        <div className="w-full max-w-[540px] m-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-7 w-[130px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 111.217 24.2384">
                <g>
                  <path d={svgPaths.p35e1f00} fill="#FF4E00" />
                  <path d={svgPaths.p3f84db00} fill="#383838" />
                  <path d={svgPaths.p387e2d00} fill="#383838" />
                  <path d={svgPaths.pd3ea180} fill="#383838" />
                  <path d={svgPaths.p3e529840} fill="#383838" />
                  <path d={svgPaths.p1a2e7680} fill="#FF4E00" />
                  <path d={svgPaths.p326996f2} fill="#FF4E00" />
                  <path d={svgPaths.p3a897f80} fill="#383838" />
                  <path d={svgPaths.pc62baf0} fill="#383838" />
                  <path d={svgPaths.p11c05700} fill="#383838" />
                </g>
              </svg>
            </div>
            <div className="w-[2px] h-7 bg-[#ff4e00]" />
            <span className="text-[#383838] text-[20px] font-medium">Flowershop CRM</span>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isCompleted = step > stepNum;
              const isCurrent = step === stepNum;
              return (
                <div key={label} className="flex items-center gap-2">
                  {i > 0 && <div className="w-6 h-px bg-[#d8d8d8]" />}
                  <div className="flex items-center gap-1.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors ${
                      isCompleted ? "bg-[#e8f5e9] text-[#2e7d32]" :
                      isCurrent ? "bg-[#ff4e00] text-white" :
                      "bg-[#f0f0f0] text-[#b0b0b0]"
                    }`}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                    </div>
                    <span className={`text-[13px] font-medium hidden sm:inline ${
                      isCompleted ? "text-[#2e7d32]" :
                      isCurrent ? "text-[#383838]" :
                      "text-[#b0b0b0]"
                    }`}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ==================== STEP 1: Plan Selection ==================== */}
          {step === 1 && (
            <>
              <div className="mb-5">
                <h1 className="text-[#383838] text-[28px] font-semibold mb-1">Choose Your Plan</h1>
                <p className="text-[#9a9a9a] text-[15px]">
                  Select the plan that best fits your business needs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {plans.map(plan => {
                  const Icon = plan.icon;
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative text-left rounded-xl p-4 border-2 transition-all ${
                        isSelected
                          ? "border-[#ff4e00] bg-[#fff5f0] shadow-[0_2px_12px_rgba(255,78,0,0.12)]"
                          : "border-[#e9e9e9] bg-white hover:border-[#ffb088] hover:shadow-sm"
                      }`}
                    >
                      {plan.badge && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                          <span className="bg-[#ff4e00] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                            {plan.badge}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isSelected ? "bg-[#ff4e00]" : "bg-[#f6f6f6]"
                        }`}>
                          <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#999]"}`} />
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? "border-[#ff4e00] bg-[#ff4e00]" : "border-[#d0d0d0]"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <h3 className={`text-[16px] font-semibold mb-0.5 ${isSelected ? "text-[#ff4e00]" : "text-[#383838]"}`}>
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-[24px] font-bold text-[#383838]">{plan.price}</span>
                        <span className="text-[13px] text-[#999]">{plan.period}</span>
                      </div>
                      <p className="text-[#999] text-[12px] mb-3">{plan.description}</p>
                      <ul className="space-y-1.5">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-[#5d5d5d]">
                            <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isSelected ? "text-[#ff4e00]" : "text-[#2e7d32]"}`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-semibold text-[16px] shadow-sm"
              >
                Continue with {currentPlan.name}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-[#e0e0e0]" />
                <span className="text-[#b0b0b0] text-[13px]">or</span>
                <div className="flex-1 h-px bg-[#e0e0e0]" />
              </div>

              <p className="text-center text-[#5d5d5d] text-[15px]">
                Already have an account?{" "}
                <Link to="/login" className="text-[#ff4e00] font-semibold hover:underline">
                  Log In
                </Link>
              </p>
            </>
          )}

          {/* ==================== STEP 2: Account Details + Payment ==================== */}
          {step === 2 && (
            <>
              <div className="mb-5">
                <h1 className="text-[#383838] text-[28px] font-semibold mb-1">Create Account</h1>
                <p className="text-[#9a9a9a] text-[15px]">
                  Complete your details to get started.
                </p>
              </div>

              {/* Selected Plan Summary */}
              <div className="flex items-center justify-between bg-[#fff5f0] border border-[#ffe0c0] rounded-lg px-4 py-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ff4e00] flex items-center justify-center">
                    <currentPlan.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[#383838] text-[14px] font-semibold">{currentPlan.name} Plan</p>
                    <p className="text-[#999] text-[12px]">{currentPlan.price} {currentPlan.period}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[#ff4e00] text-[13px] font-medium hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 px-4 py-3 bg-[#fef2f2] border border-[#fca5a5] rounded-lg text-[#dc2626] text-[14px]">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#b0b0b0]" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Anderson"
                      className="w-full pl-11 pr-4 py-3 bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg text-[#383838] text-[15px] placeholder:text-[#b0b0b0] focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-colors"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#b0b0b0]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@bloomshop.com"
                      className="w-full pl-11 pr-4 py-3 bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg text-[#383838] text-[15px] placeholder:text-[#b0b0b0] focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-colors"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#b0b0b0]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full pl-11 pr-12 py-3 bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg text-[#383838] text-[15px] placeholder:text-[#b0b0b0] focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-colors"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0b0b0] hover:text-[#5d5d5d] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[#383838] text-[14px] font-medium mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#b0b0b0]" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full pl-11 pr-12 py-3 bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg text-[#383838] text-[15px] placeholder:text-[#b0b0b0] focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-colors"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0b0b0] hover:text-[#5d5d5d] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                {/* ===== Payment Method (paid plans only) ===== */}
                {isPaidPlan && (
                  <div className="pt-1">
                    <label className="block text-[#383838] text-[14px] font-medium mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* GCash */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("gcash")}
                        className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                          paymentMethod === "gcash"
                            ? "border-[#ff4e00] bg-[#fff5f0] shadow-sm"
                            : "border-[#e9e9e9] bg-white hover:border-[#ffb088]"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          paymentMethod === "gcash" ? "bg-[#007dfe]" : "bg-[#f0f0f0]"
                        }`}>
                          <Smartphone className={`w-4.5 h-4.5 ${paymentMethod === "gcash" ? "text-white" : "text-[#999]"}`} />
                        </div>
                        <div className="text-left">
                          <p className={`text-[14px] font-semibold ${paymentMethod === "gcash" ? "text-[#383838]" : "text-[#5d5d5d]"}`}>GCash</p>
                          <p className="text-[11px] text-[#999]">Mobile wallet</p>
                        </div>
                        {paymentMethod === "gcash" && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#ff4e00] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>

                      {/* Bank Transfer */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bank")}
                        className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                          paymentMethod === "bank"
                            ? "border-[#ff4e00] bg-[#fff5f0] shadow-sm"
                            : "border-[#e9e9e9] bg-white hover:border-[#ffb088]"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          paymentMethod === "bank" ? "bg-[#1a5c3a]" : "bg-[#f0f0f0]"
                        }`}>
                          <Building2 className={`w-4.5 h-4.5 ${paymentMethod === "bank" ? "text-white" : "text-[#999]"}`} />
                        </div>
                        <div className="text-left">
                          <p className={`text-[14px] font-semibold ${paymentMethod === "bank" ? "text-[#383838]" : "text-[#5d5d5d]"}`}>Bank Transfer</p>
                          <p className="text-[11px] text-[#999]">Online banking</p>
                        </div>
                        {paymentMethod === "bank" && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#ff4e00] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Payment Details Card */}
                    <div className="bg-[#f9f9f9] border border-[#e9e9e9] rounded-xl p-4">
                      {paymentMethod === "gcash" ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded bg-[#007dfe] flex items-center justify-center">
                              <Smartphone className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-[14px] font-semibold text-[#383838]">GCash Account Details</span>
                          </div>
                          <div>
                            <label className="block text-[13px] text-[#999] mb-1">Account Name</label>
                            <input
                              type="text"
                              value={gcashName}
                              onChange={(e) => setGcashName(e.target.value)}
                              placeholder="e.g. Juan Dela Cruz"
                              className="w-full px-3 py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#383838] text-[13px] placeholder:text-[#b0b0b0] focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-colors"
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <label className="block text-[13px] text-[#999] mb-1">GCash Number</label>
                            <input
                              type="text"
                              value={gcashNumber}
                              onChange={(e) => setGcashNumber(e.target.value)}
                              placeholder="e.g. 0917 123 4567"
                              className="w-full px-3 py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#383838] text-[13px] font-mono placeholder:text-[#b0b0b0] placeholder:font-sans focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-colors"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center justify-between py-1.5 border-t border-[#eeeeee]">
                            <span className="text-[13px] text-[#999]">Amount Due</span>
                            <span className="text-[14px] text-[#ff4e00] font-bold">{currentPlan.price}</span>
                          </div>
                          <p className="text-[11px] text-[#b0b0b0] pt-0.5">
                            Provide your GCash details for payment processing. Your subscription will be activated after verification.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded bg-[#1a5c3a] flex items-center justify-center">
                              <Building2 className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-[14px] font-semibold text-[#383838]">Bank Account Details</span>
                          </div>
                          <div>
                            <label className="block text-[13px] text-[#999] mb-1">Bank Name</label>
                            <input
                              type="text"
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              placeholder="e.g. BDO, BPI, Metrobank"
                              className="w-full px-3 py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#383838] text-[13px] placeholder:text-[#b0b0b0] focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-colors"
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <label className="block text-[13px] text-[#999] mb-1">Account Name</label>
                            <input
                              type="text"
                              value={bankAccountName}
                              onChange={(e) => setBankAccountName(e.target.value)}
                              placeholder="e.g. Juan Dela Cruz"
                              className="w-full px-3 py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#383838] text-[13px] placeholder:text-[#b0b0b0] focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-colors"
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <label className="block text-[13px] text-[#999] mb-1">Account Number</label>
                            <input
                              type="text"
                              value={bankAccountNumber}
                              onChange={(e) => setBankAccountNumber(e.target.value)}
                              placeholder="e.g. 0012 3456 7890"
                              className="w-full px-3 py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#383838] text-[13px] font-mono placeholder:text-[#b0b0b0] placeholder:font-sans focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-colors"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center justify-between py-1.5 border-t border-[#eeeeee]">
                            <span className="text-[13px] text-[#999]">Amount Due</span>
                            <span className="text-[14px] text-[#ff4e00] font-bold">{currentPlan.price}</span>
                          </div>
                          <p className="text-[11px] text-[#b0b0b0] pt-0.5">
                            Provide your bank details for payment processing. Your subscription will be activated after confirmation.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Terms */}
                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-[#d0d0d0] text-[#ff4e00] accent-[#ff4e00] cursor-pointer flex-shrink-0"
                  />
                  <span className="text-[#5d5d5d] text-[13px]">
                    I agree to the{" "}
                    <button type="button" className="text-[#ff4e00] font-medium hover:underline">Terms & Conditions</button>
                    {" "}and{" "}
                    <button type="button" className="text-[#ff4e00] font-medium hover:underline">Privacy Policy</button>
                  </span>
                </label>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(""); }}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-semibold text-[15px] disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-semibold text-[16px] shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-[#e0e0e0]" />
                <span className="text-[#b0b0b0] text-[13px]">or</span>
                <div className="flex-1 h-px bg-[#e0e0e0]" />
              </div>

              <p className="text-center text-[#5d5d5d] text-[15px]">
                Already have an account?{" "}
                <Link to="/login" className="text-[#ff4e00] font-semibold hover:underline">
                  Log In
                </Link>
              </p>
            </>
          )}

          {/* ==================== STEP 3: Email Verification ==================== */}
          {step === 3 && (
            <>
              <div className="mb-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#fff5f0] flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-[#ff4e00]" />
                </div>
                <h1 className="text-[#383838] text-[28px] font-semibold mb-2">Verify Your Email</h1>
                <p className="text-[#9a9a9a] text-[15px]">
                  We sent a 6-digit verification code to
                </p>
                <p className="text-[#383838] text-[15px] font-semibold mt-1">{email}</p>
              </div>

              {/* Demo: Show code since no email server */}
              {demoCode && (
                <div className="mb-5 bg-[#fef9e7] border border-[#fcd34d] rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#92400e] text-[12px] font-medium mb-0.5">Demo Mode - Verification Code</p>
                      <p className="text-[#78350f] text-[24px] font-bold font-mono tracking-[0.3em]">{demoCode}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fef3c7] hover:bg-[#fde68a] rounded-lg text-[#92400e] text-[12px] font-medium transition-colors"
                    >
                      {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {codeCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[#a16207] text-[11px] mt-1.5">
                    In production, this code would be sent to your email address.
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 px-4 py-3 bg-[#fef2f2] border border-[#fca5a5] rounded-lg text-[#dc2626] text-[14px]">
                  {error}
                </div>
              )}

              {/* OTP Input */}
              <form onSubmit={handleVerify}>
                <div className="flex justify-center gap-2.5 mb-6">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-[24px] font-bold rounded-xl border-2 transition-all focus:outline-none ${
                        digit
                          ? "border-[#ff4e00] bg-[#fff5f0] text-[#383838]"
                          : "border-[#e0e0e0] bg-[#f6f6f6] text-[#383838] focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00]"
                      }`}
                      disabled={loading}
                    />
                  ))}
                </div>

                {/* Resend */}
                <div className="text-center mb-6">
                  <p className="text-[#9a9a9a] text-[13px] mb-1">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resending}
                    className="inline-flex items-center gap-1.5 text-[#ff4e00] text-[14px] font-medium hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                    {resending ? "Resending..." : "Resend Code"}
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep(2); setError(""); setOtpDigits(["", "", "", "", "", ""]); }}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 border-[1.5px] border-[#ff4e00] text-[#ff4e00] rounded-lg hover:bg-[#fff5f0] transition-colors font-semibold text-[15px] disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otpDigits.join("").length !== 6}
                    className="flex-1 py-3.5 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-semibold text-[16px] shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Verify & Sign In
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block w-[45%] relative">
        <img
          src="https://images.unsplash.com/photo-1760102994369-14f5751fb64f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjByb3NlcyUyMGZsb3JhbCUyMGFycmFuZ2VtZW50JTIwZWxlZ2FudHxlbnwxfHx8fDE3NzMyODAxNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Orange floral arrangement"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#ff4e00]/40" />
        <div className="absolute bottom-12 left-10 right-10 text-center">
          <p className="text-white/90 text-[16px] max-w-[360px] mx-auto">
            Start managing your flowershop smarter. Set up takes less than a minute.
          </p>
        </div>
      </div>
    </div>
  );
}