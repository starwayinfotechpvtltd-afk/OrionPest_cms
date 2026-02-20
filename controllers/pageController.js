import Page from "@/models/Page";
import connectDB from "@/lib/db";

export const getPageContent = async (slug) => {
  await connectDB();
  const page = await Page.findOne({ slug });
  return page;
};

export const allPageContent = async () => {
  await connectDB();
  return await Page.find();
};

export const uploadPageContent = async (data) => {
  await connectDB();

  const { title, slug, block, content } = data;

  if (!slug || !block || !content) {
    throw new Error("slug, block and content are required");
  }

  let page = await Page.findOne({ slug });

  if (!page) {
    return await Page.create({
      title,
      slug,
      pageData: [{ block, content }],
    });
  }

  const blockIndex = page.pageData.findIndex(
    (item) => item.block === block
  );

  if (blockIndex !== -1) {
    page.pageData[blockIndex].content = content;
  } else {
    page.pageData.push({ block, content });
  }

  await page.save();
  return page;
};


export async function updatePage(slug, body) {

  const { metaTitle, metaDescription, pageData } = body;

  const updated = await Page.findOneAndUpdate(
    { slug: slug },
    {
      $set: {
        metaTitle,
        metaDescription,
        pageData,
      },
    },
    { new: true }
  );

  return updated;
}


export const updateSingleBlock = async (pageName, blockName, content) => {
  await connectDB();

  if (!content) throw new Error("Content required");

  const updatedPage = await Page.findOneAndUpdate(
    {
      slug: pageName,
      "pageData.block": blockName,
    },
    {
      $set: { "pageData.$.content": content },
    },
    { new: true }
  );

  return updatedPage;
};