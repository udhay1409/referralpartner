import mongoose from 'mongoose';

const StudentLeadsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  courseApplied: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentCategory',
    required: [true, 'Course Applied is required'],
  }, 
  countryPreference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentCategory',
    required: [true, 'Country Preference is required'],
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
   
  },
  description: {
    type: String,
    trim: true,
  },
  referralPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralPartner',
    required: [true, 'Referral Partner is required']
  },
  commissionAmount: {
    type: Number,
    min: [0, 'Commission amount cannot be negative'],
    default: 0
  },
  commissionStatus: {
    type: String,
    required: [true, 'Commission Status is required'],
   
  }
}, {
  timestamps: true
});

// Create indexes for better performance
StudentLeadsSchema.index({ status: 1 });
StudentLeadsSchema.index({ 'referralPartner.id': 1 });
StudentLeadsSchema.index({ commissionStatus: 1 });
StudentLeadsSchema.index({ createdAt: -1 });

const StudentLeads = mongoose.models.StudentLeads || mongoose.model('StudentLeads', StudentLeadsSchema);

export default StudentLeads;