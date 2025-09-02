使用下来 fastJson 真的不如 Jackson

# 特殊操作
<u>Object 转 JSONObject</u> ：Object 先转 JSONString ，再转 JSONObject。如果直接转容易报错
- `JSONObject.parse(JSONObject.toJSONString(child))`



