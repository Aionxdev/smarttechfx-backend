// src/components/common/InputField.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './InputField.css'; // Assuming InputField.css for styles

const InputField = ({
    type = 'text',
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    label,
    error,
    disabled = false,
    required = false,
    className = '',
    inputClassName = '',
    labelClassName = '',
    errorClassName = '',
    leftIcon,
    rightIcon,
    wrapperClassName = '',
    ...props // Other native input props (e.g., min, max, step for number)
}) => {
    const fieldId = name || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
        <div className={`input-field-wrapper ${error ? 'has-error' : ''} ${wrapperClassName} ${className}`}>
            {label && (
                <label htmlFor={fieldId} className={`input-label ${labelClassName}`}>
                    {label} {required && <span className="input-required-asterisk">*</span>}
                </label>
            )}
            <div className="input-container">
                {leftIcon && <span className="input-icon input-icon-left">{leftIcon}</span>}
                <input
                    type={type}
                    id={fieldId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`input-field ${leftIcon ? 'has-left-icon' : ''} ${rightIcon ? 'has-right-icon' : ''} ${inputClassName}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${fieldId}-error` : undefined}
                    {...props}
                />
                {rightIcon && <span className="input-icon input-icon-right">{rightIcon}</span>}
            </div>
            {error && (
                <p id={`${fieldId}-error`} className={`input-error-message ${errorClassName}`} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

InputField.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    placeholder: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string, // Error message string
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    className: PropTypes.string, // For the outermost wrapper
    inputClassName: PropTypes.string, // For the input element itself
    labelClassName: PropTypes.string,
    errorClassName: PropTypes.string,
    leftIcon: PropTypes.node,
    rightIcon: PropTypes.node,
    wrapperClassName: PropTypes.string, // For direct parent of label and input-container
};

export default InputField;