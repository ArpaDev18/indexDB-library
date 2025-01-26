import {
  ALLPRODUCTS, BreadcrumbTypes,
  BUSINESS, ClientApps,
} from '../constants';
import {
  GetFromStorageParamsType,
  SaveInIndexDBParamsType,
} from '../types/indexDB.types';
import { TBreadcrumbItemType, TBreadcrumbs } from '../types/breadcrumbs';
import { IndexDBService } from './IndexDBService';
import {areBreadcrumbsLevelsValid} from "../utils/breadcrumbs";

export class IndexDBBreadcrumbsService extends IndexDBService {
  getValidatedBreadcrumbs = async (
    { key, storageName }: GetFromStorageParamsType,
  ): Promise<TBreadcrumbs[]> => {
    const result = await this.getFromStorage({ key, storageName });
    const breadcrumbType = this.channel === ClientApps.PBS
      ? BreadcrumbTypes.PBS
      : BreadcrumbTypes.PPW;
    const areBreadcrumbsCompleted = areBreadcrumbsLevelsValid(
      result,
      breadcrumbType,
    );

    return areBreadcrumbsCompleted ? result : [];
  };

  fetchExistingOrNew = async ({ storageName, pageKey, breadcrumbs }):Promise<TBreadcrumbs[]> => {
    const isKeyExists = await this.checkKeyExisting(storageName, pageKey);

    if (!isKeyExists) {
      return this.addToStorage({
        storageName,
        objectToAdd: breadcrumbs,
        key: pageKey,
      });
    }

    return this.getFromStorage({
      storageName,
      key: pageKey,
    });
  };

  createOrUpdate = async (
    { storageName,
      storageKey,
      updatedBreadCrumbs,
    },
  ):Promise<void> => {
    const isKeyExists = await this.checkKeyExisting(storageName, storageKey);
    if (isKeyExists) {
      await this.updateStorage({
        storageName,
        key: storageKey,
        newData: updatedBreadCrumbs,
      });
    } else {
      await this.addToStorage({
        storageName,
        objectToAdd: updatedBreadCrumbs,
        key: storageKey,
      });
    }
  };

  setupStorage = async (
    { breadcrumbs,
      storageName,
      pageKey,
    },
  ): Promise<void> => {
    await this.connectDataBase();
    if (!this.checkStorageExisting(storageName)) {
      await this.setNewStorage({
        dataToInsert: breadcrumbs,
        key: pageKey,
        storageName,
      });
    } else {
      await this.fetchExistingOrNew({ storageName, pageKey, breadcrumbs });
    }
  };

  handleSaveInIndexDB = async (params: SaveInIndexDBParamsType):Promise<void> => {
    const {
      pageName,
      targetId,
      baseBreadCrumbs,
      storageName,
      targetName,
      targetUrl,
      parentRange,
      parentSubCategory,
      parentCategory,
      parentBusiness,
    } = params;
    const pageKey = `${pageName}/${targetId}`;
    const isKeyExists = await this.checkKeyExisting(storageName, pageKey);
    const updatedBreadcrumbs = [ ...baseBreadCrumbs,
      ...(parentBusiness ? [ parentBusiness ] : []),
      ...(parentCategory ? [ parentCategory ] : []),
      ...(parentSubCategory ? [ parentSubCategory ] : []),
      ...(parentRange ? [ parentRange ] : []),
      {
        id: targetId,
        itemType: pageName as TBreadcrumbItemType,
        name: targetName,
        nameForChat: '',
        url: targetUrl,
      } ];

    if (isKeyExists) {
      await this.updateStorage({
        storageName,
        key: pageKey,
        newData: updatedBreadcrumbs,
      });
    } else {
      await this.addToStorage({
        storageName,
        objectToAdd: updatedBreadcrumbs,
        key: pageKey,
      });
    }

    if (this.channel !== ClientApps.PPW) {
      return;
    }

    window.location.href = targetUrl;
  };

  buildBreadcrumbsForBusiness = async ({
    storageName,
    getActiveBusinessCallBack,
    id,
  }):Promise<TBreadcrumbs[]> => {
    const activeBusiness = getActiveBusinessCallBack(id);
    const breadcrumbsFromStorage = await this.getValidatedBreadcrumbs({
      storageName,
      key: `${ALLPRODUCTS}/`,
    });

    const businessPageBreadcrumbItem = {
      id,
      itemType: BUSINESS as TBreadcrumbItemType,
      name: activeBusiness.name,
      nameForChat: '',
      url: activeBusiness.url,
    };

    const additionalBreadcrumbs = this.channel === ClientApps.PBS
      ? []
      : [ businessPageBreadcrumbItem ];

    return breadcrumbsFromStorage.concat(additionalBreadcrumbs);
  };

  getExistingOrUpdateForBusiness = async ({
    storageName,
    currentPageStorageKey,
    id,
    getActiveBusinessCallBack,
  }):Promise<TBreadcrumbs[]> => {
    await this.connectDataBase();
    const isKeyExists = await this.checkKeyExisting(
      storageName,
      currentPageStorageKey,
    );

    if (isKeyExists) {
      return this.getValidatedBreadcrumbs({
        storageName,
        key: currentPageStorageKey,
      });
    }

    if (!id) return [];

    const updatedBreadCrumbs = await this.buildBreadcrumbsForBusiness({
      storageName,
      getActiveBusinessCallBack,
      id,
    });

    await this.addToStorage({
      storageName,
      objectToAdd: updatedBreadCrumbs,
      key: currentPageStorageKey,
    });

    return updatedBreadCrumbs;
  };
}

export const indexDBBreadcrumbs = new IndexDBBreadcrumbsService();
