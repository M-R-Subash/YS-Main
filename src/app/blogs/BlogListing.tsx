"use client";

import { useState } from "react";
import Link from "next/link";
import { getBlogs } from "./actions";
import { Clock, Calendar, ChevronRight } from "lucide-react";

export default function BlogListing({ initialBlogs, initialHasMore, categories }: { initialBlogs: any[], initialHasMore: boolean, categories: string[] }) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;
    const data = await getBlogs({ page: nextPage, limit: 15, category: activeCategory });
    setBlogs([...blogs, ...data.blogs]);
    setHasMore(data.hasMore);
    setPage(nextPage);
    setLoading(false);
  };

  const filterByCategory = async (category: string) => {
    setActiveCategory(category);
    setPage(1);
    setLoading(true);
    const data = await getBlogs({ page: 1, limit: 15, category });
    setBlogs(data.blogs);
    setHasMore(data.hasMore);
    setLoading(false);
  };

  return (
    <div>
      {/* Categories Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-start gap-2 mb-12">
          <button
            onClick={() => filterByCategory("All")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "All"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => filterByCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Blogs Grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          No blogs found for this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-zinc-200 transition-all hover:shadow-lg hover:-translate-y-1">
              {blog.featuredImage ? (
                <div className="relative h-56 w-full overflow-hidden bg-zinc-100">
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {blog.categories && blog.categories.length > 0 && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-zinc-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                      {blog.categories[0]}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-56 w-full bg-zinc-100 flex items-center justify-center">
                  <span className="text-zinc-400 font-medium">No Image</span>
                  {blog.categories && blog.categories.length > 0 && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-zinc-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                      {blog.categories[0]}
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(blog.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  {blog.readingTime > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {blog.readingTime} min read
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-3 line-clamp-2 text-zinc-900 group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                
                <p className="text-zinc-600 text-sm line-clamp-3 mb-6 flex-1">
                  {blog.excerpt || blog.seo?.metaDesc || "Read more about this topic..."}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {(blog.seo?.authorName || blog.author?.name || "U")[0]}
                    </div>
                    <div className="text-sm font-semibold text-zinc-800 truncate max-w-[120px]">
                      {blog.seo?.authorName || blog.author?.name || "Unknown Author"}
                    </div>
                  </div>
                  <div className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-16 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-zinc-900 text-white rounded-full font-semibold hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Loading..." : "Load More Articles"}
          </button>
        </div>
      )}
    </div>
  );
}
