import mongoose from 'mongoose';

const ReferralPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
   
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
   
  },
  city: {
    type: String,
    required: [true, 'City is required'],
   
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    
  },
  district: {
    type: String,
    required: [true, 'District is required'],
   
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
   
  },
  partnerType: {
    type: String,
    required: [true, 'Partner type is required'],
    
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
   
  }
}, {
  timestamps: true
});

// Create indexes for better performance (email index is already created by unique: true)
ReferralPartnerSchema.index({ status: 1 });
ReferralPartnerSchema.index({ partnerType: 1 });

const ReferralPartner = mongoose.models.ReferralPartner || mongoose.model('ReferralPartner', ReferralPartnerSchema);

export default ReferralPartner;