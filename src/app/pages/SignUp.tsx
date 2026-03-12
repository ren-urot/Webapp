import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import svgPaths from "../../imports/svg-vr1w7212pc";

export default function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
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

    // Navigate to login on successful sign up
    navigate("/login");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[440px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
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

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-[#383838] text-[28px] font-semibold mb-1">Create Account</h1>
            <p className="text-[#9a9a9a] text-[15px]">
              Get started with your Flowershop CRM account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-[#fef2f2] border border-[#fca5a5] rounded-lg text-[#dc2626] text-[14px]">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-semibold text-[16px] shadow-sm"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-[#e0e0e0]" />
            <span className="text-[#b0b0b0] text-[13px]">or</span>
            <div className="flex-1 h-px bg-[#e0e0e0]" />
          </div>

          {/* Log In Link */}
          <p className="text-center text-[#5d5d5d] text-[15px]">
            Already have an account?{" "}
            <Link to="/login" className="text-[#ff4e00] font-semibold hover:underline">
              Log In
            </Link>
          </p>
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
          <h2 className="text-white text-[32px] font-semibold mb-2">
            Join Bloom Today
          </h2>
          <p className="text-white/90 text-[16px] max-w-[360px]">
            Start managing your flowershop smarter. Set up takes less than a minute.
          </p>
        </div>
      </div>
    </div>
  );
}