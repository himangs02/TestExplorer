import { Suspense } from "react";
import SignupForm from "@/components/auth/SignupForm";
import { Loader2 } from "lucide-react";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectTo = (params.callbackUrl || params.redirectTo || params.redirect) as string | undefined;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    }>
      <SignupForm school={null} redirectTo={redirectTo} />
    </Suspense>
  );
}
