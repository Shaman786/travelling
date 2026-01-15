"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { account, DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication & role on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await account.get();
        // Check Admin Role in Database
        try {
          const userDoc = await databases.getDocument(
            DATABASE_ID,
            TABLES.USERS,
            user.$id,
          );
          if (userDoc.role !== "admin") {
            console.log("User is not an admin");
            // Optional: redirect to a "Not Authorized" page or just home/signin
            router.replace("/"); // or /unauthorized
            return;
          }
          setIsAuthenticated(true);
        } catch (dbError: any) {
          if (dbError.code === 404) {
            // User document missing, try to create it (First-time admin login)
            try {
              await databases.createDocument(
                DATABASE_ID,
                TABLES.USERS,
                user.$id,
                {
                  name: user.name,
                  email: user.email,
                  role: "admin",
                },
              );
              setIsAuthenticated(true);
              return;
            } catch (createError: any) {
              if (createError.code === 409) {
                // Document already exists (race condition or previous partial success), so we are good.
                setIsAuthenticated(true);
              } else {
                console.error("Failed to create admin user doc:", createError);
                router.replace("/signin");
              }
            }
          } else {
            console.error("Error fetching user role:", dbError);
            router.replace("/signin");
          }
        }
      } catch (error) {
        console.log("Not authenticated, redirecting to signin");
        router.replace("/signin");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-brand-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
