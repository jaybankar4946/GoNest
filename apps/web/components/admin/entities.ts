import type { Row } from '@/lib/adminApi';

export type FieldType = 'text' | 'textarea' | 'number' | 'bool' | 'select' | 'date' | 'datetime' | 'list' | 'json' | 'developer';
export type Field = { k: string; label: string; t?: FieldType; opts?: string[]; req?: boolean; hint?: string; wide?: boolean };
export type Tone = 'ok' | 'warn' | 'err' | 'muted';
export type Action = {
  label: string;
  perm: 'edit' | 'publish' | 'delete';
  patch?: Row;
  moderate?: { status: string; verification: string; askReason?: boolean };
  confirm?: string;
  danger?: boolean;
  show?: (r: Row) => boolean;
};
export type MediaCfg = { cover?: string; gallery?: string; folder: string };
export type Cfg = {
  id: string;
  label: string;
  module: string;
  title: (r: Row) => string;
  sub: (r: Row) => string;
  badges: (r: Row) => [string, Tone][];
  fields: Field[];
  filters: { k: string; label: string; opts: string[] }[];
  actions: Action[];
  media?: MediaCfg;
  listingMedia?: boolean;
  deletable?: boolean;
};

export const MODULES: { id: string; label: string }[] = [
  { id: 'agents', label: 'Agents' },
  { id: 'owners', label: 'Owners' },
  { id: 'builders', label: 'Builders & Developers' },
  { id: 'projects', label: 'Projects' },
  { id: 'buy', label: 'Buy Listings' },
  { id: 'rent', label: 'Rent Listings' },
  { id: 'inventory', label: 'Inventory Units' },
  { id: 'media', label: 'Photos & Media' },
  { id: 'verification', label: 'Verification & Moderation' },
  { id: 'users', label: 'Users & Roles' },
  { id: 'audit', label: 'Audit Logs' },
];

const bool = (r: Row, k: string, yes: string, no: string, yesTone: Tone = 'ok'): [string, Tone] => (r[k] ? [yes, yesTone] : [no, 'muted']);
const acct = (r: Row): [string, Tone] => [r.account_status || 'active', r.account_status && r.account_status !== 'active' ? 'err' : 'ok'];
const ACCOUNT = ['active', 'suspended', 'deactivated'];

const profileActions = (verifyKey?: string): Action[] => [
  ...(verifyKey ? [
    { label: 'Verify', perm: 'publish' as const, patch: { [verifyKey]: true }, show: (r: Row) => !r[verifyKey] },
    { label: 'Remove verification', perm: 'publish' as const, patch: { [verifyKey]: false }, confirm: 'Remove verification for this profile?', show: (r: Row) => !!r[verifyKey] },
  ] : []),
  { label: 'Feature', perm: 'publish', patch: { featured: true }, show: r => !r.featured },
  { label: 'Unfeature', perm: 'publish', patch: { featured: false }, show: r => !!r.featured },
  { label: 'Hide from public directory', perm: 'publish', patch: { directory_visible: false }, confirm: 'Hide this profile from the public directory?', show: r => r.directory_visible !== false },
  { label: 'Show in public directory', perm: 'publish', patch: { directory_visible: true }, show: r => r.directory_visible === false },
  { label: 'Suspend account', perm: 'publish', patch: { account_status: 'suspended' }, danger: true, confirm: 'Suspend this account? They will be hidden from the directory and cannot create or edit listings.', show: r => (r.account_status || 'active') === 'active' },
  { label: 'Deactivate account', perm: 'publish', patch: { account_status: 'deactivated' }, danger: true, confirm: 'Deactivate this account?', show: r => (r.account_status || 'active') === 'active' },
  { label: 'Reactivate account', perm: 'publish', patch: { account_status: 'active' }, show: r => (r.account_status || 'active') !== 'active' },
];

