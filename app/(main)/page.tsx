

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/referral-partner');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg"></div>
    </div>
  );
}

