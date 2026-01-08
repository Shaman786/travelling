import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Travelling Admin",
  description: "Sign in to the Travelling App Admin Dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