const listingFields: Field[] = [
  { k: 'title', label: 'Title', req: true, wide: true },
  { k: 'description', label: 'Description', t: 'textarea', wide: true },
  { k: 'property_type', label: 'Property type', hint: 'e.g. apartment, villa, plot' },
  { k: 'price', label: 'Price (₹)', t: 'number', req: true },
  { k: 'price_negotiable', label: 'Price negotiable', t: 'bool' },
  { k: 'maintenance_monthly', label: 'Maintenance / month (₹)', t: 'number' },
  { k: 'security_deposit', label: 'Security deposit (₹)', t: 'number' },
  { k: 'brokerage', label: 'Brokerage' },
  { k: 'bedrooms', label: 'BHK / bedrooms', t: 'number' },
  { k: 'bathrooms', label: 'Bathrooms', t: 'number' },
  { k: 'balconies', label: 'Balconies', t: 'number' },
  { k: 'sqft', label: 'Built-up area (sq ft)', t: 'number' },
  { k: 'carpet_area', label: 'Carpet area (sq ft)', t: 'number' },
  { k: 'floor_number', label: 'Floor', t: 'number' },
  { k: 'total_floors', label: 'Total floors', t: 'number' },
  { k: 'furnishing', label: 'Furnishing', t: 'select', opts: ['unfurnished', 'semi-furnished', 'fully-furnished'] },
  { k: 'facing', label: 'Facing', t: 'select', opts: ['', 'north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west'] },
  { k: 'property_age', label: 'Property age (years)', t: 'number' },
  { k: 'available_from', label: 'Available from', t: 'date' },
  { k: 'availability', label: 'Availability note' },
  { k: 'address_line', label: 'Address', wide: true },
  { k: 'landmark', label: 'Landmark' },
  { k: 'neighbourhood', label: 'Neighbourhood' },
  { k: 'pincode', label: 'PIN code' },
  { k: 'latitude', label: 'Latitude', t: 'number' },
  { k: 'longitude', label: 'Longitude', t: 'number' },
  { k: 'amenities', label: 'Amenities / features', t: 'list', wide: true, hint: 'One per line or comma-separated' },
  { k: 'video_url', label: 'Video link', wide: true },
  { k: 'expires_at', label: 'Listing expires', t: 'datetime' },
  { k: 'featured', label: 'Featured', t: 'bool' },
];

const listingActions: Action[] = [
  { label: 'Approve & publish', perm: 'publish', moderate: { status: 'active', verification: 'verified' }, show: r => r.status !== 'active' },
  { label: 'Reject', perm: 'publish', moderate: { status: 'rejected', verification: 'unverified', askReason: true }, danger: true, show: r => r.status !== 'rejected' },
  { label: 'Unpublish', perm: 'publish', moderate: { status: 'draft', verification: 'unverified' }, confirm: 'Unpublish this listing? It will disappear from the public site.', show: r => r.status === 'active' },
  { label: 'Archive', perm: 'publish', moderate: { status: 'archived', verification: 'unverified' }, confirm: 'Archive this listing?', show: r => r.status !== 'archived' },
  { label: 'Restore (to review queue)', perm: 'publish', moderate: { status: 'pending_review', verification: 'unverified' }, show: r => r.status === 'archived' || r.status === 'rejected' },
  { label: 'Feature', perm: 'publish', patch: { featured: true }, show: r => !r.featured },
  { label: 'Unfeature', perm: 'publish', patch: { featured: false }, show: r => !!r.featured },
];
const listingFilters = [
  { k: 'status', label: 'Status', opts: ['active', 'pending_review', 'draft', 'rejected', 'archived', 'sold', 'rented', 'expired', 'suspended'] },
  { k: 'verification_level', label: 'Verification', opts: ['unverified', 'verified', 'platform_verified'] },
  { k: 'featured', label: 'Featured', opts: ['true', 'false'] },
];
const listingCfg = (id: 'buy' | 'rent', label: string): Cfg => ({
  id, label, module: id, fields: listingFields, filters: listingFilters, actions: listingActions, listingMedia: true, deletable: true,
  title: r => r.title || '(untitled)',
  sub: r => [r.locality_name || r.neighbourhood, r.city_name, r.price ? `₹${Number(r.price).toLocaleString('en-IN')}` : '', r.poster_name && `by ${r.poster_name}`].filter(Boolean).join(' · '),
  badges: r => [[r.status, r.status === 'active' ? 'ok' : r.status === 'pending_review' ? 'warn' : r.status === 'rejected' ? 'err' : 'muted'], [r.verification_level, r.verification_level === 'unverified' ? 'muted' : 'ok'], ...(r.featured ? [['featured', 'ok'] as [string, Tone]] : []), [`${r.image_count ?? 0} photos`, 'muted']],
});

