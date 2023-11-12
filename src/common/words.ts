
//获取key
export const keyToWords = function(key: string) {
    switch(key) {
        case "title":
            return "标题";
        case "creator":
            return "作者";
        case "publisher":
            return "出版商";
        case "description":
            return "描述";
        case "identifier":
            return "标识";
        case "language":
            return "语言";
        case "modified_date":
            return "修改时间";
        case "pubdate":
            return "上传时间";
        case "rights":
            return "内容";
        default:
            return key;
    }
}