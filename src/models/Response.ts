import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { 
    type: String, 
    required: true 
  },
  answer: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  }
}, { _id: false });

const responseSchema = new mongoose.Schema({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Form", 
    required: true 
  },
  answers: [answerSchema],
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Clear the model first to avoid OverwriteModelError
if (mongoose.models.Response) {
  delete mongoose.models.Response;
}

export default mongoose.models.Response || mongoose.model("Response", responseSchema);