export const ENTITIES: Record<string, Cfg> = {
  agents: {
    id: 'agents', label: 'Agents', module: 'agents', media: { cover: 'avatar_url', gallery: 'gallery_urls', folder: 'agents' },
    title: r => r.full_name || '(no name)',
    sub: r => [r.agency_name, r.email, r.phone].filter(Boolean).join(' · '),
    badges: r => [bool(r, 'agent_verified', 'verified', 'unverified'), acct(r), ...(r.featured ? [['featured', 'ok'] as [string, Tone]] : []), r.directory_visible === false ? ['hidden', 'warn'] : ['listed', 'muted'], [`${r.listing_count ?? 0} listings`, 'muted']],
    fields: [
      { k: 'full_name', label: 'Full name', req: true },
      { k: 'agency_name', label: 'Company / agency' },
      { k: 'phone', label: 'Phone' }, { k: 'email', label: 'Email' },
      { k: 'rera_number', label: 'RERA number' },
      { k: 'bio', label: 'Profile description', t: 'textarea', wide: true },
      { k: 'service_localities', label: 'Service locations', t: 'list', wide: true, hint: 'One per line or comma-separated' },
      { k: 'service_pincodes', label: 'Service PIN codes', t: 'list', wide: true },
      { k: 'agent_verified', label: 'Verified agent', t: 'bool' }, { k: 'phone_verified', label: 'Phone verified', t: 'bool' },
      { k: 'featured', label: 'Featured', t: 'bool' }, { k: 'directory_visible', label: 'Visible in public directory', t: 'bool' },
      { k: 'account_status', label: 'Account status', t: 'select', opts: ACCOUNT },
    ],
    filters: [{ k: 'agent_verified', label: 'Verification', opts: ['true', 'false'] }, { k: 'account_status', label: 'Account', opts: ACCOUNT }, { k: 'featured', label: 'Featured', opts: ['true', 'false'] }, { k: 'directory_visible', label: 'Directory', opts: ['true', 'false'] }],
    actions: profileActions('agent_verified'),
  },
  owners: {
    id: 'owners', label: 'Owners', module: 'owners', media: { cover: 'avatar_url', gallery: 'gallery_urls', folder: 'owners' },
    title: r => r.full_name || '(no name)', sub: r => [r.email, r.phone].filter(Boolean).join(' · '),
    badges: r => [acct(r), bool(r, 'phone_verified', 'phone verified', 'phone unverified'), [`${r.listing_count ?? 0} listings`, 'muted']],
    fields: [
      { k: 'full_name', label: 'Full name', req: true }, { k: 'phone', label: 'Phone' }, { k: 'email', label: 'Email' },
      { k: 'bio', label: 'Profile description', t: 'textarea', wide: true },
      { k: 'phone_verified', label: 'Phone verified', t: 'bool' }, { k: 'featured', label: 'Featured', t: 'bool' },
      { k: 'directory_visible', label: 'Visible in public directory', t: 'bool' },
      { k: 'account_status', label: 'Account status', t: 'select', opts: ACCOUNT },
    ],
    filters: [{ k: 'account_status', label: 'Account', opts: ACCOUNT }, { k: 'featured', label: 'Featured', opts: ['true', 'false'] }],
    actions: profileActions(),
  },
  builders: {
    id: 'builders', label: 'Builders & Developers', module: 'builders', media: { cover: 'logo_url', gallery: 'gallery_image_urls', folder: 'builders' },
    title: r => r.operating_brand || r.registered_name || '(unnamed)', sub: r => [r.registered_name, r.website_url].filter(Boolean).join(' · '),
    badges: r => [[r.verification_status, r.verification_status === 'verified' ? 'ok' : r.verification_status === 'rejected' ? 'err' : 'warn'], r.is_active === false ? ['inactive', 'err'] : ['active', 'ok'], ...(r.featured ? [['featured', 'ok'] as [string, Tone]] : []), [`${r.project_count ?? 0} projects`, 'muted']],
    fields: [
      { k: 'registered_name', label: 'Registered company name', req: true }, { k: 'operating_brand', label: 'Brand name' },
      { k: 'website_url', label: 'Website' }, { k: 'public_phone', label: 'Public phone' },
      { k: 'public_enquiry_url', label: 'Enquiry URL' }, { k: 'rera_registration', label: 'RERA registration' },
      { k: 'public_business_address', label: 'Company address', t: 'textarea', wide: true },
      { k: 'operating_cities', label: 'Operating cities', t: 'list', wide: true },
      { k: 'verification_status', label: 'Verification status', t: 'select', opts: ['unverified', 'pending', 'verified', 'rejected', 'stale'] },
      { k: 'is_active', label: 'Active (visible publicly)', t: 'bool' }, { k: 'featured', label: 'Featured', t: 'bool' },
    ],
    filters: [{ k: 'verification_status', label: 'Verification', opts: ['unverified', 'pending', 'verified', 'rejected', 'stale'] }, { k: 'is_active', label: 'Active', opts: ['true', 'false'] }, { k: 'featured', label: 'Featured', opts: ['true', 'false'] }],
    actions: [
      { label: 'Verify', perm: 'publish', patch: { verification_status: 'verified' }, show: r => r.verification_status !== 'verified' },
      { label: 'Reject', perm: 'publish', patch: { verification_status: 'rejected' }, danger: true, show: r => r.verification_status !== 'rejected' },
      { label: 'Deactivate (hide)', perm: 'publish', patch: { is_active: false }, confirm: 'Hide this builder from the public site?', show: r => r.is_active !== false },
      { label: 'Activate', perm: 'publish', patch: { is_active: true }, show: r => r.is_active === false },
      { label: 'Feature', perm: 'publish', patch: { featured: true }, show: r => !r.featured },
      { label: 'Unfeature', perm: 'publish', patch: { featured: false }, show: r => !!r.featured },
    ],
  },
  projects: {
    id: 'projects', label: 'Projects', module: 'projects', media: { cover: 'cover_image_url', gallery: 'gallery_image_urls', folder: 'projects' },
    title: r => r.official_name || '(unnamed)', sub: r => [r.developer_name, r.locality_name, r.city_name].filter(Boolean).join(' · '),
    badges: r => [[r.verification_status, r.verification_status === 'verified' ? 'ok' : r.verification_status === 'rejected' ? 'err' : 'warn'], [r.lifecycle_status || 'published', (r.lifecycle_status || 'published') === 'published' ? 'ok' : 'muted'], ...(r.featured ? [['featured', 'ok'] as [string, Tone]] : []), [`${r.unit_count ?? 0} units`, 'muted']],
    fields: [
      { k: 'official_name', label: 'Project name', req: true },
      { k: 'developer_id', label: 'Builder / developer', t: 'developer' },
      { k: 'alternate_names', label: 'Alternate names', t: 'list' },
      { k: 'public_address', label: 'Address', t: 'textarea', wide: true },
      { k: 'pincode', label: 'PIN code' }, { k: 'landmark', label: 'Landmark' }, { k: 'neighbourhood', label: 'Neighbourhood' },
      { k: 'latitude', label: 'Latitude', t: 'number' }, { k: 'longitude', label: 'Longitude', t: 'number' },
      { k: 'rera_number', label: 'RERA number' }, { k: 'rera_source_url', label: 'RERA source URL' },
      { k: 'project_category', label: 'Category', t: 'select', opts: ['residential', 'commercial', 'plotted', 'mixed_use', 'industrial', 'other'] },
      { k: 'construction_status', label: 'Construction status', t: 'select', opts: ['upcoming', 'under_construction', 'completed', 'on_hold', 'cancelled', 'unknown'] },
      { k: 'launch_date', label: 'Launch date', t: 'date' }, { k: 'expected_possession_date', label: 'Possession date', t: 'date' },
      { k: 'total_units', label: 'Total inventory (units)', t: 'number' },
      { k: 'published_price_min_inr', label: 'Price from (₹)', t: 'number' }, { k: 'published_price_max_inr', label: 'Price to (₹)', t: 'number' },
      { k: 'configurations', label: 'Configurations / BHK options (JSON)', t: 'json', wide: true, hint: 'e.g. [{"bhk":2,"carpet_sqft":720}] — must be valid JSON' },
      { k: 'amenities', label: 'Amenities', t: 'list', wide: true },
      { k: 'description', label: 'Project description', t: 'textarea', wide: true },
      { k: 'official_project_url', label: 'Official project URL', wide: true }, { k: 'brochure_url', label: 'Brochure URL', wide: true },
      { k: 'inventory_status', label: 'Inventory status', t: 'select', opts: ['verified_available', 'advertised_unverified', 'sold_out', 'not_open_for_sale', 'unknown'] },
      { k: 'verification_status', label: 'Verification status', t: 'select', opts: ['unverified', 'pending', 'verified', 'rejected', 'stale', 'conflicting'] },
      { k: 'lifecycle_status', label: 'Publication', t: 'select', opts: ['published', 'unpublished', 'archived'] },
      { k: 'featured', label: 'Featured', t: 'bool' },
    ],
    filters: [{ k: 'verification_status', label: 'Verification', opts: ['unverified', 'pending', 'verified', 'rejected', 'stale', 'conflicting'] }, { k: 'lifecycle_status', label: 'Publication', opts: ['published', 'unpublished', 'archived'] }, { k: 'construction_status', label: 'Construction', opts: ['upcoming', 'under_construction', 'completed', 'on_hold', 'cancelled', 'unknown'] }, { k: 'featured', label: 'Featured', opts: ['true', 'false'] }],
    actions: [
      { label: 'Verify', perm: 'publish', patch: { verification_status: 'verified' }, show: r => r.verification_status !== 'verified' },
      { label: 'Reject', perm: 'publish', patch: { verification_status: 'rejected' }, danger: true, show: r => r.verification_status !== 'rejected' },
      { label: 'Publish', perm: 'publish', patch: { lifecycle_status: 'published' }, show: r => (r.lifecycle_status || 'published') !== 'published' },
      { label: 'Unpublish', perm: 'publish', patch: { lifecycle_status: 'unpublished' }, confirm: 'Unpublish this project? It will disappear from the public site.', show: r => (r.lifecycle_status || 'published') === 'published' },
      { label: 'Archive', perm: 'publish', patch: { lifecycle_status: 'archived' }, confirm: 'Archive this project?', show: r => r.lifecycle_status !== 'archived' },
      { label: 'Restore', perm: 'publish', patch: { lifecycle_status: 'published' }, show: r => r.lifecycle_status === 'archived' },
      { label: 'Feature', perm: 'publish', patch: { featured: true }, show: r => !r.featured },
      { label: 'Unfeature', perm: 'publish', patch: { featured: false }, show: r => !!r.featured },
    ],
  },
  buy: listingCfg('buy', 'Buy Listings'),
  rent: listingCfg('rent', 'Rent Listings'),
  inventory: {
    id: 'inventory', label: 'Inventory Units', module: 'inventory', media: { gallery: 'photo_urls', folder: 'units' },
    title: r => [r.project_name, r.tower_name && `Tower ${r.tower_name}`, r.unit_reference && `Unit ${r.unit_reference}`].filter(Boolean).join(' · ') || '(unit)',
    sub: r => [r.developer_name, r.configuration, r.asking_price_inr ? `₹${Number(r.asking_price_inr).toLocaleString('en-IN')}` : ''].filter(Boolean).join(' · '),
    badges: r => [[r.availability_status, r.availability_status === 'available' ? 'ok' : 'muted'], [r.review_status, r.review_status === 'approved' ? 'ok' : r.review_status === 'rejected' ? 'err' : 'warn']],
    fields: [
      { k: 'unit_reference', label: 'Unit number' }, { k: 'tower_name', label: 'Tower' }, { k: 'floor_number', label: 'Floor', t: 'number' },
      { k: 'configuration', label: 'Configuration (e.g. 2 BHK)' }, { k: 'carpet_area_sqft', label: 'Carpet area (sq ft)', t: 'number' },
      { k: 'asking_price_inr', label: 'Price (₹)', t: 'number' }, { k: 'additional_charges_inr', label: 'Additional charges (₹)', t: 'number' },
      { k: 'availability_status', label: 'Availability / possession', t: 'select', opts: ['available', 'on_hold', 'booked', 'sold', 'rented', 'unavailable', 'unknown'] },
      { k: 'market_type', label: 'Market', t: 'select', opts: ['primary', 'resale', 'rental'] },
      { k: 'source_url', label: 'Source URL', wide: true }, { k: 'evidence_notes', label: 'Notes', t: 'textarea', wide: true },
      { k: 'document_urls', label: 'Supporting document links', t: 'list', wide: true, hint: 'One URL per line' },
    ],
    filters: [{ k: 'availability_status', label: 'Availability', opts: ['available', 'on_hold', 'booked', 'sold', 'rented', 'unavailable', 'unknown'] }, { k: 'review_status', label: 'Review', opts: ['pending', 'approved', 'rejected'] }],
    actions: [
      { label: 'Mark available', perm: 'publish', patch: { availability_status: 'available' }, show: r => r.availability_status !== 'available' },
      { label: 'Mark sold', perm: 'publish', patch: { availability_status: 'sold' }, confirm: 'Mark this unit as sold?', show: r => r.availability_status !== 'sold' },
    ],
  },
  users: {
    id: 'users', label: 'Users & Roles', module: 'users',
    title: r => r.full_name || r.email || '(no name)', sub: r => [r.email, r.phone].filter(Boolean).join(' · '),
    badges: r => [[r.role === 'admin' ? `admin · ${r.admin_level || 'staff'}` : r.role, r.role === 'admin' ? 'warn' : 'muted'], acct(r)],
    fields: [
      { k: 'full_name', label: 'Full name', req: true }, { k: 'phone', label: 'Phone' }, { k: 'email', label: 'Email' },
      { k: 'agency_name', label: 'Company / agency' }, { k: 'rera_number', label: 'RERA number' },
      { k: 'agent_verified', label: 'Verified agent', t: 'bool' }, { k: 'builder_verified', label: 'Verified builder', t: 'bool' },
      { k: 'account_status', label: 'Account status', t: 'select', opts: ACCOUNT },
    ],
    filters: [{ k: 'role', label: 'Role', opts: ['buyer', 'owner', 'agent', 'builder', 'admin'] }, { k: 'admin_level', label: 'Admin level', opts: ['super', 'staff'] }, { k: 'account_status', label: 'Account', opts: ACCOUNT }],
    actions: profileActions().filter(a => /account/.test(a.label)),
  },
};

export const VERIFICATION_QUEUES: { id: string; label: string; entity: string; filters: Record<string, string> }[] = [
  { id: 'agents', label: 'Agents', entity: 'agents', filters: { agent_verified: 'false' } },
  { id: 'builders', label: 'Builders', entity: 'builders', filters: { verification_status: 'pending' } },
  { id: 'projects', label: 'Projects', entity: 'projects', filters: { verification_status: 'pending' } },
  { id: 'buy', label: 'Buy listings', entity: 'buy', filters: { status: 'pending_review' } },
  { id: 'rent', label: 'Rent listings', entity: 'rent', filters: { status: 'pending_review' } },
  { id: 'inventory', label: 'Units', entity: 'inventory', filters: { review_status: 'pending' } },
];
