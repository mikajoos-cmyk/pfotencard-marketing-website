export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main pad (bottom center) */}
      <ellipse
        cx="50"
        cy="70"
        rx="18"
        ry="22"
        fill="currentColor"
        className="text-primary"
      />
      
      {/* Top left toe */}
      <ellipse
        cx="25"
        cy="35"
        rx="10"
        ry="14"
        fill="currentColor"
        className="text-primary"
        transform="rotate(-15 25 35)"
      />
      
      {/* Top center-left toe */}
      <ellipse
        cx="38"
        cy="25"
        rx="10"
        ry="14"
        fill="currentColor"
        className="text-primary"
        transform="rotate(-5 38 25)"
      />
      
      {/* Top center-right toe */}
      <ellipse
        cx="62"
        cy="25"
        rx="10"
        ry="14"
        fill="currentColor"
        className="text-primary"
        transform="rotate(5 62 25)"
      />
      
      {/* Top right toe */}
      <ellipse
        cx="75"
        cy="35"
        rx="10"
        ry="14"
        fill="currentColor"
        className="text-primary"
        transform="rotate(15 75 35)"
      />
    </svg>
  );
}
