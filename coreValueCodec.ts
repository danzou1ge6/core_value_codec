type Token = '富强' | '民主' | '文明' | '和谐' | '自由' | 
    '平等' | '公正' | '法治' | '爱国' | '敬业' | '诚信' | '友善'

const TOKEN_LIST: Array<Token> = [
    '富强', '民主', '文明', '和谐',
    '自由', '平等', '公正', '法治',
    '爱国', '敬业', '诚信', '友善'
]

function tokenToCode(tok: Token) : number {
    switch(tok) {
        case '富强':
            return 0
        case '民主':
            return 1
        case '文明':
            return 2
        case '和谐':
            return 3
        case '自由':
            return 4
        case '平等':
            return 5
        case '公正':
            return 6
        case '法治':
            return 7
        case '爱国':
            return 8
        case '敬业':
            return 9
        case '诚信':
            return 10
        case '友善':
            return 11
        default:
            throw(new Error(`Invalid Token ${tok}`))
    }
}

/**
* 概念:
*   Token: 富强，民主，...
*   code: 赋予每一个 Token 的数字，从前往后依次为 0, 1, ..., 11
*   uint8: 占一个字节的无符号整型
*
* 加密过程：
* 将每一个字节 `uint8` 转换为三个甚至两个 Token
* 如果 `uint8` ∈ [0, 131] ，直接将 `uint8` 通过十二进制转换为两个 Token
*   此时第一个 Token 的 code 一定小于等于 10
*   eg. 123 = 10 * 12 + 3 ，转换为 [10, 3]
* 如果 `uint8` ∈ [132, 255] ，返回三个 Token `[a, b, c]`
*   其中 `a` 的 code 为 11 ，`b``c` 由 `uint8` 减去 132 后再转十二进制得到
*   eg. 220 = 132 + 88 = 132 + 7 * 12 + 4 ，返回 [11, 7, 4]
*
* 解密过程：
* 逆转加密过程即可
*/

function codeToToken(code: number) : Token {
    const tok = TOKEN_LIST[code]
    if(tok === undefined) {
        throw(new Error(`Invalid Token code ${code}`))
    }
    return tok
}

/** Encode to Token */

function uint8ToTokens(uint8: number) : Array<Token> {
    if(uint8 < 132) {
        const b = uint8 % 12
        const a = (uint8 - b) / 12
        return [codeToToken(a), codeToToken(b)]
    }else {
        const tmp = uint8 - 132
        const c = tmp % 12
        const b = (tmp - c) / 12
        return [codeToToken(11), codeToToken(b), codeToToken(c)]
    }
}

function uint8ArrayToTokens(uint8Array: Array<number>) : Array<Token> {
    let ret: Array<Token> = []
    for(const uint8 of uint8Array) {
        uint8ToTokens(uint8).forEach(token => ret.push(token))
    }
    return ret
}

/** Decode Token */

class TokenBuffer{
    tokens: Array<Token>
    pointer: number
    constructor(tokens: Array<Token>) {
        this.tokens = tokens
        this.pointer = 0
    }
    get left() {
        return this.tokens.length - this.pointer
    }
    get length() {
        return this.tokens.length
    }
    _readNToken(n: number): Array<Token> {
        if(this.left < n) {
            throw(new Error(`Attempted to read ${n} Token but only ${this.left} left`))
        }

        const ret = this.tokens.slice(this.pointer, this.pointer + n)
        this.pointer += n
        return ret
    }
    readUint8(): number {
        const a = tokenToCode(this._readNToken(1)[0])

        if(a == 11) {
            const [b, c] = this._readNToken(2).map(tokenToCode)
            return 132 + b * 12 + c
        }else {
            const b = tokenToCode(this._readNToken(1)[0])
            return a * 12 + b
        }
    }
}

function tokensToUint8Array(tokens: Array<Token>): Array<number> {
    const tokenBuffer = new TokenBuffer(tokens)

    let ret: Array<number> = []
    while(tokenBuffer.left > 0) {
        ret.push(tokenBuffer.readUint8())
    }

    return ret
}

/** 工具 */

function splitCVString(str: string): Array<Token> {
    let ret: Array<string> = []
    for(let i = 0; i < str.length; i += 2) {
        ret.push(str.slice(i, i + 2))
    }
    return ret as Array<Token>
}

export { tokensToUint8Array, uint8ArrayToTokens, uint8ToTokens, TokenBuffer, splitCVString }
