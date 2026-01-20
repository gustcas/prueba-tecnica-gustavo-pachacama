export function isValidEcuadorianId(cedula: string) {
    if (!/^[0-9]{10}$/.test(cedula)) {
        return false;
    }

    const province = Number(cedula.slice(0, 2));
    if (province < 1 || province > 24) {
        return false;
    }

    const third = Number(cedula.charAt(2));
    if (third >= 6) {
        return false;
    }

    const digits = cedula.split('').map((d) => Number(d));
    let sum = 0;

    for (let i = 0; i < 9; i++) {
        let value = digits[i];
        if (i % 2 === 0) {
            value = value * 2;
            if (value > 9) {
                value -= 9;
            }
        }
        sum += value;
    }

    const verifier = digits[9];
    const nextTen = Math.ceil(sum / 10) * 10;
    const checkDigit = nextTen - sum === 10 ? 0 : nextTen - sum;

    return verifier === checkDigit;
}
