"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
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
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import * as z from "zod";
import { toast } from "sonner";
import axios from "axios";
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

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^[\+]?[0-9]{10,15}$/,
      "Please enter a valid phone number (10-15 digits)"
    ),
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address cannot exceed 200 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .max(50, "City cannot exceed 50 characters"),
  state: z
    .string()
    .min(1, "State is required")
    .max(50, "State cannot exceed 50 characters"),
  district: z
    .string()
    .min(1, "District is required")
    .max(50, "District cannot exceed 50 characters"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(50, "Country cannot exceed 50 characters"),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^[0-9]{4,10}$/, "Please enter a valid pincode (4-10 digits)"),
  partnerType: z.enum(["Agency", "Individual"]),
  status: z.enum(["Active", "Inactive"]),
});

type FormData = z.infer<typeof formSchema>;

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

export const ReferralPartner = () => {
  const router = useRouter();
  const [partners, setPartners] = useState<ReferralPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<ReferralPartner | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      district: "",
      country: "",
      pincode: "",
      partnerType: "Individual",
      status: "Active",
    },
  });

  const fetchPartners = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/referralpartner?page=${page}&limit=10&search=${search}`
      );
      const data = response.data;

      if (data.success) {
        setPartners(data.data);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.page);
      } else {
        toast.error("Failed to fetch partners");
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("Failed to fetch partners");
      }
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const onSubmit = async (data: FormData) => {
    try {
      if (editingPartner) {
        // Update existing partner
        const response = await axios.put(
          `/api/referralpartner/${editingPartner._id}`,
          data
        );
        const result = response.data;

        if (result.success) {
          toast.success("Partner updated successfully!");
          setIsEditDialogOpen(false);
          setEditingPartner(null);
          form.reset();
          fetchPartners(currentPage, searchTerm);
        } else {
          toast.error(result.error || "Failed to update partner");
        }
      } else {
        // Create new partner
        const response = await axios.post("/api/referralpartner", data);
        const result = response.data;

        if (result.success) {
          toast.success("Partner created successfully!");
          setIsDialogOpen(false);
          form.reset();
          fetchPartners(currentPage, searchTerm);
        } else {
          toast.error(result.error || "Failed to create partner");
        }
      }
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred";
      
      if (isAxiosError(error) && error.response?.data?.error) {
        // Handle known error cases
        const knownErrors = [
          "Partner already exists",
          "A partner with this email already exists",
          "Email already registered",
          "Duplicate email address"
        ];
        
        errorMessage = error.response.data.error;
        
        // Only log to console if it's not a known error
        if (!knownErrors.some(known => errorMessage.toLowerCase().includes(known.toLowerCase()))) {
          console.error("Error submitting form:", error);
        }
      } else if (error instanceof Error) {
        // For unexpected errors, we still want to log them
        errorMessage = error.message;
        console.error("Unexpected error:", error);
      }
      
      toast.error(errorMessage);
    }

    function isAxiosError(error: unknown): error is AxiosError<{ error: string }> {
      return (typeof error === "object" && error !== null && "isAxiosError" in error && (error as AxiosError).isAxiosError === true);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewPartner = (id: string) => {
    router.push(`/referral-partner/${id}`);
  };

  const handleAddPartner = () => {
    setEditingPartner(null);
    form.reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      district: "",
      country: "",
      pincode: "",
      partnerType: "Individual",
      status: "Active",
    });
    setIsDialogOpen(true);
  };

  const handleEditPartner = (partner: ReferralPartner) => {
    setEditingPartner(partner);
    form.reset({
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      address: partner.address,
      city: partner.city,
      state: partner.state,
      district: partner.district,
      country: partner.country,
      pincode: partner.pincode,
      partnerType: partner.partnerType,
      status: partner.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeletePartner = (id: string, name: string) => {
    setPartnerToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePartner = async () => {
    if (!partnerToDelete) return;

    try {
      const response = await axios.delete(
        `/api/referralpartner/${partnerToDelete.id}`
      );
      const result = response.data;

      if (result.success) {
        toast.success("Partner deleted successfully!");
        fetchPartners(currentPage, searchTerm);
        setIsDeleteDialogOpen(false);
        setPartnerToDelete(null);
      } else {
        toast.error(result.error || "Failed to delete partner");
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Error deleting partner:", error);
    }
  };

  const handleToggleStatus = async (partner: ReferralPartner) => {
    const newStatus = partner.status === "Active" ? "Inactive" : "Active";

    try {
      const response = await axios.put(`/api/referralpartner/${partner._id}`, {
        ...partner,
        status: newStatus,
      });
      const result = response.data;

      if (result.success) {
        toast.success(`Partner status updated to ${newStatus}`);
        fetchPartners(currentPage, searchTerm);
      } else {
        toast.error(result.error || "Failed to update partner status");
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("Failed to update partner status");
        // Only log unexpected errors
        console.error("Unexpected error updating partner status:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Referral Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleAddPartner}
                  className="bg-[#1A73E8] hover:bg-[#1669C1] cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Referral Partner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Referral Partner</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter email"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                inputMode="numeric"
                                pattern="^[+]?\d{10,15}$"
                                placeholder="Enter phone number"
                                onKeyPress={(e) => {
                                  const char = e.key;
                                  // Allow digits and '+' only at the first position
                                  if (!(/[0-9]/.test(char) || (char === '+' && e.currentTarget.selectionStart === 0))) {
                                    e.preventDefault();
                                  }
                                }}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter state" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter district" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter pincode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="partnerType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select partner type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Individual">
                                  Individual
                                </SelectItem>
                                <SelectItem value="Agency">Agency</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">
                                  Inactive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
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
                      <Button
                        className="bg-[#1A73E8] hover:bg-[#1669C1] cursor-pointer"
                        type="submit"
                      >
                        Create Partner
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Referral Partner</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter email"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter phone number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter state" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter district" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter pincode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="partnerType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select partner type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Individual">
                                  Individual
                                </SelectItem>
                                <SelectItem value="Agency">Agency</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">
                                  Inactive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditDialogOpen(false);
                          setEditingPartner(null);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Update Partner</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
                    <TableHead>City</TableHead>
                    <TableHead>Partner Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner._id}>
                      <TableCell className="font-medium">
                        {partner.name}
                      </TableCell>
                      <TableCell>{partner.email}</TableCell>
                      <TableCell>{partner.phone}</TableCell>
                      <TableCell>{partner.city}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            partner.partnerType === "Agency"
                              ? "bg-[#1A73E8] text-white"
                              : ""
                          }
                          variant={
                            partner.partnerType === "Agency"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {partner.partnerType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                            partner.status === "Active"
                              ? "bg-[#1A73E8] text-white"
                              : ""
                          }

                          variant={
                            partner.status === "Active"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {partner.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPartner(partner._id)}
                            title="View Details"
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPartner(partner)}
                            title="Edit Partner"
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeletePartner(partner._id, partner.name)
                            }
                            title="Delete Partner"
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={partner.status === "Active"}
                            onCheckedChange={() => handleToggleStatus(partner)}
                            title={`Toggle status (Currently ${partner.status})`}
                            className={partner.status === "Active" ? "data-[state=checked]:bg-[#1A73E8] cursor-pointer " : "cursor-pointer "}
                          />
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
              referral partner{" "}
              <span className="font-semibold">{partnerToDelete?.name}</span> and
              remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setPartnerToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePartner}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Partner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
