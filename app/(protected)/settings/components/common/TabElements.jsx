'use client';

import { AlertTriangle, Eye, EyeOff, Info } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

// Common Section Header Component
export const SectionHeader = ({
  title,
  subtitle,
  description,
  icon: Icon,
  iconColor = 'primary',
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const iconColors = {
    primary: isDark
      ? 'bg-primary-500/20 text-primary-400'
      : 'bg-primary-100 text-primary-600',
    green: isDark
      ? 'bg-green-500/20 text-green-400'
      : 'bg-green-100 text-green-600',
    purple: isDark
      ? 'bg-purple-500/20 text-purple-400'
      : 'bg-purple-100 text-purple-600',
    orange: isDark
      ? 'bg-orange-500/20 text-orange-400'
      : 'bg-orange-100 text-orange-600',
    red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        {Icon && (
          <div className={`p-2 rounded-lg ${iconColors[iconColor]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {subtitle}
            </p>
          )}
          {description && (
            <p
              className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Common Input Field Component
export const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  description,
  type = 'text',
  showToggle = false,
  required = false,
  disabled = false,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="space-y-2">
      <Label
        className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() =>
              onChange({
                target: {
                  value: value,
                  type: type === 'password' ? 'text' : 'password',
                },
              })
            }
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
              isDark
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type === 'password' ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {description && (
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
    </div>
  );
};

// Common Textarea Field Component
export const TextareaField = ({
  label,
  value,
  onChange,
  placeholder,
  description,
  rows = 4,
  required = false,
  disabled = false,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="space-y-2">
      <Label
        className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
      />
      {description && (
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
    </div>
  );
};

// Common Select Field Component
export const SelectField = ({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  description,
  required = false,
  disabled = false,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="space-y-2">
      <Label
        className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={`w-full ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
          }
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={
                isDark
                  ? 'text-white hover:bg-gray-700'
                  : 'text-gray-900 hover:bg-gray-50'
              }
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
    </div>
  );
};

// Common Toggle Switch Component
export const ToggleField = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="flex-1">
        <Label
          className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
        >
          {label}
        </Label>
        {description && (
          <p
            className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {description}
          </p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="ml-4"
      />
    </div>
  );
};

// Common Warning Alert Component
export const WarningAlert = ({
  title,
  description,
  icon: Icon = AlertTriangle,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={`flex items-start space-x-3 p-4 rounded-lg border ${
        isDark
          ? 'bg-yellow-900/20 border-yellow-700 text-yellow-200'
          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
      }`}
    >
      <Icon
        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
          isDark ? 'text-yellow-400' : 'text-yellow-600'
        }`}
      />
      <div>
        {title && <p className="text-sm font-medium">{title}</p>}
        {description && <p className="text-xs mt-1">{description}</p>}
      </div>
    </div>
  );
};

// Common Info Alert Component
export const InfoAlert = ({ description, icon: Icon = Info }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={`flex items-start space-x-2 p-3 rounded-lg ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}
    >
      <Icon
        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
      />
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {description}
      </p>
    </div>
  );
};

// Common Settings Card Component
export const SettingsCard = ({
  title,
  subtitle,
  description,
  icon: Icon,
  iconColor = 'primary',
  children,
  className = '',
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Card
      className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'} ${className}`}
    >
      <CardContent className="space-y-6">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          description={description}
          icon={Icon}
          iconColor={iconColor}
        />
        <div className="ml-11">{children}</div>
      </CardContent>
    </Card>
  );
};

// Common Save Button Component
export const SaveButton = ({
  onClick,
  children = 'Save Settings',
  loading = false,
  className = '',
}) => {
  return (
    <div className="flex justify-end">
      <Button varinat="primary" onClick={onClick} disabled={loading}>
        {loading ? 'Saving...' : children}
      </Button>
    </div>
  );
};

// Common Tab Header Component
export const TabHeader = ({ title, description }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div>
      <h2
        className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          {description}
        </p>
      )}
    </div>
  );
};
