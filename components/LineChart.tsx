import React from 'react';

interface LineChartProps {
    data: { label: string; value: number }[];
    width?: number;
    height?: number;
    color?: string;
    showGrid?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
    data,
    width = 600,
    height = 200,
    color = '#6366f1',
    showGrid = true
}) => {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ width, height }}>
                <p className="text-xs text-slate-400 font-bold uppercase">Sin datos</p>
            </div>
        );
    }

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const minValue = 0;
    const valueRange = maxValue - minValue;

    // Calculate points
    const points = data.map((item, index) => {
        const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
        const y = padding + chartHeight - ((item.value - minValue) / (valueRange || 1)) * chartHeight;
        return { x, y, ...item };
    });

    // Create path
    const pathData = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');

    // Create area path (for gradient fill)
    const areaPath = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

    // Grid lines
    const gridLines = [];
    if (showGrid) {
        const numLines = 5;
        for (let i = 0; i <= numLines; i++) {
            const y = padding + (i / numLines) * chartHeight;
            gridLines.push(
                <line
                    key={`grid-${i}`}
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                />
            );
        }
    }

    return (
        <div className="w-full">
            <svg width={width} height={height} className="overflow-visible">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                    </linearGradient>
                </defs>

                {/* Grid */}
                {gridLines}

                {/* Area fill */}
                <path d={areaPath} fill="url(#lineGradient)" />

                {/* Line */}
                <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points */}
                {points.map((point, index) => (
                    <g key={index}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="5"
                            fill="white"
                            stroke={color}
                            strokeWidth="3"
                            className="cursor-pointer hover:r-6 transition-all"
                        />
                        {/* Value label on hover */}
                        <title>{`${point.label}: ${point.value}`}</title>
                    </g>
                ))}

                {/* X-axis labels */}
                {points.map((point, index) => {
                    // Show every nth label to avoid crowding
                    const showEvery = Math.ceil(data.length / 8);
                    if (index % showEvery === 0 || index === data.length - 1) {
                        return (
                            <text
                                key={`label-${index}`}
                                x={point.x}
                                y={height - padding + 20}
                                textAnchor="middle"
                                className="text-[10px] font-bold fill-slate-400"
                            >
                                {point.label}
                            </text>
                        );
                    }
                    return null;
                })}

                {/* Y-axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                    const value = Math.round(minValue + ratio * valueRange);
                    const y = padding + chartHeight - ratio * chartHeight;
                    return (
                        <text
                            key={`y-label-${index}`}
                            x={padding - 10}
                            y={y}
                            textAnchor="end"
                            dominantBaseline="middle"
                            className="text-[10px] font-bold fill-slate-400"
                        >
                            {value}h
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

export default LineChart;
