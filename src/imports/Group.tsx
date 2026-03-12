import svgPaths from "./svg-841ax712kw";

function Icon() {
  return (
    <svg className="w-[90px] h-[77px]" fill="none" viewBox="0 0 119.793 102.378">
      <g clipPath="url(#clip0_21_1542)" id="Group 93">
        <path d={svgPaths.p1638c000} fill="var(--fill-0, #FF4E00)" id="Vector" />
        <g id="Group 92">
          <path d={svgPaths.pf370d80} fill="var(--fill-0, #FF4E00)" id="Vector_2" />
          <g id="Group 91">
            <path d={svgPaths.p14a99a00} fill="var(--fill-0, #FF4E00)" id="Vector_3" />
            <path d={svgPaths.pcea6680} fill="var(--fill-0, #FF4E00)" id="Vector_4" />
            <path d={svgPaths.p3d14dc00} fill="var(--fill-0, #FF4E00)" id="Vector_5" />
          </g>
        </g>
      </g>
      <defs>
        <clipPath id="clip0_21_1542">
          <rect fill="white" height="102.378" width="119.793" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default function Group() {
  return (
    <div className="relative size-full" data-name="Group">
      <div className="absolute bg-white border-[#e9e9e9] border-[1.465px] border-solid inset-0 rounded-[17.582px]" />
      <div className="relative size-full flex flex-col items-center justify-center gap-2 sm:gap-4 p-3">
        <Icon />
        <p className="font-['Inter',sans-serif] font-medium text-[#ff4e00] text-[18px] sm:text-[30px] leading-[normal] text-center sm:whitespace-nowrap">Workshops</p>
      </div>
    </div>
  );
}