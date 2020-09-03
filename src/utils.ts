export function normalize(arr: number[]): number[] {
    let sum = arr.reduce((total, val) => total + val, 0);
    return arr.map(v => v / sum);
}