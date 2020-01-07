from bs4 import BeautifulSoup
import requests
import ssl
import urllib.request

x = 0

ssl._create_default_https_context = ssl._create_unverified_context


def getDbImage(page=1):
    response = requests.get('https://www.dbmeinv.com/?pager_offset={}'.format(page))
    # response = requests.get('https://www.dbmeinv.com/index.htm?cid=2'.format(page))
    html = response.text
    soup = BeautifulSoup(html, 'html.parser')
    girl = soup.find_all('img')
    for img in girl:
        link = img.get('src')
        global x
        urllib.request.urlretrieve(link, 'images/%s.jpg' % x)
        x += 1
        print('正在下载第%s张图片' % x)
        print(link)


for i in range(1, 11):
    print("正在下载第{}页图片".format(i))
    getDbImage(i)