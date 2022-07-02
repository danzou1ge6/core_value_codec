var TOKEN_LIST = [
    '富强', '民主', '文明', '和谐',
    '自由', '平等', '公正', '法治',
    '爱国', '敬业', '诚信', '友善'
];
function tokenToCode(tok) {
    switch (tok) {
        case '富强':
            return 0;
        case '民主':
            return 1;
        case '文明':
            return 2;
        case '和谐':
            return 3;
        case '自由':
            return 4;
        case '平等':
            return 5;
        case '公正':
            return 6;
        case '法治':
            return 7;
        case '爱国':
            return 8;
        case '敬业':
            return 9;
        case '诚信':
            return 10;
        case '友善':
            return 11;
        default:
            throw (new Error("Invalid Token ".concat(tok)));
    }
}
function codeToToken(code) {
    var tok = TOKEN_LIST[code];
    if (tok === undefined) {
        throw (new Error("Invalid Token code ".concat(code)));
    }
    return tok;
}
/** Encode to Token */
function uint8ToTokens(uint8) {
    /**
     * 将一个字节 `uint8` 转换为三个甚至两个 Token
     * 如果 `uint8` ∈ [0, 131] ，直接将 `uint8` 通过十二进制转换为两个 Token
     *   此时第一个 Token 的 code 一定小于等于 10
     * 如果 `uint8` ∈ [132, 255] ，返回三个 Token `[a, b, c]`
     *   其中 `a` 的 code 为 11 ，`b``c` 由 `uint8` 减去 132 后再转十二进制得到
     */
    if (uint8 < 132) {
        var b = uint8 % 12;
        var a = (uint8 - b) / 12;
        return [codeToToken(a), codeToToken(b)];
    }
    else {
        var tmp = uint8 - 132;
        var c = tmp % 12;
        var b = (tmp - c) / 12;
        return [codeToToken(11), codeToToken(b), codeToToken(c)];
    }
}
function uint8ArrayToTokens(uint8Array) {
    var ret = [];
    for (var _i = 0, uint8Array_1 = uint8Array; _i < uint8Array_1.length; _i++) {
        var uint8 = uint8Array_1[_i];
        uint8ToTokens(uint8).forEach(function (token) { return ret.push(token); });
    }
    return ret;
}
/** Decode Token */
var TokenBuffer = /** @class */ (function () {
    function TokenBuffer(tokens) {
        this.tokens = tokens;
        this.pointer = 0;
    }
    Object.defineProperty(TokenBuffer.prototype, "left", {
        get: function () {
            return this.tokens.length - this.pointer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TokenBuffer.prototype, "length", {
        get: function () {
            return this.tokens.length;
        },
        enumerable: false,
        configurable: true
    });
    TokenBuffer.prototype._readNToken = function (n) {
        if (this.left < n) {
            throw (new Error("Attempted to read ".concat(n, " Token but only ").concat(this.left, " left")));
        }
        var ret = this.tokens.slice(this.pointer, this.pointer + n);
        this.pointer += n;
        return ret;
    };
    TokenBuffer.prototype.readUint8 = function () {
        var a = tokenToCode(this._readNToken(1)[0]);
        if (a == 11) {
            var _a = this._readNToken(2).map(tokenToCode), b = _a[0], c = _a[1];
            return 132 + b * 12 + c;
        }
        else {
            var b = tokenToCode(this._readNToken(1)[0]);
            return a * 12 + b;
        }
    };
    return TokenBuffer;
}());
function tokensToUint8Array(tokens) {
    var tokenBuffer = new TokenBuffer(tokens);
    var ret = [];
    while (tokenBuffer.left > 0) {
        ret.push(tokenBuffer.readUint8());
    }
    return ret;
}
/** 工具 */
function splitCVString(str) {
    var ret = [];
    for (var i = 0; i < str.length; i += 2) {
        ret.push(str.slice(i, i + 2));
    }
    return ret;
}
export { tokensToUint8Array, uint8ArrayToTokens, uint8ToTokens, TokenBuffer, splitCVString };
