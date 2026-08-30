"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar, Link2, ChevronRight } from "lucide-react";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);
import FaqSection from "@/components/FaqSection";
import { useState, useEffect } from "react";

export default function BlogSingleClient({ 
  blog, 
  htmlContent, 
  toc, 
  faqs,
  faqsGraphic,
  relatedBlogs 
}: { 
  blog: any; 
  htmlContent: string; 
  toc: { id: string; text: string }[];
  faqs: any;
  faqsGraphic: any;
  relatedBlogs: any[];
}) {
  const [currentUrl, setCurrentUrl] = useState("");
  const [activeId, setActiveId] = useState<string>("");

  const [comments, setComments] = useState<any[]>(blog.comments || []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    toc.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  const authorName = blog.seo?.authorName || blog.author?.name || "Unknown Author";
  const authorRole = blog.seo?.authorRole || blog.author?.authorRole || "Author";
  const authorDesc = blog.seo?.authorDescription || blog.author?.description || "";
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    alert("Link copied to clipboard!");
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !content) {
      setSubmitError("Please fill out all required fields.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId: blog.id,
          name,
          email,
          content
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit comment");

      setComments([data.comment, ...comments]);
      setContent("");
      setSubmitSuccess(true);
      
      // Auto-clear success state after 4 seconds
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fafafa] min-h-screen text-zinc-900 selection:bg-primary/30">
      {/* Hero Section */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Side: Content — 60% */}
          <div className="w-full lg:w-[60%] order-2 lg:order-1">
            {blog.categories && blog.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.categories.map((cat: string) => (
                  <span key={cat} className="px-3 py-1 bg-zinc-100 text-zinc-600 border border-zinc-200 text-xs font-bold uppercase tracking-wider rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            )}
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 font-medium py-6 mt-8 border-t border-zinc-200">
              <div className="flex items-center gap-3">
                {blog.author?.profilePicture ? (
                  <img 
                    src={blog.author.profilePicture} 
                    alt={authorName} 
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase shrink-0">
                    {authorName[0]}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-bold text-zinc-900">{authorName}</span>
                  <span className="text-xs">{authorRole}</span>
                </div>
              </div>
              
              <div className="w-px h-8 bg-zinc-200 hidden sm:block"></div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(blog.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {blog.readingTime || 5} min read
              </div>
            </div>
          </div>

          {/* Right Side: Image — 40% */}
          {blog.featuredImage && (
            <div className="w-full lg:w-[40%] shrink-0 order-1 lg:order-2">
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-100 shadow-2xl">
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-[32px] p-6 md:p-8 lg:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* TOC Sidebar */}
          {toc.length > 0 && (
            <aside className="w-full lg:w-[300px] shrink-0 lg:sticky lg:top-32 order-2 lg:order-1">
              <div className="bg-white border border-zinc-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden">
                {/* TOC Header */}
                <div className="px-6 py-5 bg-zinc-50 border-b border-zinc-100">
                  <h4 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    On this page
                  </h4>
                </div>

                {/* TOC Links */}
                <nav className="p-4 flex flex-col gap-0.5">
                  {toc.map((heading, idx) => (
                    <a 
                      key={heading.id} 
                      href={`#${heading.id}`}
                      className={`group flex items-start gap-3 px-3 py-2.5 rounded-lg text-[13px] leading-snug transition-all duration-200 ${
                        activeId === heading.id 
                          ? "bg-primary/10 text-primary font-semibold" 
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                      }`}
                    >
                      <span className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold mt-0.5 transition-colors ${
                        activeId === heading.id
                          ? "bg-primary text-white"
                          : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200 group-hover:text-zinc-600"
                      }`}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="line-clamp-2">{heading.text}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="w-full flex-1 max-w-3xl order-1 lg:order-2 bg-white border border-zinc-200/80 rounded-3xl p-6 md:p-10 lg:p-12 shadow-sm">
            <article 
              className="prose prose-lg prose-zinc prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary-hover max-w-none prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-zinc-200">
                {blog.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-600 border border-zinc-200 text-xs font-medium rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Box */}
            <div className="mt-16 bg-zinc-50/50 shadow-sm border border-zinc-200/80 rounded-2xl p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {blog.author?.profilePicture ? (
                <img 
                  src={blog.author.profilePicture} 
                  alt={authorName} 
                  className="w-20 h-20 rounded-full object-cover border border-zinc-200 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl uppercase shrink-0">
                  {authorName[0]}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold mb-1 text-zinc-900">{authorName}</h3>
                <p className="text-sm text-primary font-semibold mb-3">{authorRole}</p>
                {authorDesc && (
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {authorDesc}
                  </p>
                )}
              </div>
            </div>

            {/* Social Sharing */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
              <span className="font-bold text-lg text-zinc-800">Share this article:</span>
              <div className="flex items-center gap-3">
                <a 
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blog.title)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white hover:bg-primary hover:text-white border border-zinc-200 shadow-sm flex items-center justify-center transition-colors"
                >
                  <TwitterIcon className="w-4 h-4" />
                </a>
                <a 
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(blog.title)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white hover:bg-primary hover:text-white border border-zinc-200 shadow-sm flex items-center justify-center transition-colors"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white hover:bg-primary hover:text-white border border-zinc-200 shadow-sm flex items-center justify-center transition-colors"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
                <button 
                  onClick={handleCopyLink}
                  className="w-10 h-10 rounded-full bg-white hover:bg-primary hover:text-white border border-zinc-200 shadow-sm flex items-center justify-center transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {blog.allowComments && (
              <div className="mt-16 pt-12 border-t border-zinc-200/80">
                <h3 className="text-2xl font-extrabold text-zinc-900 mb-8 flex items-center gap-3">
                  Discussion 
                  <span className="text-sm font-semibold bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full border border-zinc-200">
                    {comments.length}
                  </span>
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-6 md:p-8 mb-10">
                  <h4 className="font-bold text-zinc-800 mb-2">Join the conversation</h4>
                  <p className="text-xs text-zinc-500 mb-6">Your email address will not be published. Required fields are marked *</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Name *</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all px-4 py-3 rounded-xl text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Email *</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all px-4 py-3 rounded-xl text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Comment *</label>
                    <textarea 
                      required
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your comment here..."
                      className="w-full border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all px-4 py-3 rounded-xl text-sm bg-white resize-y"
                    />
                  </div>

                  {submitError && (
                    <div className="p-4 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                      {submitError}
                    </div>
                  )}

                  {submitSuccess && (
                    <div className="p-4 mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl">
                      Comment submitted successfully!
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-black font-bold py-3 px-6 rounded-xl hover:bg-primary-hover transition-colors text-sm shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Comment"}
                  </button>
                </form>

                {/* Comment List */}
                <div className="space-y-6">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4 p-5 rounded-2xl border border-zinc-100 bg-zinc-50/30">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase shrink-0">
                          {comment.name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1.5">
                            <span className="font-bold text-sm text-zinc-900">{comment.name}</span>
                            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                              {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                          <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/10">
                      <p className="text-zinc-400 text-sm font-medium">No comments yet. Be the first to join the discussion!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Related Blogs */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <section className="py-20 bg-zinc-50 border-t border-zinc-200">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold mb-12 text-center text-zinc-900">Related Articles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((rblog) => (
                <Link key={rblog.id} href={`/blogs/${rblog.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-zinc-200 transition-all hover:shadow-lg hover:-translate-y-1">
                  {rblog.featuredImage ? (
                    <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
                      <img
                        src={rblog.featuredImage}
                        alt={rblog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="relative h-48 w-full bg-zinc-100 flex items-center justify-center">
                      <span className="text-zinc-400 font-medium">No Image</span>
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(rblog.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-3 line-clamp-2 text-zinc-900 group-hover:text-primary transition-colors">
                      {rblog.title}
                    </h3>
                    
                    <div className="mt-auto pt-4 border-t border-zinc-100 flex justify-between items-center text-sm font-semibold text-primary">
                      Read Article <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqs && (
        <div className="border-t border-border">
          <FaqSection 
            {...faqs} 
            graphicImage={faqsGraphic ? (typeof faqsGraphic === 'object' ? faqsGraphic.url || faqsGraphic.src : faqsGraphic) : undefined} 
          />
        </div>
      )}
    </div>
  );
}
