// import { Navbar } from "@/components/Home/navbar/navbar";
// import { Toaster } from "@/components/ui/sonner";
// import { ErrorBoundary } from "@/components/ui/error-boundary";

// interface AppLayoutProps {
//   children: React.ReactNode;
// }

// export function AppLayout({ children }: AppLayoutProps) {
//   return (
//     <ErrorBoundary>
//       <div className="min-h-screen bg-background">
//         <Navbar />
//         <main className="flex-1">{children}</main>
//         <Toaster 
//           position="top-center"
//           toastOptions={{
//             className: 'border-2 border-border shadow-xl rounded-lg text-base',
//             duration: 4000,
//             style: {
//               background: 'var(--background)',
//               color: 'var(--foreground)',
//               boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
//               padding: '16px 20px',
//               minWidth: '350px',
//               maxWidth: '500px'
//             },
//           }}
//           richColors
//           expand
//           gap={12}
//         />
//       </div>
//     </ErrorBoundary>
//   );
// }


"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Dashboard/sidebar/app-sidebar";
import { DashboardNavbar } from "@/components/Dashboard/sidebarNavbar/dashboard-navbar";
import { Toaster } from "@/components/ui/sonner";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {


  return (
      <SidebarProvider>
        {/* <AppSidebar /> */}
        <SidebarInset>
          {/* <DashboardNavbar /> */}
           <Toaster 
            position="top-center"
            toastOptions={{
              className: 'border-2 border-border shadow-xl rounded-lg text-lg',
              duration: 4000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                padding: '20px 24px',
                minWidth: '400px',
                maxWidth: '600px'
              },
            }}
            richColors
            expand
            gap={12}
           />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
         
        </SidebarInset>
      </SidebarProvider>
  );
}

