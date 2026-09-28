import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const inputVariants = cva(
	"w-full min-w-0 rounded-md border border-base-300 bg-white px-3 py-1 font-normal text-brand-japan-black shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary-800 selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-foreground file:text-sm placeholder:text-base-600 dark:bg-white dark:aria-invalid:ring-destructive/40",
	{
		variants: {
			inputSize: {
				sm: "h-8 px-2 py-1 text-sm",
				md: "h-11 px-4 py-2.5 text-base leading-6",
				lg: "h-13 px-4 py-1 text-lg",
			},
		},
		defaultVariants: {
			inputSize: "md",
		},
	},
);

type InputProps = React.ComponentProps<"input"> & VariantProps<typeof inputVariants>;

function Input({ className, type, inputSize, ...props }: InputProps) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				//disabled
				"disabled:pointer-events-none disabled:cursor-not-allowed disabled:placeholder:text-base-300",

				//aria-invalid,
				"aria-invalid:border-danger-600 aria-invalid:focus-visible:border-2 aria-invalid:focus-visible:border-primary-600",

				//onfoccus
				"focus-visible:border-2 focus-visible:border-primary-600",
				inputVariants({ inputSize }),
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
