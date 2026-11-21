import React, { useState, useMemo } from 'react';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import { BlogPost, BlogCategory } from '../../types';

interface Props {
  posts: BlogPost[];
  categories: BlogCategory[];
  onSelectPost: (slug: string) => void;
}

export const BlogList: React.FC<Props> = ({ posts, categories, onSelectPost }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesCat =
        selectedCategory === 'all' ||
        p.categories?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        p.tags?.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return posts.find((p) => p.featured) || posts[0];
  }, [posts]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* Title & Introduction */}
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Knowledge Base &amp; Mathematical Guides
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Step-by-step mathematical explanations, formula derivations, financial frameworks, and health calculation guides supporting Numeriq tools.
        </p>
      </div>

      {/* Featured Spotlight Article */}
      {featuredPost && selectedCategory === 'all' && !searchQuery && (
        <a
          href={`/guide/${featuredPost.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onSelectPost(featuredPost.slug);
          }}
          className="block group relative p-6 sm:p-8 rounded-3xl bg-slate-900 text-white dark:bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-lg overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="text-indigo-400 font-semibold">Featured Guide</span>
              <span aria-hidden="true">·</span>
              <span>{featuredPost.categories}</span>
              <span aria-hidden="true">·</span>
              <span>{featuredPost.read_time} min read</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              {featuredPost.title}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 line-clamp-2">
              {featuredPost.excerpt}
            </p>

            <div className="pt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
              <span>Read Full Guide</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </a>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Guides ({posts.length})
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.name
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            aria-label="Search knowledge guides"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <a
              key={post.id}
              href={`/guide/${post.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectPost(post.slug);
              }}
              className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{post.categories}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.read_time} min read</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>By {post.author}</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  Read article →
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
          <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No guides match your search criteria
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try searching for terms like &quot;BMI&quot;, &quot;Interest&quot;, &quot;Mortgage&quot;, or &quot;Tax&quot;.
          </p>
        </div>
      )}
    </div>
  );
};
