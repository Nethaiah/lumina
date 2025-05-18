import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import { lucario } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useClipboard } from "@/hooks/useClipboard";
import { useSidebar } from "../ui/sidebar";

export const MarkdownView = ({ text}: {text: string}) => {
  const {open} = useSidebar()
  const {copy, isCopied} = useClipboard()
  
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      children={text}
      components={{
        strong({children}){
          return <strong className="text-primary font-semibold">{children}</strong>
        },
        p({ children }) {
          return <p className="mb-4 leading-relaxed text-foreground/90">{children}</p>
        },
        ul({ children }) {
          return <ul className="pl-6 mb-4 list-disc text-foreground/90">{children}</ul>
        },
        ol({ children }) {
          return <ol className="pl-6 mb-4 list-decimal text-foreground/90">{children}</ol>
        },
        li({ children }) {
          return <li className="mb-2">{children}</li>
        },
        code(props) {
          const {children, className, node, ...rest} = props
          const match = /language-(\w+)/.exec(className || '')
          const codeText = String(children).replace(/\n$/, "")
          
          const handleCopy = () => {
            copy(codeText)
          }
          
          return match ? (
            <div className="my-6 p-2">
              <div className={`max-w-full ${open ? "max-w-[calc(100vw-400px)]" : ""}`}>
                <div className="flex items-center justify-between p-2 bg-primary/90 text-primary-foreground rounded-t-lg border border-border/50">
                  <span className="text-xs font-medium">{`${match[1].toUpperCase()}`}</span>
                  <button
                    onClick={handleCopy}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      isCopied 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                    }`}
                  >
                    {isCopied ? "Copied" : "Copy"}
                  </button>
                </div>
                
                <SyntaxHighlighter
                  {...(rest as any)}
                  PreTag="div"
                  children={codeText}
                  language={match[1]}
                  style={lucario}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    borderRadius: "0 0 0.5rem 0.5rem",
                    border: "1px solid rgba(82, 82, 89, 0.32)",
                    borderTop: "none",
                    background: "rgba(30, 30, 35, 0.5)",
                  }}
                />
              </div>
            </div>
          ) : (
            <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-secondary/30 border border-border/50 text-foreground/90 text-sm">
              {children}
            </code>
          )
        }
      }}
    />
  )
}

export default MarkdownView;
