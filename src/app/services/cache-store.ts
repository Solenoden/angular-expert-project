import {from, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Inject, Injectable, InjectionToken} from '@angular/core';

type CacheRecord<DataType> = { data: DataType, createdAtEpoch: number };
export type Cache<DataType> = { [key: string]: CacheRecord<DataType> };

export type CacheStoreConfig = { cacheKeyPrefix: string; cacheDurationSeconds?: number };
export const CACHE_STORE_CONFIG = new InjectionToken<CacheStoreConfig>('CacheStore.Config');

@Injectable()
export class CacheStore<DataType = unknown> {
    protected readonly inMemoryCache: Cache<DataType> = {};

    constructor(
        @Inject(CACHE_STORE_CONFIG) private config: CacheStoreConfig
    ) {}

    // Creates a child store, based on the parent's config
    public partitionStore<NewDataType extends DataType>(partitionConfig: CacheStoreConfig): CacheStore<NewDataType> {
        return new CacheStore<NewDataType>({
            cacheKeyPrefix: this.getCacheKey(partitionConfig.cacheKeyPrefix),
            cacheDurationSeconds: partitionConfig.cacheDurationSeconds ?? this.config.cacheDurationSeconds
        });
    }

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
        return secondsSinceCreation >= this.config.cacheDurationSeconds;
    }

    private getCacheKey(key: string): string {
        const cacheKey = this.config.cacheKeyPrefix ? this.config.cacheKeyPrefix + '_' + key : key;
        return cacheKey.toUpperCase();
    }
}
