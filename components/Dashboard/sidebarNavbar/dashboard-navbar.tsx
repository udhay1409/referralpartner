"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem, 
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { ModeToggle } from "@/components/ui/mode-toggle";




// User data will be loaded from localStorage

function generateBreadcrumbs(pathname: string) {
  const pathSegments = pathname.split("/").filter(Boolean);
  const pathChain = [];

  // Always start with Home if we're in a sub-route
  if (pathSegments.length > 0) {
    pathChain.push({
      title: "Home",
      href: "/referral-partner",
      isLast: false,
    });

    // Handle referral-partner routes
    if (pathSegments[0] === "referral-partner") {
      pathChain.push({
        title: "Referral Partners",
        href: "/referral-partner",
        isLast: pathSegments.length === 1,
      });

      if (pathSegments.length > 1) {
        // Individual partner page
        pathChain.push({
          title: "Partner Details",
          href: pathname,
          isLast: true,
        });
      }
    }

    // Handle student-lead routes
    if (pathSegments[0] === "student-lead") {
      pathChain.push({
        title: "Student Leads",
        href: "/student-lead",
        isLast: true,
      });
    }
  }

  return pathChain;
}

export function DashboardNavbar() {
  const pathname = usePathname();

  const breadcrumbs = generateBreadcrumbs(pathname);
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
      <div className="flex items-center gap-2 px-4 flex-1">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* Dynamic Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <div
                key={`breadcrumb-${index}-${breadcrumb.href}`}
                className="flex items-center"
              >
                {index > 0 && (
                  <BreadcrumbSeparator className="mx-2 text-muted-foreground">
                    &gt;
                  </BreadcrumbSeparator>
                )}
                <BreadcrumbItem>
                  {breadcrumb.isLast ? (
                    <BreadcrumbPage className="font-semibold text-foreground">
                      {breadcrumb.title}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={breadcrumb.href}
                        className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                      >
                        {breadcrumb.title}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side - Mode Toggle and User Menu */}
      <div className="flex items-center gap-2 px-4">
        {/* Notifications */}
        {/* <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button> */}

        {/* Mode Toggle */}
        <ModeToggle />

        {/* User Avatar Dropdown */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback className="text-xs">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "Loading..."}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
    </header>
  );
}
