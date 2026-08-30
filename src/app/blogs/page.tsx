import { Metadata } from "next";
import { getBlogs, getCategories } from "./actions";
import BlogListing from "./BlogListing";

export const metadata: Metadata = {
  title: "Blogs | YS CMS",
  description: "Read our latest blog posts",
};

export default async function BlogsPage() {
  const [initialData, categories] = await Promise.all([
    getBlogs({ page: 1, limit: 15, category: "" }),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Our Blog</h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Discover the latest insights, tutorials, and updates from our team.
          </p>
        </div>
        
        <BlogListing initialBlogs={initialData.blogs} initialHasMore={initialData.hasMore} categories={categories} />
      </div>
    </main>
  );
}
