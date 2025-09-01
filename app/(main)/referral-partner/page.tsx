"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ReferralPartner } from '@/components/Dashboard/ReferralPartner/ReferralPartner';
import { CustomTabs, CustomTabsContent, CustomTabsList, CustomTabsTrigger } from '@/components/ui/custom-tabs';

const ReferralPartnerPage = () => {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    if (value === 'student-leads') {
      router.push('/student-lead');
    }
  };

  return (
    <div className="space-y-6 p-8">
      

      <CustomTabs value="referral-partners" onValueChange={handleTabChange} className="w-full">
        <CustomTabsList className="w-auto">
          <CustomTabsTrigger value="referral-partners">Referral </CustomTabsTrigger>
          <CustomTabsTrigger value="student-leads">Student</CustomTabsTrigger>
        </CustomTabsList>

        <CustomTabsContent value="referral-partners" className="space-y-4">
          <ReferralPartner />
        </CustomTabsContent>
      </CustomTabs>
    </div>
  );
};

export default ReferralPartnerPage;