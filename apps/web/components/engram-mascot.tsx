import Image from "next/image";

type EngramMascotProps = {
  size?: number;
  className?: string;
};

export function EngramMascot({ size = 48, className }: EngramMascotProps) {
  return (
    <Image
      src="/assets/engramloop-mascot.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className ? `engram-mascot ${className}` : "engram-mascot"}
      draggable={false}
    />
  );
}
