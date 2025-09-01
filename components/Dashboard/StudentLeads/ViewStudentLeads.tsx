"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Phone, User, GraduationCap, Globe, IndianRupee, FileText } from "lucide-react";

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

interface ReferralPartner {
  _id: string;
  name: string;
}

interface ViewStudentLeadsProps {
  isOpen: boolean;
  onClose: () => void;
  studentLead: StudentLead | null;
  referralPartners: ReferralPartner[];
}

export const ViewStudentLeads: React.FC<ViewStudentLeadsProps> = ({
  isOpen,
  onClose,
  studentLead,
  referralPartners,
}) => {
  if (!studentLead) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "New": return "secondary";
      case "In Progress": return "default";
      case "Applied": return "outline";
      case "Admitted": return "default";
      case "Rejected": return "destructive";
      default: return "secondary";
    }
  };

  const getCommissionStatusBadgeVariant = (status: string) => {
    return status === "Paid" ? "default" : "secondary";
  };

  // Get referral partner name
  const getReferralPartnerName = () => {
    if (!studentLead.referralPartner) return "N/A";

    const partner = referralPartners.find(p => p._id === studentLead.referralPartner);
    return partner?.name || "N/A";
  }

  const referralPartnerName = getReferralPartnerName();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-none w-[95vw] max-h-[95vh] overflow-y-auto"
        style={{ maxWidth: '95vw', width: '65vw' }}
      >
        <DialogHeader className="pb-6 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#1A73E8] rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <span>{studentLead.name}</span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Student Lead Details
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          {/* Status Header */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <Badge variant={getStatusBadgeVariant(studentLead.status)} className="text-sm mt-1">
                  {studentLead.status}
                </Badge>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <p className="text-sm text-muted-foreground">Commission</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-semibold text-lg">₹{studentLead.commissionAmount.toFixed(2)}</span>
                  <Badge variant={getCommissionStatusBadgeVariant(studentLead.commissionStatus)} className="text-xs">
                    {studentLead.commissionStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
         

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Personal Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium text-gray-900">{studentLead.name}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="font-medium text-gray-900 break-all">{studentLead.email}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium text-gray-900">{studentLead.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Academic Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <GraduationCap className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Course Applied</p>
                    <p className="font-medium text-gray-900">{studentLead.courseApplied}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Country Preference</p>
                    <p className="font-medium text-gray-900">{studentLead.countryPreference}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Application Status</p>
                    <Badge variant={getStatusBadgeVariant(studentLead.status)} className="mt-1">
                      {studentLead.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Partner & Financial */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Partner & Commission
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Referral Partner</p>
                    <p className="font-medium text-gray-900">{referralPartnerName}</p>
                    
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <IndianRupee className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Commission Amount</p>
                    <p className="font-semibold text-xl text-green-600">
                      ₹{studentLead.commissionAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <Badge 
                      variant={getCommissionStatusBadgeVariant(studentLead.commissionStatus)} 
                      className="mt-1"
                    >
                      {studentLead.commissionStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

        
          {/* Description */}
          {studentLead.description && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Description & Notes</span>
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {studentLead.description}
                </p>
              </div>
            </div>
          )}

  {/* Progress Timeline */}
  <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Application Progress</span>
            </h3>
            <div className="w-full">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${studentLead.status === "New" ? "bg-blue-500" : "bg-gray-300"}`}>
                    {studentLead.status === "New" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-sm font-medium ${studentLead.status === "New" ? "text-blue-600" : "text-gray-500"}`}>
                    New Lead
                  </span>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${["In Progress", "Applied", "Admitted"].includes(studentLead.status) ? "bg-yellow-500" : "bg-gray-300"}`}>
                    {["In Progress", "Applied", "Admitted"].includes(studentLead.status) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-sm font-medium ${["In Progress", "Applied", "Admitted"].includes(studentLead.status) ? "text-yellow-600" : "text-gray-500"}`}>
                    In Progress
                  </span>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${["Applied", "Admitted"].includes(studentLead.status) ? "bg-purple-500" : "bg-gray-300"}`}>
                    {["Applied", "Admitted"].includes(studentLead.status) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-sm font-medium ${["Applied", "Admitted"].includes(studentLead.status) ? "text-purple-600" : "text-gray-500"}`}>
                    Applied
                  </span>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${studentLead.status === "Admitted" ? "bg-green-500" : studentLead.status === "Rejected" ? "bg-red-500" : "bg-gray-300"}`}>
                    {(studentLead.status === "Admitted" || studentLead.status === "Rejected") && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-sm font-medium ${studentLead.status === "Admitted" ? "text-green-600" : studentLead.status === "Rejected" ? "text-red-600" : "text-gray-500"}`}>
                    {studentLead.status === "Rejected" ? "Rejected" : "Admitted"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
        
      
       
