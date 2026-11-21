import React, { useState } from 'react';
import { ArrowLeft, Share2, Bookmark, BookmarkCheck, Calculator, ArrowRight } from 'lucide-react';
import { BlogPost } from '../../types';
import { getRelatedCalculatorForPost } from '../../data';

interface Props {
  post: BlogPost;
  onBack: () => void;
  onSelectCalculator?: (slug: string) => void;
  onSelectPost?: (slug: string) => void;
  relatedPosts?: BlogPost[];
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export const BlogPostView: React.FC<Props> = ({
  post,
  onBack,
  onSelectCalculator,
  onSelectPost,
  relatedPosts = [],
  isSaved,
  onToggleSave,
}) => {
  const [copied, setCopied] = useState(false);
  const relatedCalc = getRelatedCalculatorForPost(post.slug);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Markdown inline parser supporting **bold**, `code`, and [label](url)
  const renderInline = (text: string): React.ReactNode[] => {
    const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-[0.875em]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const isInternalCalc = href.startsWith('/calculator/');
        const isInternalGuide = href.startsWith('/guide/');
        const isInternal = href.startsWith('/');
        return (
          <a
            key={i}
            href={href}
            target={isInternal ? undefined : '_blank'}
            rel={isInternal ? undefined : 'noopener noreferrer'}
            onClick={(e) => {
              if (isInternalCalc && onSelectCalculator) {
                e.preventDefault();
                onSelectCalculator(href.replace('/calculator/', ''));
              } else if (isInternalGuide && onSelectPost) {
                e.preventDefault();
                onSelectPost(href.replace('/guide/', ''));
              }
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            {label}
          </a>
        );
      }
      return part;
    });
  };

  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let inList = false;
    let listItems: string[] = [];

    const flushList = () => {
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1.5 my-4 text-slate-700 dark:text-slate-300">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushTable = () => {
      if (inTable && tableRows.length > 0) {
        const header = tableRows[0];
        const body = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^[-:]+$/)));
        elements.push(
          <div key={`table-${elements.length}`} className="my-6 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold font-mono">
                <tr>
                  {header.map((col, idx) => (
                    <th key={idx} className="py-2.5 px-3.5">
                      {col.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                {body.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3.5 font-mono">
                        {renderInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushList();
        inTable = true;
        const cols = line
          .trim()
          .slice(1, -1)
          .split('|');
        tableRows.push(cols);
        continue;
      } else if (inTable) {
        flushTable();
      }

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        inList = true;
        listItems.push(line.trim().slice(2));
        continue;
      } else if (inList) {
        flushList();
      }

      if (line.startsWith('## ')) {
        const text = line.slice(3).trim();
        elements.push(
          <h2
            key={`h2-${i}`}
            id={text.toLowerCase().replace(/[^\w]+/g, '-')}
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-8 mb-3 pt-2"
          >
            {text}
          </h2>
        );
        continue;
      }

      if (line.startsWith('### ')) {
        const text = line.slice(4).trim();
        elements.push(
          <h3
            key={`h3-${i}`}
            id={text.toLowerCase().replace(/[^\w]+/g, '-')}
            className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-2"
          >
            {text}
          </h3>
        );
        continue;
      }

      if (!line.trim()) {
        continue;
      }

      elements.push(
        <p key={`p-${i}`} className="my-3 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          {renderInline(line)}
        </p>
      );
    }

    flushList();
    flushTable();

    return elements;
  };

  const headings = post.content
    .split('\n')
    .filter((l) => l.startsWith('## '))
    .map((l) => {
      const text = l.slice(3).trim();
      return {
        text,
        id: text.toLowerCase().replace(/[^\w]+/g, '-'),
      };
    });

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Knowledge Hub</span>
        </button>

        <div className="flex items-center gap-2">
          {onToggleSave && (
            <button
              type="button"
              onClick={onToggleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      <header className="space-y-4 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{post.categories}</span>
          <span aria-hidden="true">·</span>
          <span>{post.read_time} min read</span>
          <span aria-hidden="true">·</span>
          <span>By {post.author}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={String(post.updated_at || post.created_at || '2026-11-20')}>
            Updated {String(post.updated_at || post.created_at || '2026-11-20').split('T')[0]}
          </time>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
          {post.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
          {post.excerpt}
        </p>
      </header>

      {relatedCalc && onSelectCalculator && (
        <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block mb-0.5">
                Interactive Companion Tool
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {relatedCalc.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-xl">
                {relatedCalc.description}
              </p>
            </div>
          </div>

          <a
            href={`/calculator/${relatedCalc.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectCalculator(relatedCalc.slug);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold whitespace-nowrap transition-colors shadow-xs cursor-pointer self-start sm:self-center"
          >
            <span>Launch Calculator</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 prose-slate max-w-none space-y-6">
          <div>{renderMarkdown(post.content)}</div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-700 dark:text-slate-300">Editorial &amp; Informational Notice: </strong>
            This guide is published by the Numeriq Editorial Team for educational reference. Formulas and statutory benchmarks are reviewed periodically for accuracy, though individual financial, tax, engineering, or health decisions should be verified with a qualified professional. See our{' '}
            <a href="/about" className="text-indigo-600 dark:text-indigo-400 underline">Editorial Standards</a>,{' '}
            <a href="/disclaimer" className="text-indigo-600 dark:text-indigo-400 underline">Disclaimers</a>, and{' '}
            <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 underline">Privacy Policy</a>.
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          {headings.length > 0 && (
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 block mb-3">
                Table of Contents
              </span>
              <nav className="space-y-1.5 text-xs">
                {headings.map((h, i) => (
                  <a
                    key={i}
                    href={`#${h.id}`}
                    className="block text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 py-1 transition-colors leading-snug"
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 block">
                More in this Category
              </span>
              <div className="space-y-2.5">
                {relatedPosts.slice(0, 4).map((rel) => (
                  <a
                    key={rel.id}
                    href={`/guide/${rel.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectPost?.(rel.slug);
                    }}
                    className="group block p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                      {rel.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {rel.read_time} min read
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
};
