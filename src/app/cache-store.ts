import {from, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

type CacheRecord<DataType> = { data: DataType, createdAtEpoch: number };
export type Cache<DataType> = { [key: string]: CacheRecord<DataType> };

// TODO: Possibly provide through dependency injection
export class CacheStore<DataType = any> {
    private readonly inMemoryCache: Cache<DataType> = {};

    constructor(
        private cacheKeyPrefix: string,
        private cacheDurationSeconds: number
    ) {}

    public get<OverrideDataType extends DataType>(key: string): OverrideDataType {
        const cacheKey = this.getCacheKey(key);
        const { cacheRecord, isFromMemory } = this.getCacheRecord<OverrideDataType>(cacheKey);

        if (!cacheRecord) return null;
        if (this.checkIsExpired(cacheRecord)) {
            this.delete(key);
            return null;
        }

        if (!isFromMemory) this.inMemoryCache[cacheKey] = cacheRecord;

        return cacheRecord?.data;
    }

    public getOrProvide<OverrideDataType extends DataType>(
        key: string,
        providerObservable: Observable<OverrideDataType>
    ): Observable<OverrideDataType> {
        const cachedData = this.get<OverrideDataType>(key);
        if (cachedData) return from([cachedData]);

        return providerObservable.pipe(tap(data => this.set(key, data)));
    }

    public set(key: string, data: DataType): void {
        this.delete(key);

        const cacheKey = this.getCacheKey(key);
        const cacheRecord: CacheRecord<DataType> = { data, createdAtEpoch: Date.now()  };

        localStorage.setItem(cacheKey, JSON.stringify(cacheRecord));
    }

    public delete(key: string): void {
        const cacheKey = this.getCacheKey(key);

        localStorage.removeItem(cacheKey);
        delete this.inMemoryCache[cacheKey];
    }

    private getCacheRecord<OverrideDataType extends DataType>(cacheKey: string): { cacheRecord: CacheRecord<OverrideDataType>, isFromMemory: boolean } {
        const memoryCacheRecord = this.inMemoryCache[cacheKey] as CacheRecord<OverrideDataType>;
        if (memoryCacheRecord) return { cacheRecord: memoryCacheRecord, isFromMemory: true };

        const browserCacheString = localStorage.getItem(cacheKey);
        const browserCacheRecord = browserCacheString ? JSON.parse(browserCacheString) as CacheRecord<OverrideDataType> : null;
        return { cacheRecord: browserCacheRecord, isFromMemory: false };
    }

    private checkIsExpired(cacheRecord: CacheRecord<DataType>): boolean {
        const secondsSinceCreation = Math.floor((Date.now() - cacheRecord.createdAtEpoch) / 1000);
        return secondsSinceCreation >= this.cacheDurationSeconds;
    }

    private getCacheKey(key: string): string {
        return (this.cacheKeyPrefix + '_' + key).toUpperCase();
    }
}
