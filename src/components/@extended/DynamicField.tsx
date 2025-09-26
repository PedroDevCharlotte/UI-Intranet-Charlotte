import React from 'react';

// material-ui
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

// types
import { DynamicField as DynamicFieldType } from 'types/ticket';

// ==============================|| DYNAMIC FIELD COMPONENT ||============================== //

interface DynamicFieldProps {
  field: DynamicFieldType;
  value: any;
  onChange: (fieldName: string, value: any) => void;
  error?: string | boolean;
  helperText?: string;
  disabled?: boolean;
}

const DynamicField: React.FC<DynamicFieldProps> = ({ field, value, onChange, error = false, helperText, disabled = false }) => {
  const handleChange = (newValue: any) => {
    onChange(field.name, newValue);
  };

  const getPlaceholder = () => {
    return field.placeholder || `Enter ${field.label.toLowerCase()}`;
  };

  const getSelectPlaceholder = () => {
    return `Select ${field.label.toLowerCase()}`;
  };

  switch (field.type) {
    case 'text':
      return (
        <TextField
          fullWidth
          id={field.name}
          name={field.name}
          placeholder={getPlaceholder()}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          error={Boolean(error)}
          helperText={helperText}
          disabled={disabled}
          inputProps={{
            minLength: field.validation?.minLength,
            maxLength: field.validation?.maxLength,
            pattern: field.validation?.pattern
          }}
        />
      );

    case 'textarea':
      return (
        <TextField
          fullWidth
          id={field.name}
          name={field.name}
          multiline
          rows={3}
          placeholder={getPlaceholder()}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          error={Boolean(error)}
          helperText={helperText}
          disabled={disabled}
          inputProps={{
            minLength: field.validation?.minLength,
            maxLength: field.validation?.maxLength
          }}
        />
      );

    case 'number':
      return (
        <TextField
          fullWidth
          id={field.name}
          name={field.name}
          type="number"
          placeholder={getPlaceholder()}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          error={Boolean(error)}
          helperText={helperText}
          disabled={disabled}
        />
      );

    case 'date':
      return (
        <TextField
          fullWidth
          id={field.name}
          name={field.name}
          type="date"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          error={Boolean(error)}
          helperText={helperText}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
        />
      );

    case 'select':
      return (
        <FormControl fullWidth error={Boolean(error)} disabled={disabled}>
          <Select id={field.name} name={field.name} value={value || ''} onChange={(e) => handleChange(e.target.value)} displayEmpty>
            <MenuItem value="">
              <em>{getSelectPlaceholder()}</em>
            </MenuItem>
            {field.options?.map((option) => (
              <MenuItem key={option.id} value={option.value}>
                {option.displayText}
              </MenuItem>
            ))}
          </Select>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );

    default:
      return (
        <TextField
          fullWidth
          id={field.name}
          name={field.name}
          placeholder={getPlaceholder()}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          error={Boolean(error)}
          helperText={helperText}
          disabled={disabled}
        />
      );
  }
};

export default DynamicField;
