import React from 'react';

interface MultiLineChartProps {
    data: {
        label: string,
        values: { label: string, value: number }[]
    }[];
    width?: number;
    height?: number;
}

const MultiLineChart: React.FC<MultiLineChartProps> = ({
    data,
    width = 600,
    height = 300,
}) => {
    if (data.length === 0 || data[0].values.length === 0) {
        return (
            <div className="flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem]" style={{ width, height }}>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin datos suficientes</p>
            </div>
        );
    }

    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find max value across all datasets
    let maxValue = 1;
    data.forEach(series => {
        series.values.forEach(v => {
            if (v.value > maxValue) maxValue = v.value;
        });
    });

    const numPoints = data[0].values.length;
    const xLabels = data[0].values.map(v => v.label);

    const colors = [
        '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#475569'
    ];

    return (
        <div className="w-full flex flex-col items-center">
            <svg width={width} height={height} className="overflow-visible">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padding + chartHeight - ratio * chartHeight;
                    return (
                        <React.Fragment key={i}>
                            <line
                                x1={padding}
                                y1={y}
                                x2={width - padding}
                                y2={y}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                            />
                            <text
                                x={padding - 10}
                                y={y}
                                textAnchor="end"
                                dominantBaseline="middle"
                                className="text-[10px] font-bold fill-slate-300"
                            >
                                {Math.round(ratio * maxValue)}h
                            </text>
                        </React.Fragment>
                    );
                })}

                {/* X Axis labels */}
                {xLabels.map((label, i) => {
                    const x = padding + (i / (numPoints - 1 || 1)) * chartWidth;
                    return (
                        <text
                            key={i}
                            x={x}
                            y={height - padding + 20}
                            textAnchor="middle"
                            className="text-[9px] font-black fill-slate-400 uppercase tracking-tighter"
                        >
                            {label}
                        </text>
                    );
                })}

                {/* Lines */}
                {data.map((series, seriesIndex) => {
                    const color = colors[seriesIndex % colors.length];
                    const points = series.values.map((v, i) => {
                        const x = padding + (i / (numPoints - 1 || 1)) * chartWidth;
                        const y = padding + chartHeight - (v.value / maxValue) * chartHeight;
                        return { x, y };
                    });

                    const pathData = points
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                        .join(' ');

                    return (
                        <g key={seriesIndex}>
                            <path
                                d={pathData}
                                fill="none"
                                stroke={color}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all hover:stroke-[4px]"
                            />
                            {points.map((p, i) => (
                                <circle
                                    key={i}
                                    cx={p.x}
                                    cy={p.y}
                                    r="4"
                                    fill="white"
                                    stroke={color}
                                    strokeWidth="2"
                                    className="cursor-pointer"
                                />
                            ))}
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap justify-center gap-4 max-w-4xl px-4">
                {data.map((series, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-0.5" style={{ backgroundColor: colors[i % colors.length] }} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{series.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MultiLineChart;
