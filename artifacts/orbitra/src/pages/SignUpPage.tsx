import { SignUp } from "@clerk/react";

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
        />
      </div>
    </div>
  );
}
