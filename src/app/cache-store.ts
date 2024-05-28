export type Cache<DataType> = { [key: string]: CacheRecord<DataType> };
type CacheRecord<DataType> = { data: DataType, createdAtEpoch: number }

// TODO: Possibly provide a helper function (getOrSetCache) that takes the key and a function to populate the key if the data is not already cached. returns the cached value if available otherwise calls populateFunction
// TODO: Possibly provide through dependency injection
export class CacheStore<DataType = any> {
    private readonly inMemoryCache: Cache<DataType> = {};

    constructor(
        private cacheKeyPrefix: string,
        private cacheDurationSeconds: number
    ) {}

    public get<OverrideDataType extends DataType>(key: string): OverrideDataType {
        const cacheKey = this.getCacheKey(key);
        let cacheRecord = this.inMemoryCache[cacheKey];

        if (!cacheRecord) {
           const browserCacheRecord = localStorage.getItem(cacheKey);
           if (browserCacheRecord) {
               cacheRecord = JSON.parse(browserCacheRecord);
               this.inMemoryCache[cacheKey] = cacheRecord;
           }
        }

        if (cacheRecord && this.checkIsExpired(cacheRecord)) {
            this.delete(key);
            cacheRecord = null;
        }

        return cacheRecord?.data as OverrideDataType;
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

    private checkIsExpired(cacheRecord: CacheRecord<DataType>): boolean {
        const secondsSinceCreation = Math.floor((Date.now() - cacheRecord.createdAtEpoch) / 1000);
        return secondsSinceCreation >= this.cacheDurationSeconds;
    }

    private getCacheKey(key: string): string {
        return (this.cacheKeyPrefix + '_' + key).toUpperCase();
    }
}