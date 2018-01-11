export interface LocalStorage{
    length: number;
    setItem: setItem;
    getItem: getItem;
    removeItem: removeItem;
    clear: clear;
    key: key;
};
interface setItem {
    (key:string, value:any): void;
}
interface getItem {
    (key:string): any;
}
interface removeItem {
    (key:string): void;
}
interface clear {
    (): void;
}
interface key {
    (index:number): string;
}
