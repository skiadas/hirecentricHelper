import type { AppInfo } from '#preload';

export interface LoadingAppInfo extends AppInfo {
  loaded: boolean;
}

export interface FileInfo {
  href: string;
  filename: string;
}
