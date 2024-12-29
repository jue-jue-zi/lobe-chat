import { clientDB } from '@/database/client/db';
import { DataImporterRepos } from '@/database/repositories/dataImporter';
import { BaseClientService } from '@/services/baseClientService';
import { useUserStore } from '@/store/user';
import { ImportStage } from '@/types/importer';

import { IImportService } from './type';

export class ClientService extends BaseClientService implements IImportService {
  private get dataImporter(): DataImporterRepos {
    return new DataImporterRepos(clientDB as any, this.userId);
  }

  importSettings: IImportService['importSettings'] = async (settings) => {
    await useUserStore.getState().importAppSettings(settings);
  };

  importData: IImportService['importData'] = async (data, callbacks) => {
    callbacks?.onStageChange?.(ImportStage.Importing);
    const time = Date.now();
    try {
      const result = await this.dataImporter.importData(data);
      const duration = Date.now() - time;

      callbacks?.onStageChange?.(ImportStage.Success);
      callbacks?.onSuccess?.(result, duration);
    } catch (e) {
      console.error(e);
      callbacks?.onStageChange?.(ImportStage.Error);
      const error = e as Error;

      callbacks?.onError?.({ code: 'ImportError', httpStatus: 0, message: error.message });
    }
  };
}