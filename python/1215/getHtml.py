# import requests

# def getHTMLText(url):
#     try:
#         r = requests.get(url, timeout=300)
#         r.raise_for_status()
#         r.encoding = r.apparent_encoding
#         return r.text
#     except:
#         return "产生异常"

# if _name_ =="_main_":
#         url="http://www.baidu.com"
#         print(getHTMLText())


# import requests
# keyword="Python"
# try:
#      kv={'wd':keyword}
#      r=requests.get("http://www.baidu.com/s" , params=kv)
#      print(r.request.url)
#      r.raise_for_status()
#      print(r.text)
# except:
#      print("爬取失败")

# import requests

# base_url = "http://httpbin.org"

# r_get = requests.get(base_url + "/get")
# print(r_get.status_code)


# print(base_url + "/get")



import requests,json

def getMyFirstRequest(url, params, headers):
    r = requests.post(url, json.dumps(params), headers=headers)
    print(r.request.url)
    # r.raise_fo(r_status()
    # print(json.loads(r.text))
    # print('--------------------')
    resArr = json.loads(r.text)['data']['resultList']
    # print(json.loads(r.text)['data']['resultList'])

    for item in resArr:
        print(item['teacherName'])


    # print(r.content)

params = {
    'pageIndex': 1,
    'pageSize': 100
}

header = {'token': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJjaGFvc2hvIiwiY3JlYXRlZCI6MTYwNzk5ODUzMDAxMCwiZXhwIjoxNjA4NjAzMzMwfQ.9Gca0dZ6nhsa9LXWxX02JMeeXGLWoWpsCOqZWg4oS7t2u5BjOU4DOt4HSkAbA7uqf9cZ72wLuENSsWibnRkU2Q',
'opt-code': 'f53c59764eb275e907b6d441256cef8b',
'Content-Type': 'application/json;charset=UTF-8'}

getMyFirstRequest('http://edustatic-demo.my4399.com/webadmin/api/admin/teacher/headTeacher/index',params, header)

