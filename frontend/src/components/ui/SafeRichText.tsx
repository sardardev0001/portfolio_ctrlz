import Markdown from "react-markdown";

function safeUrl(url: string) {
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (url.startsWith("#")) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? url : "";
  } catch {
    return "";
  }
}

export default function SafeRichText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={`safe-rich-text ${className}`}>
      <Markdown
        skipHtml
        urlTransform={safeUrl}
        components={{
          a: ({ href, children }) => (
            <a
              href={href || undefined}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ alt }) => <span>{alt}</span>,
        }}
      >
        {text}
      </Markdown>
    </div>
  );
}
