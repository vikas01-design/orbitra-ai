import { SignIn } from "@clerk/react";

const clerkAppearance = {
  variables: {
    colorBackground: "#ffffff",
    colorText: "#1e293b",
    colorTextSecondary: "#64748b",
    colorTextOnPrimaryBackground: "#ffffff",
    colorPrimary: "#0891b2",
    colorInputBackground: "#f8fafc",
    colorInputText: "#1e293b",
    colorNeutral: "#64748b",
    colorDanger: "#e11d48",
    fontFamily: "'Poppins', sans-serif",
    borderRadius: "12px",
  },
  elements: {
    card: "bg-white border border-slate-200 shadow-[0_8px_40px_rgba(150,165,210,0.25)]",
    headerTitle: "text-slate-800",
    headerSubtitle: "text-slate-500",
    socialButtonsBlockButton: "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100",
    socialButtonsBlockButtonText: "text-slate-700",
    dividerLine: "bg-slate-200",
    dividerText: "text-slate-400",
    formFieldLabel: "text-slate-700",
    formFieldInput: "bg-slate-50 border border-slate-200 text-slate-800",
    formButtonPrimary: "bg-cyan-500 text-white hover:bg-cyan-400",
    footerActionText: "text-slate-500",
    footerActionLink: "text-cyan-600 hover:text-cyan-700",
    identityPreviewText: "text-slate-700",
    identityPreviewEditButton: "text-cyan-600",
    formFieldInputShowPasswordButton: "text-slate-400",
    otpCodeFieldInput: "bg-slate-50 text-slate-800 border-slate-200",
  },
};

export default function SignInPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="relative">
        <div className="absolute -inset-4 bg-cyan-100/60 blur-3xl rounded-full" />
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          forceRedirectUrl={`${basePath}/dashboard`}
          appearance={clerkAppearance}
        />
      </div>
    </div>
  );
}
