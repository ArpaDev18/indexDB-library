
import {BREADCRUMB_LEVELS, BreadcrumbTypes} from '../constants';
import {TBreadcrumbItemType, TBreadcrumbs} from "../types/breadcrumbs";

export const areBreadcrumbsLevelsValid = (
    breadcrumbs: TBreadcrumbs[],
    breadcrumbType: string
): boolean => {
    let levels = BREADCRUMB_LEVELS[breadcrumbType];

    if (!levels) {
        throw new Error(`Invalid breadcrumb type: ${breadcrumbType}`);
    }

    if (breadcrumbType === BreadcrumbTypes.PBS) {
        levels = levels.filter(level => level !== 'BUSINESS');
    }

    const breadcrumbItemTypes = breadcrumbs.map(
        breadcrumb => breadcrumb.itemType
    ) as TBreadcrumbItemType[]; // Ensure type safety

    let currentIndex = -1;

    const isValid = levels.every(level => {
        const nextIndex = breadcrumbItemTypes.indexOf(level as TBreadcrumbItemType, currentIndex + 1);
        if (nextIndex === -1) {
            return false;
        }
        currentIndex = nextIndex;
        return true;
    });

    const hasExtraBreadcrumbs = breadcrumbItemTypes.some(
        (type, index) => levels[index] !== type
    );

    return isValid && !hasExtraBreadcrumbs;
};




export const filterBreadCrumbsForSaving = (
    breadcrumbs: TBreadcrumbs[],
    itemType: TBreadcrumbItemType
): TBreadcrumbs[] => {
    const index = breadcrumbs.findIndex(breadcrumb => breadcrumb.itemType === itemType);
    if (index === -1) {
        return [];
    }
    return breadcrumbs.slice(0, index + 1);
};





