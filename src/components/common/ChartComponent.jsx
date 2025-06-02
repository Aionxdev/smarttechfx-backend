// src/components/common/ChartComponent.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
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
    Filler
} from 'chart.js';
import Spinner from './Spinner';
import './ChartComponent.css';

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

const ChartComponent = ({ type = 'line', data, options, title, isLoading, className = '' }) => {
    if (isLoading) {
        return (
            <div className={`chart-loading-container ${className}`}>
                <Spinner message="Loading chart data..." />
            </div>
        );
    }

    if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
        return (
            <div className={`chart-empty-container ${className}`}>
                <p>No data available for this chart.</p>
            </div>
        );
    }

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: document.documentElement.style.getPropertyValue('--theme-text-secondary') || '#6c757d', // Get from CSS vars
                }
            },
            title: {
                display: !!title,
                text: title,
                color: document.documentElement.style.getPropertyValue('--theme-text-primary') || '#212529',
                font: { size: 16 }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
            }
        },
        scales: (type === 'line' || type === 'bar') ? {
            x: {
                grid: {
                    color: document.documentElement.style.getPropertyValue('--theme-border-divider') || '#e9ecef',
                },
                ticks: {
                    color: document.documentElement.style.getPropertyValue('--theme-text-muted') || '#6c757d',
                }
            },
            y: {
                grid: {
                    color: document.documentElement.style.getPropertyValue('--theme-border-divider') || '#e9ecef',
                },
                ticks: {
                    color: document.documentElement.style.getPropertyValue('--theme-text-muted') || '#6c757d',
                }
            }
        } : {},
        // Ensure chart colors update with theme (this is a bit of a hack, better to pass theme vars)
        ...(JSON.parse(JSON.stringify({
            themeColors: {
                primary: getComputedStyle(document.documentElement).getPropertyValue('--theme-primary-main').trim(),
                accentGreen: getComputedStyle(document.documentElement).getPropertyValue('--theme-accent-green').trim(),
                textPrimary: getComputedStyle(document.documentElement).getPropertyValue('--theme-text-primary').trim(),
                textSecondary: getComputedStyle(document.documentElement).getPropertyValue('--theme-text-secondary').trim(),
                borderDivider: getComputedStyle(document.documentElement).getPropertyValue('--theme-border-divider').trim(),
            }
        }))),
    };

    const chartOptions = { ...defaultOptions, ...options };
    // Update colors dynamically based on current theme by re-evaluating CSS vars
    // This is more robust if options are memoized or theme changes
    if (chartOptions.plugins.legend) chartOptions.plugins.legend.labels.color = getComputedStyle(document.documentElement).getPropertyValue('--theme-text-secondary').trim();
    if (chartOptions.plugins.title) chartOptions.plugins.title.color = getComputedStyle(document.documentElement).getPropertyValue('--theme-text-primary').trim();
    if (chartOptions.scales?.x) {
        chartOptions.scales.x.grid.color = getComputedStyle(document.documentElement).getPropertyValue('--theme-border-divider').trim();
        chartOptions.scales.x.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--theme-text-muted').trim();
    }
    if (chartOptions.scales?.y) {
        chartOptions.scales.y.grid.color = getComputedStyle(document.documentElement).getPropertyValue('--theme-border-divider').trim();
        chartOptions.scales.y.ticks.color = getComputedStyle(document.documentElement).getPropertyValue('--theme-text-muted').trim();
    }


    let ChartToRender;
    switch (type.toLowerCase()) {
        case 'bar': ChartToRender = Bar; break;
        case 'pie': ChartToRender = Pie; break;
        case 'doughnut': ChartToRender = Doughnut; break;
        case 'line':
        default: ChartToRender = Line; break;
    }

    return (
        <div className={`chart-container ${className}`}>
            <ChartToRender data={data} options={chartOptions} />
        </div>
    );
};

ChartComponent.propTypes = {
    type: PropTypes.oneOf(['line', 'bar', 'pie', 'doughnut']),
    data: PropTypes.object.isRequired, // Chart.js data object
    options: PropTypes.object,         // Chart.js options object
    title: PropTypes.string,
    isLoading: PropTypes.bool,
    className: PropTypes.string,
};

export default ChartComponent;