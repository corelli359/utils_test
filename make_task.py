import json
import re

with open('task_temp.txt', 'r', encoding='utf-8') as f:
    arr = f.readlines()
arr = list(set(arr))

# arr = [
#     '杭州临安博济堂科技服务有限公司',
#     '廊坊中冶寰泰生态城建设发展有限公司',
#     '华夏幸福（上海)股权投资基金合伙企业（有限合伙）'
# ]

new_task = ""
for ar in arr:
    ar = re.sub('\s', '', ar)
    task = {"ENTNAME": ar, "ENTTYPE": None, "PRIPID": None}
    new_task += '{}\n'.format(json.dumps(task, ensure_ascii=False))

with open('make_task.txt', 'w') as f:
    f.write(new_task)
