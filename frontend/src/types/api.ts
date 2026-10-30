export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}
export interface ApiError {
  code: string;
  details: unknown;
}
export interface ApiMeta {
  pagination?: PaginationMeta;
  request_id?: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: ApiError | null;
  meta: ApiMeta;
}
export interface Hero {
  id: number;
  page: string;
  title: string;
  highlight: string;
  subtitle: string;
  body: string;
  artwork: string;
  typewriter_enabled?: boolean;
  typewriter_speed_ms?: number;
  typewriter_delete_ms?: number;
  typewriter_hold_ms?: number;
}
export interface Social {
  id: number;
  platform: string;
  label: string;
  url: string;
  handle: string;
  description: string;
  verified?: boolean;
  display_value: string;
  href: string;
}
export interface PageBlock {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  body: string;
  image_asset?: number | null;
  secondary_image_asset?: number | null;
  image_url?: string;
  secondary_image_url?: string;
  items: {
    title: string;
    text?: string;
    image?: string;
    imageAlt?: string;
    icon?: string;
    accent?: string;
    category_slug?: string;
  }[];
}
export interface Content {
  blocks: PageBlock[];
  categories: { id: number; title: string; slug: string }[];
  heroes: Hero[];
  stats: { id: number; label: string; value: string }[];
  socials: Social[];
  settings: {
    brand: string;
    tagline: string;
    description: string;
    email: string;
    site_url: string;
    demo_mode: boolean;
  };
  profile: {
    name: string;
    role: string;
    location: string;
    start_year: number;
    specialization: string;
    bio: string;
  };
}
export interface Project {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: number;
  category_title: string;
  category_slug: string;
  poster_url: string;
  video_url: string;
  duration: string;
  client: string;
  year: number;
  tools: string[];
  tags: string[];
  status: string;
  featured: boolean;
  order: number;
  visible: boolean;
  gallery: { id: number; url: string; caption: string }[];
  related?: Project[];
}
export interface Skill {
  id: number;
  title: string;
  kind: string;
  level: number;
  level_label: string;
  description: string;
  icon: string;
  artwork: string;
  artwork_url: string;
  icon_url: string;
  accent: string;
  variant: string;
  order: number;
  visible: boolean;
}
export interface Education {
  id: number;
  degree: string;
  field: string;
  institution: string;
  years: string;
  start_year: string;
  end_year: string;
  is_current: boolean;
  description: string;
  image: string;
  image_url: string;
  image_alt: string;
  accent: string;
  order: number;
  visible: boolean;
}
export interface Resume {
  experience: {
    id: number;
    title: string;
    company: string;
    employment_type?: string;
    workplace_type?: string;
    location?: string;
    start: string;
    end: string;
    start_date?: string | null;
    end_date?: string | null;
    description: string;
    responsibilities?: string[];
    achievements?: string[];
    projects?: string[];
    technologies?: string[];
    links?: { label: string; url: string }[];
    image: string;
    image_url: string;
    image_alt: string;
    is_current: boolean;
    accent: string;
    order: number;
    visible: boolean;
  }[];
  education: Education[];
  certificates: {
    id: number;
    title: string;
    issuer: string;
    year: string;
    url: string;
    description: string;
    icon: string;
    icon_url: string;
    certificate_url: string;
    verification_url: string;
    order: number;
    visible: boolean;
  }[];
  achievements: {
    id: number;
    title: string;
    value: string;
    description: string;
    numeric_value: number | null;
    prefix: string;
    suffix: string;
    icon: string;
    order: number;
    visible: boolean;
  }[];
  files: { id: number; title: string; url: string; language: "fa" | "en" }[];
}
export interface AdminUser {
  id: number;
  username: string;
  role: "owner" | "editor" | "viewer";
  is_superuser: boolean;
}
export type RecordData = Record<string, unknown> & { id: number };
