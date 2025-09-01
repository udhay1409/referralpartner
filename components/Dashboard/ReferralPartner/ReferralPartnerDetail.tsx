"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Users,
  IndianRupee ,
  TrendingUp,
  Search,
  Eye,
  Edit,
  Trash2,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { ViewStudentLeads } from "../StudentLeads/ViewStudentLeads";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface ReferralPartner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  district: string;
  country: string;
  pincode: string;
  partnerType: "Agency" | "Individual";
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}

interface StudentLead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  courseApplied: string;
  countryPreference: string;
  status: "New" | "In Progress" | "Applied" | "Admitted" | "Rejected";
  description?: string;
  referralPartner: string;
  commissionAmount: number;
  commissionStatus: "Pending" | "Paid";
  createdAt: string;
  updatedAt: string;
}

interface Statistics {
  totalLeads: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
  statusBreakdown: {
    New: number;
    "In Progress": number;
    Applied: number;
    Admitted: number;
    Rejected: number;
  };
}

export const ReferralPartnerDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState<ReferralPartner | null>(null);
  const [studentLeads, setStudentLeads] = useState<StudentLead[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalLeads: 0,
    totalCommission: 0,
    paidCommission: 0,
    pendingCommission: 0,
    statusBreakdown: {
      New: 0,
      "In Progress": 0,
      Applied: 0,
      Admitted: 0,
      Rejected: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<StudentLead | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch partner details
  const fetchPartner = useCallback(async () => {
    try {
      const response = await axios.get(`/api/referralpartner/${params.id}`);
      const data = response.data;

      if (data.success) {
        setPartner(data.data);
      } else {
        console.error("Partner not found");
        router.push("/referral-partner");
      }
    } catch (error: unknown) {
      console.error("Error fetching partner:", error);
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("Failed to fetch partner details");
      }
      router.push("/referral-partner");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  // Fetch student leads for this partner
  const fetchStudentLeads = useCallback(async (page = 1, search = "") => {
    try {
      setLeadsLoading(true);
      const response = await axios.get(
        `/api/studentleads?page=${page}&limit=10&search=${search}&referralPartnerId=${params.id}`
      );
      const data = response.data;

      if (data.success) {
        setStudentLeads(data.data);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.page);
        calculateStatistics(data.data);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("Failed to fetch student leads");
      }
      console.error("Error fetching student leads:", error);
    } finally {
      setLeadsLoading(false);
    }
  }, [params.id]);

  // Calculate statistics from student leads
  const calculateStatistics = (leads: StudentLead[]) => {
    const stats: Statistics = {
      totalLeads: leads.length,
      totalCommission: 0,
      paidCommission: 0,
      pendingCommission: 0,
      statusBreakdown: {
        New: 0,
        "In Progress": 0,
        Applied: 0,
        Admitted: 0,
        Rejected: 0,
      },
    };

    leads.forEach((lead) => {
      stats.totalCommission += lead.commissionAmount;
      if (lead.commissionStatus === "Paid") {
        stats.paidCommission += lead.commissionAmount;
      } else {
        stats.pendingCommission += lead.commissionAmount;
      }
      stats.statusBreakdown[lead.status]++;
    });

    setStatistics(stats);
  };

  useEffect(() => {
    if (params.id) {
      fetchPartner();
    }
  }, [params.id, fetchPartner]);

  useEffect(() => {
    if (params.id) {
      fetchStudentLeads(currentPage, searchTerm);
    }
  }, [params.id, currentPage, searchTerm, fetchStudentLeads]);

  // Helper functions
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewLead = (lead: StudentLead) => {
    setViewingLead(lead);
    setIsViewDialogOpen(true);
  };

  const handleDeleteLead = (id: string, name: string) => {
    setLeadToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;

    try {
      const response = await axios.delete(
        `/api/studentleads/${leadToDelete.id}`
      );
      const result = response.data;

      if (result.success) {
        toast.success("Student lead deleted successfully!");
        fetchStudentLeads(currentPage, searchTerm);
        setIsDeleteDialogOpen(false);
        setLeadToDelete(null);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Error deleting student lead:", error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "New":
        return "secondary";
      case "In Progress":
        return "default";
      case "Applied":
        return "outline";
      case "Admitted":
        return "default";
      case "Rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getCommissionStatusBadgeVariant = (status: string) => {
    return status === "Paid" ? "default" : "secondary";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Partner not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{partner.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{partner.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{partner.phone}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{partner.address}</p>
                <p className="text-sm text-muted-foreground">
                  {partner.city}, {partner.district}, {partner.state}
                </p>
                <p className="text-sm text-muted-foreground">
                  {partner.country} - {partner.pincode}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partner Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Partner Type</p>
              <Badge
               className={
                            partner.partnerType === "Agency"
                              ? "bg-[#1A73E8] text-white"
                              : ""
                          }
                variant={
                  partner.partnerType === "Agency" ? "default" : "secondary"
                }
              >
                {partner.partnerType}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={
                  partner.status === "Active" ? "default" : "destructive"
                }
                 className={
                            partner.partnerType === "Agency"
                              ? "bg-[#1A73E8] text-white"
                              : ""
                          }
              >
                {partner.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">
                {new Date(partner.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {new Date(partner.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{statistics.totalLeads}</p>
                <p className="text-sm text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <IndianRupee  className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                ₹{statistics.totalCommission.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Commission
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                ₹{statistics.paidCommission.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Paid Commission</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <IndianRupee  className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                ₹{statistics.pendingCommission.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Pending Commission
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statistics.statusBreakdown).map(
              ([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <Badge
                    variant={getStatusBadgeVariant(status)}
                    className={`mt-1${status === "Admitted" || status === "In Progress" ? " bg-[#1A73E8] text-white" : ""}`}
                  >
                    {status}
                  </Badge>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span>Student Leads</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student leads..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          
          </div>

          {leadsLoading ? (
            <div className="text-center py-8">Loading student leads...</div>
          ) : studentLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No student leads found for this partner.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentLeads.map((lead) => (
                    <TableRow key={lead._id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.courseApplied}</TableCell>
                      <TableCell>{lead.countryPreference}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex grid-cols-2 gap-1">
                          <span className="text-sm font-medium">
                          ₹{lead.commissionAmount}
                          </span>
                          <Badge
                            variant={getCommissionStatusBadgeVariant(
                              lead.commissionStatus
                            )}
                            className="text-xs"
                          >
                            {lead.commissionStatus}
                          </Badge>
                        </div>
                      </TableCell>
                     
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewLead(lead)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Store the lead data in sessionStorage for the edit modal
                              sessionStorage.setItem(
                                "editStudentLead",
                                JSON.stringify(lead)
                              );
                              router.push("/student-lead?action=edit");
                            }}
                            title="Edit Lead"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteLead(lead._id, lead.name)
                            }
                            title="Delete Lead"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Student Lead Modal */}
      <ViewStudentLeads
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setViewingLead(null);
        }}
        studentLead={viewingLead}
        referralPartners={partner ? [partner] : []}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              student lead for{" "}
              <span className="font-semibold">{leadToDelete?.name}</span> and
              remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setLeadToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLead}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Student Lead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
