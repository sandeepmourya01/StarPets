export default function StarMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 2.2l2.9 6.5 7.1.7-5.3 4.8 1.5 7-6.2-3.6-6.2 3.6 1.5-7L2 9.4l7.1-.7z"
      />
    </svg>
  );
}
