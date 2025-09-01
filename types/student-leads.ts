export interface StudentLead {
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

export interface ReferralPartner {
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
