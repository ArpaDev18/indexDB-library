export type TBreadcrumbItemType = 'SITE' | 'ALLPRODUCTS' | 'BUSINESS' | 'CATEGORY' | 'SUBCATEGORY' | 'RANGE' | 'PRODUCT';

export type TBreadcrumbs = {
    id: string;
    itemType: TBreadcrumbItemType;
    name: string;
    nameForChat: string;
    url: string;
};