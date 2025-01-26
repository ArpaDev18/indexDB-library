import {TBreadcrumbItemType, TBreadcrumbs} from '../../types/breadcrumbs';
import { BreadcrumbTypes } from '../../constants';
import {areBreadcrumbsLevelsValid, filterBreadCrumbsForSaving} from "../../utils/breadcrumbs";

const mockedBreadcrumbs: TBreadcrumbs[] = [
  { itemType: 'SITE', url: '', id: '7', name: '', nameForChat: '' },
  { itemType: 'ALLPRODUCTS', url: '', id: '3', name: '', nameForChat: '' },
  { itemType: 'BUSINESS', url: '', id: '4', name: '', nameForChat: '' },
  { itemType: 'CATEGORY', url: '', id: '5', name: '', nameForChat: '' },
  { itemType: 'SUBCATEGORY', url: '', id: '6', name: '', nameForChat: '' },
  { itemType: 'RANGE', url: '', id: '1', name: '', nameForChat: '' },
  { itemType: 'PRODUCT', url: '', id: '2', name: '', nameForChat: '' },
];

const mockedBreadcrumbsWithJump: TBreadcrumbs[] = [
  { itemType: 'SITE', url: '', id: '7', name: '', nameForChat: '' },
  { itemType: 'ALLPRODUCTS', url: '', id: '3', name: '', nameForChat: '' },
  { itemType: 'BUSINESS', url: '', id: '4', name: '', nameForChat: '' },
  { itemType: 'RANGE', url: '', id: '1', name: '', nameForChat: '' },
  { itemType: 'PRODUCT', url: '', id: '2', name: '', nameForChat: '' },
];

describe('Breadcrumbs helpers', () => {
  describe('isBreadCrumbValid', () => {
    test('Returns true for valid breadcrumbs', () => {
      expect(areBreadcrumbsLevelsValid(mockedBreadcrumbs, BreadcrumbTypes.PPW)).toBe(true);
    });

    test('Returns false for invalid breadcrumbs', () => {
      expect(areBreadcrumbsLevelsValid(mockedBreadcrumbsWithJump, BreadcrumbTypes.PPW)).toBe(false);
    });
  });

  describe('filterBreadCrumbsForSaving', () => {
    test('Returns correct sliced array', () => {
      expect(filterBreadCrumbsForSaving(mockedBreadcrumbs, 'ALLPRODUCTS')).toEqual([
        { itemType: 'SITE', url: '', id: '7', name: '', nameForChat: '' },
        { itemType: 'ALLPRODUCTS', url: '', id: '3', name: '', nameForChat: '' },
      ]);
    });

    test('Returns empty array if itemType not found', () => {
      expect(filterBreadCrumbsForSaving(mockedBreadcrumbs, '' as TBreadcrumbItemType)).toEqual([]);
    });
  });
});
