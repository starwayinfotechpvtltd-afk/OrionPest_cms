import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  slug: String,
  title: String,
  metaTitle: String,
  metaDescription: String,
  pageData: [
    {
      block: String,
      content: String,
    },
  ],
});

export default mongoose.models.Page || mongoose.model("Page", pageSchema);