import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: String,
  type: { type: String, enum: ["text", "multiple"], required: true },
  options: [String], // Only for "multiple" type
});

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Form || mongoose.model("Form", formSchema);
