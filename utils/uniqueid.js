module.exports = function uuid2(len) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [];

    if (len) {
        for (let i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * chars.length];
        }
    }

    let id = `sw_${uuid.join('')}_${new Date().getTime()}`

    return id;
}
