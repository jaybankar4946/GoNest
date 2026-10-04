import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({
  label,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <input
        {...props}
        className={`
          h-12
          w-full
          rounded-2xl
          border border-slate-200
          bg-white
          px-4
          text-slate-900
          placeholder:text-slate-400
          outline-none
          transition
          duration-200
          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-100
          ${className}
        `}
      />
    </div>
  );
}
