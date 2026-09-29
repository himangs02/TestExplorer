import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Tag, Sparkles, BookOpen } from "lucide-react";
import BlogFilters, { BlogTags } from "@/components/blogs/blog-filters";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const revalidate = 60;

// Helper to format date like "26 Mar 2025"
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; tag?: string }>;
}) {
  const params = await searchParams;
  
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const tag = params.tag || "";
  const itemsPerPage = 6;

  // 1. Fetch Featured Blogs
  const featuredBlogs = await prisma.blogs.findMany({
    where: { is_featured: true },
    orderBy: { created_at: 'desc' },
    take: 2
  });

  // 2. Build Query for All Articles
  const whereClause: any = { is_featured: false };
  if (search) {
    whereClause.title = { contains: search };
  }
  if (tag) {
    whereClause.tags = { contains: `"${tag}"` }; 
  }

  const from = (page - 1) * itemsPerPage;
  
  const [blogs, count] = await Promise.all([
    prisma.blogs.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      skip: from,
      take: itemsPerPage
    }),
    prisma.blogs.count({ where: whereClause })
  ]);
  
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-slate-50/40 to-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Admissions & Strategy Journal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-3">
            Exam Insights & <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Preparation Guides</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            Expert strategies, syllabus changes, admit card notices, and cutoff trends for national entrance examinations.
          </p>
        </div>

        {/* --- SECTION 1: FEATURED ARTICLES --- */}
        {featuredBlogs && featuredBlogs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Featured Stories</h2>
              <Link href="#all-articles" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                <span>View All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {featuredBlogs.map((post) => (
                <div key={post.id} className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                  {/* Image Area */}
                  <div className="relative h-60 bg-slate-100 w-full overflow-hidden">
                    <img 
                      src={post.image_url || '/placeholder.jpg'} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-slate-200 shadow-xs">
                        {Array.isArray(post.tags) ? (post.tags as any)[0] : 'Featured'}
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          {formatDate(post.created_at.toISOString())}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          6 min read
                        </div>
                      </div>

                      <h3 className="text-xl font-extrabold text-slate-900 mb-2.5 leading-snug group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-6 font-medium">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <Link 
                        href={`/blogs/${post.slug}`} 
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors group-hover:gap-2.5"
                      >
                        <span>Read Full Guide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SECTION 2: ALL ARTICLES --- */}
        <div id="all-articles" className="scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Recent Publications</h2>
          </div>
          
          {/* Search Filter */}
          <div className="mb-8">
            <BlogFilters />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs?.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium text-sm">No articles found matching your search criteria.</p>
              </div>
            ) : (
              blogs?.map((post) => (
                <div key={post.id} className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                  
                  {/* Image */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img 
                       src={post.image_url || '/placeholder.jpg'} 
                       alt={post.title}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-slate-200 shadow-2xs">
                        {Array.isArray(post.tags) ? (post.tags as any)[0] : 'Article'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-600" /> {formatDate(post.created_at.toISOString())}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 5 min
                        </span>
                      </div>
                      
                      <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4 font-medium">
                        {post.excerpt}
                      </p>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-100">
                      <Link 
                        href={`/blogs/${post.slug}`} 
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- SECTION 3: PAGINATION & CATEGORIES --- */}
        <div className="space-y-10">
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href={`?page=${Math.max(1, page - 1)}&search=${search}&tag=${tag}#all-articles`} 
                      className={page === 1 ? "pointer-events-none opacity-50" : "bg-white border border-slate-200 hover:bg-slate-50 rounded-xl"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href={`?page=${i + 1}&search=${search}&tag=${tag}#all-articles`}
                        isActive={page === i + 1}
                        className={page === i + 1 ? "bg-slate-900 text-white hover:bg-black rounded-xl" : "bg-white border border-slate-200 hover:bg-slate-50 rounded-xl"}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext 
                      href={`?page=${Math.min(totalPages, page + 1)}&search=${search}&tag=${tag}#all-articles`} 
                      className={page === totalPages ? "pointer-events-none opacity-50" : "bg-white border border-slate-200 hover:bg-slate-50 rounded-xl"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Popular Categories */}
          <div className="border-t border-slate-200/80 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-blue-600" />
              <h3 className="text-lg font-extrabold text-slate-900">Explore by Category</h3>
            </div>
            
            <BlogTags activeTag={tag} />
          </div>

        </div>

      </div>
    </div>
  );
}