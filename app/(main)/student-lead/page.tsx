"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/ui/custom-tabs";
import { StudentLeads } from "@/components/Dashboard/StudentLeads/Studentleads";
const StudentLeadPage = () => {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    if (value === "referral-partners") {
      router.push("/referral-partner");
    }
  };

  return (
    <div className="space-y-6 p-8">
      <CustomTabs
        value="student-leads"
        onValueChange={handleTabChange}
        className="w-full"
      >
        <CustomTabsList className="w-auto">
          <CustomTabsTrigger value="referral-partners">
            Referral{" "}
          </CustomTabsTrigger>
          <CustomTabsTrigger value="student-leads">Student </CustomTabsTrigger>
        </CustomTabsList>

        <CustomTabsContent value="student-leads" className="space-y-4">
          <Suspense fallback={<div>Loading...</div>}>
            <StudentLeads />
          </Suspense>
        </CustomTabsContent>
      </CustomTabs>     
    </div>
  );
};

export default StudentLeadPage;
