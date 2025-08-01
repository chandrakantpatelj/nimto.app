import { I18nExample } from '@/components/examples/i18n-example';

export default function I18nTestPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">I18n Test Page</h1>
        <p className="text-muted-foreground">
          This page demonstrates the react-i18next implementation with
          comprehensive examples.
        </p>
      </div>

      <I18nExample />
    </div>
  );
}
