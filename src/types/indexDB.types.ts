import {TBreadcrumbs} from "./breadcrumbs";

export type GetFromStorageParamsType = {
    key: string;
    storageName: string;
};

export type SaveInIndexDBParamsType = {
    pageName: string;
    targetId: string;
    baseBreadCrumbs: TBreadcrumbs[];
    storageName: string;
    targetName: string;
    targetUrl: string;
    parentRange?: string;
    parentSubCategory?: string;
    parentCategory?: string;
    parentBusiness?: string;
};

export type SetNewStorageParamsType = {
    storageName: string;
    dataToInsert: any;
    key: string;
};

export type AddToStorageParamsType = {
    storageName: string;
    objectToAdd: any;
    key: string;
};

export type StorageParamsType = {
    storageName: string;
    key: string;
    newData: any;
};