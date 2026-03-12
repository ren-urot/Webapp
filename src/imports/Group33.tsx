import svgPaths from "./svg-xush5duo2x";

function Icon() {
  return (
    <svg className="w-[90px] h-[88px]" fill="none" viewBox="0 0 110.853 108.821">
      <g id="Group">
        <path d={svgPaths.pda0b600} fill="var(--fill-0, #FF4E00)" id="Vector" />
        <path d={svgPaths.p335cb300} fill="var(--fill-0, #FF4E00)" id="Vector_2" />
        <path d={svgPaths.p5d95e70} fill="var(--fill-0, #FF4E00)" id="Vector_3" />
        <path d={svgPaths.p131616f0} fill="var(--fill-0, #FF4E00)" id="Vector_4" />
      </g>
    </svg>
  );
}

export default function Group1() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-white border-[#e9e9e9] border-[1.465px] border-solid inset-0 rounded-[17.582px]" />
      <div className="relative size-full flex flex-col items-center justify-center gap-2 sm:gap-4 p-3">
        <Icon />
        <p className="font-['Inter',sans-serif] font-medium text-[#ff4e00] text-[18px] sm:text-[30px] leading-[normal] text-center sm:whitespace-nowrap">Inventory</p>
      </div>
    </div>
  );
}