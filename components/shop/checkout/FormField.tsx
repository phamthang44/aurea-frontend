import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea";
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  className?: string;
}

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  register,
  error,
  className,
}: FormFieldProps) {
  const inputClassName =
    "bg-transparent border-0 border-b border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:border-[#d4b483] dark:focus:border-[#d4b483] focus:outline-none focus:ring-1 focus:ring-[#d4b483]/30 transition-all duration-300 px-0 py-3 rounded-none";

  const textareaClassName =
    "bg-transparent border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:border-[#d4b483] dark:focus:border-[#d4b483] focus:outline-none focus:ring-1 focus:ring-[#d4b483]/30 transition-all duration-300 px-4 py-3 rounded-lg min-h-24 resize-none";

  return (
    <div className="relative">
      <Label
        htmlFor={id}
        className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block uppercase tracking-wide"
        style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      >
        {label}
      </Label>
      {type === "textarea" ? (
        <Textarea
          id={id}
          {...register}
          className={textareaClassName}
          placeholder={placeholder}
          style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
        />
      ) : (
        <Input
          id={id}
          type={type}
          {...register}
          className={inputClassName}
          placeholder={placeholder}
          style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
        />
      )}
      {error && (
        <p
          className="text-xs text-red-600 dark:text-red-400 mt-1"
          style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
