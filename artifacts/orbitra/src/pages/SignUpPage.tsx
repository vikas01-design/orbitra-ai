import { SignUp } from "@clerk/react";

const clerkAppearance = {
  variables: {
    colorBackground: "#0b0b22",
    colorText: "#ffffff",
    colorTextSecondary: "#cbd5f5",
    colorTextOnPrimaryBackground: "#0b0b22",
    colorPrimary: "#a855f7",
    colorInputBackground: "#15153a",
    colorInputText: "#ffffff",
    colorNeutral: "#ffffff",
    colorDanger: "#ff4d6d",
    fontFamily: "'Space Grotesk', sans-serif",
    borderRadius: "12px",
  },
  elements: {
    card: "bg-[#0b0b22]/90 border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.18)]",
    headerTitle: "text-white",
    headerSubtitle: "text-slate-300",
    socialButtonsBlockButton: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
    socialButtonsBlockButtonText: "text-white",
    dividerLine: "bg-white/10",
    dividerText: "text-slate-400",
    formFieldLabel: "text-white",
    formFieldInput: "bg-[#15153a] border border-white/10 text-white",
    formButtonPrimary: "bg-violet-500 text-white hover:bg-violet-400",
    footerActionText: "text-slate-300",
    footerActionLink: "text-cyan-300 hover:text-cyan-200",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-cyan-300",
    formFieldInputShowPasswordButton: "text-slate-300",
    otpCodeFieldInput: "bg-[#15153a] text-white border-white/10",
  },
};

export default function SignUpPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="relative">
        <div className="absolute -inset-4 bg-secondary/20 blur-3xl rounded-full" />
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          forceRedirectUrl={`${basePath}/dashboard`}
          appearance={clerkAppearance}
        />
      </div>
    </div>
  );
}
