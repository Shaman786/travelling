import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Host-Palace Admin",
  description: "Sign in to the Host-Palace App Admin Dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
