// src/components/common/AccessibleFormField.js

/**
 * Renders an accessible form field with proper labeling and error handling
 * @param {Object} props - Form field properties
 * @returns {string} HTML for the form field
 */
export function renderAccessibleFormField({
  id,
  name,
  label,
  type = 'text',
  value = '',
  required = false,
  error = '',
  autocomplete = '',
  placeholder = '',
  tooltip = '',
  onChange = "this.getRootNode().host.handleInputChange(event)",
  min,
  max,
  options = []
}) {
  const fieldId = id || `field-${name}`;
  const errorId = error ? `${fieldId}-error` : '';
  const hasError = !!error;
  
  // Common attributes for all field types
  const commonAttributes = `
    id="${fieldId}"
    name="${name}" 
    ${required ? 'required' : ''}
    aria-required="${required}"
    aria-invalid="${hasError ? 'true' : 'false'}"
    ${errorId ? `aria-describedby="${errorId}"` : ''}
    data-event-change="${onChange.replace('this.getRootNode().host.', '')}"
  `;
  
  // Field-specific rendering based on type
  let fieldHtml = '';
  
  if (type === 'select' && options.length > 0) {
    // Select dropdown
    fieldHtml = `
      <select ${commonAttributes}>
        ${options.map(option => `
          <option value="${option.value}" ${value === option.value ? 'selected' : ''}>
            ${option.label}
          </option>
        `).join('')}
      </select>
    `;
  } else if (type === 'textarea') {
    // Textarea
    fieldHtml = `
      <textarea 
        ${commonAttributes}
        ${placeholder ? `placeholder="${placeholder}"` : ''}
        rows="3"
      >${value}</textarea>
    `;
  } else if (type === 'checkbox') {
    // Checkbox (special case with label after input)
    return `
      <div class="checkbox-container">
        <input 
          type="checkbox" 
          ${commonAttributes}
          ${value ? 'checked' : ''}
        />
        <label for="${fieldId}" class="checkbox-label">
          ${label}${required ? '*' : ''}${tooltip}
        </label>
        ${error ? `<p id="${errorId}" class="error" role="alert">${error}</p>` : ''}
      </div>
    `;
  } else {
    // Standard input field
    fieldHtml = `
      <input 
        type="${type}" 
        ${commonAttributes}
        value="${value}"
        ${placeholder ? `placeholder="${placeholder}"` : ''}
        ${autocomplete ? `autocomplete="${autocomplete}"` : ''}
        ${min !== undefined ? `min="${min}"` : ''}
        ${max !== undefined ? `max="${max}"` : ''}
      />
    `;
  }
  
  // Standard form field container (except for checkboxes)
  return `
    <div class="form-field">
      <label for="${fieldId}">${label}${required ? '*' : ''}${tooltip}</label>
      ${fieldHtml}
      ${error ? `<p id="${errorId}" class="error" role="alert">${error}</p>` : ''}
    </div>
  `;
}
