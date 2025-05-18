
const LoadingThreedot = ({loading}:{loading:boolean}) => {
  return (
    <div className="flex items-start gap-3 w-full">
        <div className="flex gap-2 w-full justify-center px-2 py-1">
          <div className={`h-1.5 w-1.5 bg-primary/60 ${loading ? "rounded-full animate-bounce" : ""}`} />
          <div className={`h-1.5 w-1.5 bg-primary/60 ${loading ? "rounded-full animate-bounce [animation-delay:0.2s]" : ""}`} />
          <div className={`h-1.5 w-1.5 bg-primary/60 ${loading ? "rounded-full animate-bounce [animation-delay:0.4s]" : ""}`} />
        </div>
    </div>

  )
}

export default LoadingThreedot;
