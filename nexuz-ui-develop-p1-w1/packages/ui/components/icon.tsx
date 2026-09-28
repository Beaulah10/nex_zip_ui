type IconVariant = "outlined" | "rounded" | "sharp";

type IconProps = {
	name: string;
	size?: number;
	className?: string;
	color?: string;
	fill?: 0 | 1;
	wght?: number;
	grad?: number;
	opsz?: number;
	variant?: IconVariant;
};

export default function Icon({
	name,
	size = 24,
	className = "",
	color = "text-primary-600",
	fill = 0,
	wght = 400,
	grad = 0,
	opsz = 24,
	variant = "outlined",
}: IconProps) {
	const fontVariationSettings = `"FILL" ${fill}, "wght" ${wght}, "GRAD" ${grad}, "opsz" ${opsz}`;

	return (
		<span
			className={`material-symbols-${variant} ${color} ${className}`}
			style={{ fontSize: size, fontVariationSettings }}
			aria-hidden="true"
		>
			{name}
		</span>
	);
}
