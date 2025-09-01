"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


import {  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


import {  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Eye, Edit, Trash2, Edit2, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { ViewStudentLeads } from "./ViewStudentLeads";
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

interface StudentLead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  courseApplied: string;
  courseAppliedName: string;
  countryPreference: string;
  countryPreferenceName: string;
  status: "New" | "In Progress" | "Applied" | "Admitted" | "Rejected";
  description?: string;
  referralPartner: string;
  referralPartnerName: string;
  commissionAmount: number;
  commissionStatus: "Pending" | "Paid";
  createdAt: string;
  updatedAt: string;
}

interface ReferralPartner {
  _id: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
}

interface Category {
  _id: string;
  name: string;
  type: "course" | "country";
  isActive?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  courseApplied: string; // ID
  courseAppliedName: string; // Display name
  countryPreference: string; // ID
  countryPreferenceName: string; // Display name
  status: "New" | "In Progress" | "Applied" | "Admitted" | "Rejected";
  description: string;
  referralPartner: string; // Just the ID of the referral partner
  commissionAmount: number;
  commissionStatus: "Pending" | "Paid";
}

// Removed unused escapeRegex

export const StudentLeads = () => {
  // Track touched fields and errors for red border
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const searchParams = useSearchParams();
  const [studentLeads, setStudentLeads] = useState<StudentLead[]>([]);
  const [referralPartners, setReferralPartners] = useState<ReferralPartner[]>(
    []
  );
  const [courseCategories, setCourseCategories] = useState<Category[]>([]);
  const [countryCategories, setCountryCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<StudentLead | null>(null);
  const [viewingLead, setViewingLead] = useState<StudentLead | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Category management states
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCountryName, setNewCountryName] = useState("");
  const [editingCourse, setEditingCourse] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editingCountry, setEditingCountry] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editCourseName, setEditCourseName] = useState("");
  const [editCountryName, setEditCountryName] = useState("");
  const [explicitlyClosing, setExplicitlyClosing] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    courseApplied: "",
    courseAppliedName: "",
    countryPreference: "",
    countryPreferenceName: "",
    status: "New",
    description: "",
    referralPartner: "",
    commissionAmount: 0,
    commissionStatus: "Pending",
  });

  // Fetch functions
  const fetchStudentLeads = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/studentleads?page=${page}&limit=10&search=${search}`
      );
      const data = response.data;

      if (data.success) {
        setStudentLeads(data.data);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.page);
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
      setLoading(false);
    }
  };

  const fetchReferralPartners = async () => {
    try {
      const response = await axios.get("/api/referralpartner?all=true");
      const data = response.data;
      if (data.success) {
        setReferralPartners(
          data.data.filter(
            (partner: ReferralPartner) => partner.status === "Active"
          )
        );
      }
    } catch (error) {
      console.error("Error fetching referral partners:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const [courseResponse, countryResponse] = await Promise.all([
        axios.get("/api/studentleads/category?type=course"),
        axios.get("/api/studentleads/category?type=country"),
      ]);

      if (courseResponse.data.success) {
        setCourseCategories(courseResponse.data.data);
      }
      if (countryResponse.data.success) {
        setCountryCategories(countryResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchStudentLeads(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchReferralPartners();
    fetchCategories();
  }, []);

  // Handle edit action from URL parameters
  useEffect(() => { 
    const action = searchParams.get("action");
    if (action === "edit") {
      const storedLead = sessionStorage.getItem("editStudentLead");
      if (storedLead) {
        try {
          const lead = JSON.parse(storedLead);
          handleEditLead(lead);
          // Clear the stored data
          sessionStorage.removeItem("editStudentLead");
          // Clear the URL parameter
          window.history.replaceState({}, "", "/student-lead");
        } catch (error) {
          console.error("Error parsing stored lead data:", error);
        }
      }
    }
  }, [searchParams]);

  // Category management functions
  const handleAddCourse = async () => {
    if (!newCourseName.trim()) return;

    try {
      const response = await axios.post("/api/studentleads/category", {
        name: newCourseName.trim(),
        type: "course",
      });

      if (response.data.success) {
        toast.success("Course added successfully!");
        setNewCourseName("");
        setShowAddCourse(false);
        setCourseDropdownOpen(false);
        fetchCategories();
        fetchStudentLeads(currentPage, searchTerm); // Refresh table
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("Failed to add course");
      }
    }
  };

  const handleAddCountry = async () => {
    if (!newCountryName.trim()) return;

    try {
      const response = await axios.post("/api/studentleads/category", {
        name: newCountryName.trim(),
        type: "country",
      });

      if (response.data.success) {
        toast.success("Country added successfully!");
        setNewCountryName("");
        setShowAddCountry(false);
        setCountryDropdownOpen(false);
        fetchCategories();
        fetchStudentLeads(currentPage, searchTerm); // Refresh table
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("Failed to add country");
      }
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse || !editCourseName.trim()) return;

    try {
      const response = await axios.put("/api/studentleads/category", {
        id: editingCourse.id,
        name: editCourseName.trim(),
        type: "course",
      });

      if (response.data.success) {
        toast.success("Course updated successfully!");
        setEditingCourse(null);
        setEditCourseName("");
        setCourseDropdownOpen(false);
        fetchCategories();
        fetchStudentLeads(currentPage, searchTerm); // Refresh table
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("Failed to update course");
      }
    }
  };

  const handleEditCountry = async () => {
    if (!editingCountry || !editCountryName.trim()) return;

    try {
      const response = await axios.put("/api/studentleads/category", {
        id: editingCountry.id,
        name: editCountryName.trim(),
        type: "country",
      });

      if (response.data.success) {
        toast.success("Country updated successfully!");
        setEditingCountry(null);
        setEditCountryName("");
        setCountryDropdownOpen(false);
        fetchCategories();
        fetchStudentLeads(currentPage, searchTerm); // Refresh table
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("Failed to update country");
      }
    }
  }; 

  const handleDeleteCourse = async (id: string) => {
    try {
      const response = await axios.delete(
        `/api/studentleads/category?id=${id}`
      );
      if (response.data.success) {
        toast.success("Course deleted successfully!");
        fetchCategories();
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("Failed to delete course");
      }
    }
  };

  const handleDeleteCountry = async (id: string) => {
    try {
      const response = await axios.delete(
        `/api/studentleads/category?id=${id}`
      );
      if (response.data.success) {
        toast.success("Country deleted successfully!");
        fetchCategories();
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("Failed to delete country");
      }
    }
  };

  // Form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.courseApplied) newErrors.courseApplied = "Course is required";
    if (!formData.countryPreference) newErrors.countryPreference = "Country is required";
    if (!formData.referralPartner) newErrors.referralPartner = "Referral Partner is required";
    
    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      courseApplied: true,
      countryPreference: true,
      referralPartner: true,
    });
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Prepare payload - only include IDs and remove display names
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        courseApplied: formData.courseApplied,
        countryPreference: formData.countryPreference,
        status: formData.status,
        description: formData.description,
        referralPartner: formData.referralPartner,
        commissionAmount: formData.commissionAmount,
        commissionStatus: formData.commissionStatus
      };
      let result;
      if (editingLead) {
        // Update existing lead
        const response = await axios.put(
          `/api/studentleads/${editingLead._id}`,
          payload
        );
        result = response.data;
      } else {
        // Create new lead
        const response = await axios.post("/api/studentleads", payload);
        result = response.data;
      }

      if (result.success) {
        toast.success(editingLead ? "Student lead updated successfully!" : "Student lead created successfully!");
        setIsDialogOpen(false);
        setIsEditDialogOpen(false);
        setEditingLead(null);
        setFormData({
          name: "",
          email: "",
          phone: "",
          courseApplied: "",
          courseAppliedName: "",
          countryPreference: "",
          countryPreferenceName: "",
          status: "New",
          description: "",
          referralPartner: "",
          commissionAmount: 0,
          commissionStatus: "Pending",
        });
        fetchStudentLeads(currentPage, searchTerm);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        if (
          axiosError.response.data.error.includes("duplicate") ||
          axiosError.response.data.error.toLowerCase().includes("email already exists")
        ) {
          toast.error("Student already exists");
        } else {
          toast.error(axiosError.response.data.error);
        }
      } else {
        toast.error("An unexpected error occurred");
      }
      // Do not print to console for duplicate email
      if (
        !(axiosError.response?.data?.error &&
          (axiosError.response.data.error.includes("duplicate") ||
            axiosError.response.data.error.toLowerCase().includes("email already exists")))
      ) {
        console.error("Error submitting form:", error);
      }
    }
  };

  const handleAddLead = () => {
    setEditingLead(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      courseApplied: "",
      courseAppliedName: "",
      countryPreference: "",
      countryPreferenceName: "",
      status: "New",
      description: "",
      referralPartner: "",
      commissionAmount: 0,
      commissionStatus: "Pending",
    });
    setIsDialogOpen(true);
  };

  const handleEditLead = (lead: StudentLead) => {
    setEditingLead(lead);
    // Make sure to populate both ID and name fields for course and country
    const formDataWithNames = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      courseApplied: lead.courseApplied,
      courseAppliedName: lead.courseAppliedName || '', // Ensure name is populated
      countryPreference: lead.countryPreference,
      countryPreferenceName: lead.countryPreferenceName || '', // Ensure name is populated
      status: lead.status,
      description: lead.description || "",
      referralPartner: lead.referralPartner,
      commissionAmount: lead.commissionAmount,
      commissionStatus: lead.commissionStatus,
    };

    // Find and set the current course and country names from categories
    const selectedCourse = courseCategories.find(c => c._id === lead.courseApplied);
    const selectedCountry = countryCategories.find(c => c._id === lead.countryPreference);

    if (selectedCourse) {
      formDataWithNames.courseAppliedName = selectedCourse.name;
    }
    if (selectedCountry) {
      formDataWithNames.countryPreferenceName = selectedCountry.name;
    }

    setFormData(formDataWithNames);
    setIsEditDialogOpen(true);
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

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  



  const getCommissionStatusBadgeVariant = (status: string) => {
    return status === "Paid" ? "default" : "secondary";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "New":
        return "default";
      case "In Progress":
        return "secondary"; 
      case "Applied":
        return "secondary"; 
      case "Admitted":
        return "default";
      case "Rejected":
        return "destructive";
      default:
        return "default";
    } 
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Leads</CardTitle>
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddLead} className="bg-[#1A73E8] hover:bg-[#1669C1] cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Student Lead</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          setTouched((prev) => ({ ...prev, name: true }));
                          setErrors((prev) => ({ ...prev, name: "" }));
                        }}
                        placeholder="Enter student name"
                        className={`mt-2 ${touched.name && errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                        onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setTouched((prev) => ({ ...prev, email: true }));
                          setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        placeholder="Enter email address"
                        className={`mt-2 ${touched.email && errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          setTouched((prev) => ({ ...prev, phone: true }));
                          setErrors((prev) => ({ ...prev, phone: "" }));
                        }}
                        placeholder="Enter phone number"
                        className={`mt-2 ${touched.phone && errors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                        type="tel"
                        inputMode="numeric"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="referralPartner">
                        Referral Partner <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.referralPartner}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            referralPartner: value,
                          });
                          setTouched((prev) => ({ ...prev, referralPartner: true }));
                          setErrors((prev) => ({ ...prev, referralPartner: "" }));
                        }}
                      >
                        <SelectTrigger className={`mt-2 ${touched.referralPartner && errors.referralPartner ? 'border-red-500 focus:border-red-500' : ''}`}>
                          <SelectValue placeholder="Select referral partner" />
                        </SelectTrigger>
                        <SelectContent>
                          {referralPartners.map((partner) => (
                            <SelectItem key={partner._id} value={partner._id}>
                              {partner.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Course Applied with Category Management */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative">
                      <Label className="text-base font-semibold">
                        Course Applied <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-2 space-y-2">
                        <Select
                          value={formData.courseAppliedName}
                          onValueChange={(value) => {
                            if (value === "add_new_course") {
                              setEditingCourse(null);
                              setEditCourseName("");
                              setShowAddCourse(true);
                              setNewCourseName("");
                              setCourseDropdownOpen(true);
                              setCountryDropdownOpen(false);
                              setShowAddCountry(false);
                              setEditingCountry(null);
                            } else {
                              const selectedCourse = courseCategories.find(c => c.name === value);
                              if (selectedCourse) {
                                setFormData({
                                  ...formData,
                                  courseApplied: selectedCourse._id,
                                  courseAppliedName: value
                                });
                              }
                              setCourseDropdownOpen(false);
                            }
                          }}
                          open={courseDropdownOpen}
                          onOpenChange={(open) => {
                            if (open) {
                              // Close country dropdown when course dropdown is opened
                              setCountryDropdownOpen(false);
                              setShowAddCountry(false);
                              setEditingCountry(null);
                              setNewCountryName("");
                              setEditCountryName("");
                            }

                            if (
                              !open &&
                              (editingCourse || showAddCourse) &&
                              !explicitlyClosing
                            ) {
                              setCourseDropdownOpen(true);
                              return;
                            }
                            setCourseDropdownOpen(open);
                            if (explicitlyClosing) {
                              setExplicitlyClosing(false);
                            }
                            if (!open && !explicitlyClosing) {
                              setShowAddCourse(false);
                              setEditingCourse(null);
                              setNewCourseName("");
                              setEditCourseName("");
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent className="z-50">
                            {courseCategories.map((course) => (
                              <div
                                key={course._id}
                                className="flex items-center justify-between group"
                              >
                                <SelectItem
                                  value={course.name}
                                  className="flex-1"
                                >
                                  {course.name}
                                </SelectItem>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-blue-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowAddCourse(false);
                                      setNewCourseName("");
                                      setEditingCourse({
                                        id: course._id,
                                        name: course.name,
                                      });
                                      setEditCourseName(course.name);
                                      setCourseDropdownOpen(true);
                                    }}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-red-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCourse(course._id);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <div
                              className="cursor-pointer hover:bg-gray-100 px-2 py-1.5 text-sm flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setEditingCourse(null);
                                setEditCourseName("");
                                setShowAddCourse(true);
                                setNewCourseName("");
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add New Course
                            </div>
                            {showAddCourse && (
                              <div
                                className="p-4 border-t bg-gray-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <Label className="text-sm font-semibold">
                                    Add New Course
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setShowAddCourse(false);
                                      setNewCourseName("");
                                      setExplicitlyClosing(true);
                                      setCourseDropdownOpen(false);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    value={newCourseName}
                                    onChange={(e) =>
                                      setNewCourseName(e.target.value)
                                    }
                                    placeholder="Enter course name"
                                    className="flex-1"
                                    autoFocus
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        handleAddCourse();
                                      }
                                    }}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                  />
                                  <Button
                                    type="button"
                                    onClick={handleAddCourse}
                                    size="sm"
                                    className=" text-white bg-[#1A73E8] hover:bg-[#1669C1]"
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              </div>
                            )}
                            {editingCourse && (
                              <div
                                className="p-4 border-t bg-gray-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <Label className="text-sm font-semibold">
                                    Edit Course
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingCourse(null);
                                      setEditCourseName("");
                                      setExplicitlyClosing(true);
                                      setCourseDropdownOpen(false);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    value={editCourseName}
                                    onChange={(e) =>
                                      setEditCourseName(e.target.value)
                                    }
                                    placeholder="Enter course name"
                                    className="flex-1"
                                    autoFocus
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        handleEditCourse();
                                      }
                                    }}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                  />
                                  <Button
                                    type="button"
                                    onClick={handleEditCourse}
                                    size="sm"
                                    className=" text-white bg-[#1A73E8] hover:bg-[#1669C1]"
                                    
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Update
                                  </Button>
                                </div>
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Country Preference with Category Management */}
                    <div className="relative">
                      <Label className="text-base font-semibold">
                        Country Preference{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-2 space-y-2">
                        <Select
                          value={formData.countryPreferenceName}
                          onValueChange={(value) => {
                            if (value === "add_new_country") {
                              setEditingCountry(null);
                              setEditCountryName("");
                              setShowAddCountry(true);
                              setNewCountryName("");
                              setCountryDropdownOpen(true);
                              setCourseDropdownOpen(false);
                              setShowAddCourse(false);
                              setEditingCourse(null);
                            } else {
                              const selectedCountry = countryCategories.find(c => c.name === value);
                              if (selectedCountry) {
                                setFormData({
                                  ...formData,
                                  countryPreference: selectedCountry._id,
                                  countryPreferenceName: value
                                });
                              }
                              setCountryDropdownOpen(false);
                            }
                          }}
                          open={countryDropdownOpen}
                          onOpenChange={(open) => {
                            if (open) {
                              // Close course dropdown when country dropdown is opened
                              setCourseDropdownOpen(false);
                              setShowAddCourse(false);
                              setEditingCourse(null);
                              setNewCourseName("");
                              setEditCourseName("");
                            }

                            if (
                              !open &&
                              (editingCountry || showAddCountry) &&
                              !explicitlyClosing
                            ) {
                              setCountryDropdownOpen(true);
                              return;
                            }
                            setCountryDropdownOpen(open);
                            if (explicitlyClosing) {
                              setExplicitlyClosing(false);
                            }
                            if (!open && !explicitlyClosing) {
                              setShowAddCountry(false);
                              setEditingCountry(null);
                              setNewCountryName("");
                              setEditCountryName("");
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="z-50">
                            {countryCategories.map((country) => (
                              <div
                                key={country._id}
                                className="flex items-center justify-between group"
                              >
                                <SelectItem
                                  value={country.name}
                                  className="flex-1"
                                >
                                  {country.name}
                                </SelectItem>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-blue-100 "
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowAddCountry(false);
                                      setNewCountryName("");
                                      setEditingCountry({
                                        id: country._id,
                                        name: country.name,
                                      });
                                      setEditCountryName(country.name);
                                      setCountryDropdownOpen(true);
                                    }}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-red-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCountry(country._id);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <div
                              className="cursor-pointer hover:bg-gray-100 px-2 py-1.5 text-sm flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setEditingCountry(null);
                                setEditCountryName("");
                                setShowAddCountry(true);
                                setNewCountryName("");
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add New Country
                            </div>
                            {showAddCountry && (
                              <div
                                className="p-4 border-t bg-gray-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <Label className="text-sm font-semibold">
                                    Add New Country
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setShowAddCountry(false);
                                      setNewCountryName("");
                                      setExplicitlyClosing(true);
                                      setCountryDropdownOpen(false);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    value={newCountryName}
                                    onChange={(e) =>
                                      setNewCountryName(e.target.value)
                                    }
                                    placeholder="Enter country name"
                                    className="flex-1"
                                    autoFocus
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        handleAddCountry();
                                      }
                                    }}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                  />
                                  <Button
                                    type="button"
                                    onClick={handleAddCountry}
                                    size="sm"
                                    className=" text-white bg-[#1A73E8] hover:bg-[#1669C1]"
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              </div>
                            )}
                            {editingCountry && (
                              <div
                                className="p-4 border-t bg-gray-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <Label className="text-sm font-semibold">
                                    Edit Country
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingCountry(null);
                                      setEditCountryName("");
                                      setExplicitlyClosing(true);
                                      setCountryDropdownOpen(false);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    value={editCountryName}
                                    onChange={(e) =>
                                      setEditCountryName(e.target.value)
                                    }
                                    placeholder="Enter country name"
                                    className="flex-1"
                                    autoFocus
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        handleEditCountry();
                                      }
                                    }}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                  />
                                  <Button
                                    type="button"
                                    onClick={handleEditCountry}
                                    size="sm"
                                    className=" text-white bg-[#1A73E8] hover:bg-[#1669C1]"
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Update
                                  </Button>
                                </div>
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(
                          value:
                            | "New"
                            | "In Progress"
                            | "Applied"
                            | "Admitted"
                            | "Rejected"
                        ) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="Applied">Applied</SelectItem>
                          <SelectItem value="Admitted">Admitted</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="commissionStatus">
                        Commission Status
                      </Label>
                      <Select
                        value={formData.commissionStatus}
                        onValueChange={(value: "Pending" | "Paid") =>
                          setFormData({ ...formData, commissionStatus: value })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select commission status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="commissionAmount">Commission Amount</Label>
                    <Input
                      id="commissionAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.commissionAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commissionAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Enter commission amount"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter additional notes or description"
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button className="bg-[#1A73E8] hover:bg-[#1669C1] cursor-pointer" type="submit">Create Student Lead</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Student Lead</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Same form fields as add dialog */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter student name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="Enter email address"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-phone">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="Enter phone number"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-referralPartner">
                        Referral Partner <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.referralPartner}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            referralPartner: value,
                          });
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select referral partner" />
                        </SelectTrigger>
                        <SelectContent>
                          {referralPartners.map((partner) => (
                            <SelectItem key={partner._id} value={partner._id}>
                              {partner.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-courseApplied">
                        Course Applied <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.courseAppliedName}
                        onValueChange={(value) => {
                          const selectedCourse = courseCategories.find(c => c.name === value);
                          if (selectedCourse) {
                            setFormData({
                              ...formData,
                              courseApplied: selectedCourse._id,
                              courseAppliedName: selectedCourse.name
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courseCategories.map((course) => (
                            <SelectItem key={course._id} value={course.name}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-countryPreference">
                        Country Preference{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.countryPreferenceName}
                        onValueChange={(value) => {
                          const selectedCountry = countryCategories.find(c => c.name === value);
                          if (selectedCountry) {
                            setFormData({
                              ...formData,
                              countryPreference: selectedCountry._id,
                              countryPreferenceName: selectedCountry.name
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCategories.map((country) => (
                            <SelectItem key={country._id} value={country.name}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(
                          value:
                            | "New"
                            | "In Progress"
                            | "Applied"
                            | "Admitted"
                            | "Rejected"
                        ) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="mt-2 w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="Applied">Applied</SelectItem>
                          <SelectItem value="Admitted">Admitted</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-commissionStatus">
                        Commission Status
                      </Label>
                      <Select
                        value={formData.commissionStatus}
                        onValueChange={(value: "Pending" | "Paid") =>
                          setFormData({ ...formData, commissionStatus: value })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select commission status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-commissionAmount">
                      Commission Amount
                    </Label>
                    <Input
                      id="edit-commissionAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.commissionAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commissionAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Enter commission amount"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter additional notes or description"
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditDialogOpen(false);
                        setEditingLead(null);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          courseApplied: "",
                          courseAppliedName: "",
                          countryPreference: "",
                          countryPreferenceName: "",
                          status: "New",
                          description: "",
                          referralPartner: "",
                          commissionAmount: 0,
                          commissionStatus: "Pending",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button className="bg-[#1A73E8] hover:bg-[#1669C1]" type="submit">Update Student Lead</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* View Dialog */}
            <ViewStudentLeads
              isOpen={isViewDialogOpen}
              onClose={() => {
                setIsViewDialogOpen(false);
                setViewingLead(null);
              }}
              studentLead={viewingLead}
              referralPartners={referralPartners}
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
                    This action cannot be undone. This will permanently delete
                    the student lead for{" "}
                    <span className="font-semibold">{leadToDelete?.name}</span>{" "}
                    and remove all associated data.
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

          {loading ? (
            <div className="text-center py-8">Loading...</div>
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
                    <TableHead>Referral Partner</TableHead>
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
                      <TableCell>{lead.courseAppliedName}</TableCell>
                      <TableCell>{lead.countryPreferenceName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col-2 gap-1">
                         
                          <Badge
                            variant={getStatusBadgeVariant(lead.status)}
                            className={`text-xs${lead.status === "Admitted" || lead.status === "In Progress" ? " bg-[#1A73E8] text-white" : ""}`}
                          >{lead.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{
                        referralPartners.find((p) => p._id === lead.referralPartner)?.name || ""
                      }</TableCell>

                      <TableCell>
                        <div className="flex flex-col-2 gap-1">
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
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLead(lead)}
                            title="Edit Lead"
                            className="cursor-pointer"
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
                            className="text-red-500 hover:text-red-700 cursor-pointer"
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
    </div>
  );
};
