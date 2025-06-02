// src/components/dashboard/ChartComponent.jsx
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { CHART_COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../hooks/useTheme'; // Assuming useTheme hook

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ChartComponent = ({ type = 'line', data, options = {}, title, className = '', height = '300px' }) => {
    const { theme } = useTheme(); // Get current theme from context
    const chartRef = useRef(null); // To potentially update chart instance directly if needed

    // Re-evaluate colors based on theme
    const isDarkMode = theme === 'dark';
    const textColor = isDarkMode ? CHART_COLORS.TEXT_LIGHT : CHART_COLORS.TEXT_DARK;
    const gridColor = isDarkMode ? CHART_COLORS.GRID_DARK : CHART_COLORS.GRID_LIGHT;
    const arcBorderColor = isDarkMode ? '#1f2937' : '#ffffff'; // Example card/body background for arc borders

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false, // Crucial for custom height via container
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: textColor,
                    font: { family: 'var(--font-primary)' }
                }
            },
            title: {
                display: !!title,
                text: title,
                color: textColor,
                font: { size: 16, family: 'var(--font-primary)', weight: 'bold' }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.85)',
                titleFont: { family: 'var(--font-primary)', weight: 'bold', size: 14 },
                bodyFont: { family: 'var(--font-primary)', size: 12 },
                padding: 10,
                cornerRadius: 4,
                boxPadding: 4,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }

                        if (type === 'doughnut' || type === 'pie') {
                            if (context.label) { // context.label is the slice label (e.g., 'BTC')
                                label = context.label + ': ';
                            }
                            if (context.parsed !== null && !isNaN(context.parsed)) {
                                label += formatCurrency(context.parsed);
                            } else if (context.raw !== null && !isNaN(context.raw)) { // Fallback for some chart types
                                label += formatCurrency(context.raw);
                            } else {
                                label += 'N/A';
                            }
                        } else { // For line, bar charts
                            if (context.parsed.y !== null && !isNaN(context.parsed.y)) {
                                if (context.dataset.yAxisID === 'yCurrency' || options?.scales?.y?.ticks?.callback?.toString().includes('formatCurrency')) {
                                    label += formatCurrency(context.parsed.y);
                                } else {
                                    label += context.parsed.y;
                                }
                            } else {
                                label += 'N/A';
                            }
                        }
                        return label;
                    }
                }
            }
        },
        scales: (type === 'line' || type === 'bar') ? {
            x: {
                grid: { color: gridColor, drawBorder: false },
                ticks: { color: textColor, font: { family: 'var(--font-primary)' } }
            },
            y: {
                grid: { color: gridColor, drawBorder: false },
                ticks: {
                    color: textColor,
                    font: { family: 'var(--font-primary)' },
                    // Example callback if you want all y-axis ticks to be currency
                    // callback: function(value) { return formatCurrency(value, 0); } // No decimal for axis
                }
            }
        } : {}, // No scales for pie/doughnut
        ...((type === 'doughnut' || type === 'pie') && {
            cutout: type === 'doughnut' ? (options.cutout || '60%') : '0%',
            elements: {
                arc: {
                    borderWidth: options.elements?.arc?.borderWidth || 2,
                    borderColor: options.elements?.arc?.borderColor || arcBorderColor
                }
            }
        })
    };

    // Deep merge options: user-provided 'options' will override defaults
    // A simple spread isn't enough for nested objects like plugins or scales.
    const mergeDeep = (target, source) => {
        const output = { ...target };
        if (typeof target === 'object' && typeof source === 'object') {
            Object.keys(source).forEach(key => {
                if (typeof source[key] === 'object' && key in target && typeof target[key] === 'object') {
                    output[key] = mergeDeep(target[key], source[key]);
                } else {
                    output[key] = source[key];
                }
            });
        }
        return output;
    };
    const mergedOptions = mergeDeep(defaultOptions, options);

    const renderChart = () => {
        // Pass a key that changes with theme to force re-creation if necessary,
        // but changing options object should be enough.
        const chartKey = `${type}-${theme}`;
        switch (type.toLowerCase()) {
            case 'bar':
                return <Bar key={chartKey} ref={chartRef} options={mergedOptions} data={data} />;
            case 'doughnut':
                return <Doughnut key={chartKey} ref={chartRef} options={mergedOptions} data={data} />;
            case 'pie':
                return <Pie key={chartKey} ref={chartRef} options={mergedOptions} data={data} />;
            case 'line':
            default:
                return <Line key={chartKey} ref={chartRef} options={mergedOptions} data={data} />;
        }
    };

    return (
        <div className={`chart-component-wrapper ${className}`} style={{ position: 'relative', height: height, width: '100%' }}>
            {data?.datasets?.[0]?.data?.length > 0 || (type !== 'line' && type !== 'bar' && data?.datasets?.[0]?.data?.some(d => d > 0)) ? (
                renderChart()
            ) : (
                <div className="chart-no-data">
                    <p>No data available to display chart.</p>
                </div>
            )}
        </div>
    );
};

ChartComponent.propTypes = {
    type: PropTypes.oneOf(['line', 'bar', 'doughnut', 'pie']),
    data: PropTypes.object.isRequired,
    options: PropTypes.object,
    title: PropTypes.string,
    className: PropTypes.string,
    height: PropTypes.string, // e.g., '300px', '50vh'
};

export default ChartComponent;