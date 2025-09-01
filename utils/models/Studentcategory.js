import mongoose from 'mongoose';

const StudentCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
   
  },
  type: {
    type: String,
    required: [true, 'Category type is required'],
   
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
StudentCategorySchema.index({ type: 1, isActive: 1 });
StudentCategorySchema.index({ name: 1, type: 1 }, { unique: true });

const StudentCategory = mongoose.models.StudentCategory || mongoose.model('StudentCategory', StudentCategorySchema);

export default StudentCategory;