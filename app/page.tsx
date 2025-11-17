"use client";
import { useUser } from "@clerk/nextjs";
import { hasPermission } from "@/lib/utils";
import { WelcomeBanner } from "../components/WelcomeBanner";
import { DashboardStats } from "@/components/DashboardStats";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="container mx-auto py-8">
      {user && (
        <WelcomeBanner />
      )}

      <DashboardStats />
      
    </div>
  );
}