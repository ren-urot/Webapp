import svgPaths from "./svg-vqe5ncq079";

function Icon() {
  return (
    <svg className="w-[90px] h-[90px]" fill="none" viewBox="0 0 107.307 107.329">
      <g id="Group">
        <path d={svgPaths.p30d7bc00} fill="var(--fill-0, #FF4E00)" id="Vector" />
        <path d={svgPaths.p22e0aa80} fill="var(--fill-0, #FF4E00)" id="Vector_2" />
        <path d={svgPaths.p3443fa00} fill="var(--fill-0, #FF4E00)" id="Vector_3" />
        <path d={svgPaths.pbb0e000} fill="var(--fill-0, #FF4E00)" id="Vector_4" />
        <path d={svgPaths.p14228400} fill="var(--fill-0, #FF4E00)" id="Vector_5" />
        <path d={svgPaths.p1ac02d00} fill="var(--fill-0, #FF4E00)" id="Vector_6" />
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
        <p className="font-['Inter',sans-serif] font-medium text-[#ff4e00] text-[18px] sm:text-[30px] leading-[normal] text-center sm:whitespace-nowrap">{`Sales & Orders`}</p>
      </div>
    </div>
  );
}