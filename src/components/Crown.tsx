type CrownType = "basic" | "ornate"

const shadow = "drop-shadow(0 1px 2px rgba(0,0,0,0.45))"

export default function Crown({ type }: { type: CrownType }) {
  if (type === "basic") {
    return (
      <svg
        width="14" height="10"
        viewBox="0 0 20 14"
        className="inline-block align-middle ml-3 mr-1 flex-shrink-0"
        style={{ filter: shadow }}
        aria-label="Promoted from Thought"
      >
        <polyline
          points="1,12 10,2 19,12"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // Ornate: two stacked stroke chevrons matching the basic style
  return (
    <svg
      width="17" height="19"
      viewBox="-2 -2 24 24"
      className="inline-block align-middle ml-3 mr-1 flex-shrink-0"
      style={{ filter: shadow }}
      aria-label="Promoted from Thought through Idea"
    >
      <polyline
        points="1,8 10,1 19,8"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="1,16 10,9 19,16"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
