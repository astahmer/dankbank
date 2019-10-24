import { getProp, isDev, setProp } from "@/functions/utils";

class MemoryManager {
    get(key: string) {
        if (!this.isClientGuard(key)) {
            return;
        }

        const path = key.split(".");
        const rawData = localStorage.getItem(path[0]);
        const data = rawData && rawData !== "undefined" ? this.getObjectOrString(rawData) : {};
        return path.length > 1 ? getProp(data, path.slice(1).join(".")) : data;
    }

    set(key: string, value: any) {
        if (!this.isClientGuard(key, value)) {
            return;
        }

        const path = key.split(".");
        let data = this.get(path[0]) || {};

        if (path.length > 1) {
            setProp(data, path.slice(1), value);
        } else {
            data = value;
        }

        localStorage.setItem(path[0], JSON.stringify(data));
    }

    remove(key: string) {
        if (!this.isClientGuard(key)) {
            return;
        }

        localStorage.removeItem(key);
    }

    getObjectOrString(value: string) {
        try {
            return JSON.parse(value);
        } catch (error) {
            return value;
        }
    }

    private isClientGuard(key?: string, value?: any) {
        if (!process.browser) {
            if (isDev) {
                if (value) {
                    console.warn(`Memory.set("${key}", value) was called on server-side with value`, value);
                } else {
                    console.warn(`Memory.get("${key}") or Memory.remove("${key}") was called on server-side.`);
                }
            }
            return false;
        }

        return true;
    }
}

export const Memory = new MemoryManager();
