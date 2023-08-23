export { deepclone}

const deepclone = (obj, targetObj) => {
    let res
    if (typeof obj == 'object') {
        // console.log("object", obj)
        // console.log("targetObj", targetObj)
        if (targetObj) {
            Array.isArray(targetObj) ? initArray(targetObj) : initObject(targetObj);
            res = targetObj
        } else {
            res = Array.isArray(obj) ? [] : {};
        }
        // console.log(obj)
        // console.log(res)
        for (const key in obj) {
            // console.log("obj", obj[key])
            if (obj[key] instanceof Object) {
                res[key] = deepclone(obj[key]);
                // console.log("res", res[key])
            } else {
                res[key] = obj[key];
                // console.log("res", res[key])
            }
        }
    } else {
        // console.log("not object", obj)
        res = obj
    }
    return res;
};