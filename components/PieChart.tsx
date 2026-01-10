import React from 'react';

interface PieChartProps {
    data: { label: string; value: number; color: string }[];
    size?: number;
}

const PieChart: React.FC<PieChartProps> = ({ data, size = 200 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        return (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                <p className="text-xs text-slate-400 font-bold uppercase">Sin datos</p>
            </div>
        );
    }

    let currentAngle = -90; // Start from top
    const radius = size / 2;
    const center = size / 2;

    const slices = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (item.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        // Convert to radians
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        // Calculate arc path
        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const largeArcFlag = angle > 180 ? 1 : 0;

        const pathData = [
            `M ${center} ${center}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        currentAngle = endAngle;

        return (
            <g key={index}>
                <path
                    d={pathData}
                    fill={item.color}
                    className="transition-opacity hover:opacity-80 cursor-pointer"
                />
                {percentage > 5 && (
                    <text
                        x={center + (radius * 0.7) * Math.cos((startAngle + angle / 2) * Math.PI / 180)}
                        y={center + (radius * 0.7) * Math.sin((startAngle + angle / 2) * Math.PI / 180)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs font-bold fill-white pointer-events-none"
                    >
                        {percentage.toFixed(0)}%
                    </text>
                )}
            </g>
        );
    });

    return (
        <div className="flex flex-col items-center gap-4">
            <svg width={size} height={size} className="drop-shadow-sm">
                {slices}
            </svg>
            <div className="flex flex-wrap gap-3 justify-center max-w-md">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChart;
