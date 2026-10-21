export function LulaFace({ size = 28 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/lula.png"
      alt=""
      width={size}
      height={size}
      aria-hidden
      className="lula-blink object-cover drop-shadow-md"
      style={{
        width: size,
        height: size,
        borderRadius: "9999px",
        border: "2px solid #7f1d1d",
        background: "#fff",
      }}
    />
  );
}
