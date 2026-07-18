import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

/** Whitelist aligned with web_frontend_react.md §3.2 */
const SAFE_MARKDOWN_SCHEMA = {
  ...defaultSchema,
  tagNames: ['p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'code', 'h2', 'h3', 'h4'],
  attributes: {
    ...defaultSchema.attributes,
    a: ['href', 'title', 'rel', 'target'],
    code: [],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto'],
  },
};

const markdownComponents: Components = {
  a: ({ href, children, title }) => (
    <a
      href={href}
      title={title}
      rel="noopener noreferrer"
      target="_blank"
      className="font-bold text-ink-soft underline-offset-2 hover:underline"
    >
      {children}
    </a>
  ),
  h2: ({ children }) => (
    <h2 className="label-chrome mt-6 text-ink first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="label-chrome mt-4 text-ink-soft">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-3 text-sm font-bold text-ink">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-ink-soft mt-2 text-xs leading-relaxed sm:text-sm">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="text-ink-soft mt-2 list-disc space-y-1 pl-5 text-xs sm:text-sm">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-ink-soft mt-2 list-decimal space-y-1 pl-5 text-xs sm:text-sm">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-bold text-ink">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="rounded-xs border border-chrome-indigo/40 bg-sky px-1.5 py-0.5 text-[0.85em] text-ink">
      {children}
    </code>
  ),
};

type SafeMarkdownProps = {
  content: string;
  className?: string;
};

export function SafeMarkdown({ content, className }: SafeMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, SAFE_MARKDOWN_SCHEMA]]}
        components={markdownComponents}
        skipHtml
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
