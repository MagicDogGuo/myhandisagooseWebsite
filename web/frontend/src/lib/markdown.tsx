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
    <a href={href} title={title} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  ),
  h2: ({ children }) => (
    <h2 className="font-display mt-8 text-2xl tracking-tight first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-display mt-6 text-xl tracking-tight">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-4 text-lg font-semibold">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-muted-foreground mt-3 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-muted-foreground mt-3 list-disc space-y-1 pl-5">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-muted-foreground mt-3 list-decimal space-y-1 pl-5">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="text-foreground font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="bg-secondary rounded px-1.5 py-0.5 text-sm">{children}</code>
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
