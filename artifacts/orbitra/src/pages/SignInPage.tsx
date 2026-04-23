import { SignIn } from "@clerk/react";

export default function SignInPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="relative">
        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
        <SignIn 
          routing="path" 
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          forceRedirectUrl={`${basePath}/dashboard`}
        />
      </div>
    </div>
  );
}
