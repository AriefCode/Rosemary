export default function ShinyText({ children, className = "" }) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: "linear-gradient(90deg, #012d1d 20%, #40916c 45%, #74c69d 55%, #012d1d 80%)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
        animation: "shiny-text 3s linear infinite",
      }}
    >
      {children}
    </span>
  );
}
