
export const ALLPRODUCTS = 'allProducts';
export const BreadcrumbTypes = {
    PBS: 'PBS',
    PPW: 'PPW',
};
export const BUSINESS = 'business';
export const ClientApps = {
    PBS: 'PBS',
    PPW: 'PPW',
};
export const MAX_BREADCRUMBS_RECORDS_COUNT = 100;
export const INDEXDB_CREATION_KEY = 'createdAt';


export const BREADCRUMB_LEVELS = {
    [BreadcrumbTypes.PPW]: ['SITE', 'ALLPRODUCTS', 'BUSINESS', 'CATEGORY', 'SUBCATEGORY', 'RANGE', 'PRODUCT'],
    [BreadcrumbTypes.PBS]: ['SITE', 'ALLPRODUCTS', 'CATEGORY', 'SUBCATEGORY', 'RANGE', 'PRODUCT'],
};