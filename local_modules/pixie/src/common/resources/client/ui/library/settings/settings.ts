export interface Settings {
  base_url: string;
  asset_url?: string;
  dates: {
    format: string;
    default_timezone: string;
  };
}
