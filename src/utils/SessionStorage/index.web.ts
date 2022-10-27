function setSessionByKey<T>(key: string, data: T): Promise<void> {
    sessionStorage.setItem(key, JSON.stringify(data));
    return Promise.resolve();
}

function getSessionByKey<T>(key: string): Promise<T | undefined> {
    const localData = sessionStorage.getItem(key);
    if (localData !== null) {
        return Promise.resolve(JSON.parse(localData) as T);
    }
    return Promise.resolve(undefined);
}

function resetSessionByKey(key: string): Promise<void> {
    sessionStorage.removeItem(key);
    return Promise.resolve();
}

function clearSession(): Promise<void> {
    sessionStorage.clear();
    return Promise.resolve();
}

export default {
    setSessionByKey,
    getSessionByKey,
    resetSessionByKey,
    clearSession,
};
