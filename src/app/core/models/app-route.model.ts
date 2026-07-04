export interface AppRoute {
  path: string;
  label: string;
  icon: string;
  isActive: boolean;
  children?: AppRoute[];
}
