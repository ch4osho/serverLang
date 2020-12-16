from bs4 import BeautifulSoup
import requests
import ssl
import urllib.request
import os


x = 0


ssl._create_default_https_context = ssl._create_unverified_context


# testUrl = 'https://image.baidu.com/search/index?tn=baiduimage&ps=1&ct=201326592&lm=-1&cl=2&nc=1&ie=utf-8&word=柠檬茶'
testUrl = 'https://www.codeprj.com/blog/725f0b1.html'

def getHtml(url):
    response = requests.get(url)
    html = response.text
    soup = BeautifulSoup(html,'html.parser')
    pics = soup.find_all('img')

    for img in pics:
        link = img.get('src')
        global x
        urllib.request.urlretrieve(link,'d:/chaos/serverLang/python/1215/images/%s.jpg' % x)
        x += 1
        print('正在下载第%s张图片' % x)
        print(link)

getHtml(testUrl)


