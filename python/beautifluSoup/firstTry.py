from bs4 import BeautifulSoup
import urllib.request
import ssl
import xlwt

ssl._create_default_https_context = ssl._create_unverified_context

headers = {
    # 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:23.0) Gecko/20100101 Firefox/23.0 ',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-HK,zh-TW;q=0.9,zh;q=0.8,ar;q=0.7,zh-CN;q=0.6',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
}

workbook = xlwt.Workbook(encoding='ascii')

img_sheet = workbook.add_sheet('my_sheet')

def get_html(url):
    req = urllib.request.Request(url)
    req.add_header('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36')
    res = urllib.request.urlopen(url)
    return res.read().decode('utf-8', 'ignore')


def insert_sheet(alt, src,index):
    style = xlwt.XFStyle()
    font = xlwt.Font()
    font.name = 'Time New Roman'
    font.bold = True
    font.underline = True
    font.italic = True
    style.font = font

    img_sheet.write(index, 0, alt)
    img_sheet.write(index, 1, src)
    tall_style = xlwt.easyxf('font:height 200')
    row = img_sheet.row(index)
    row.set_style(tall_style)
    img_sheet.col(0).width = 3333


def get_images():
    html = get_html('https://www.meitulu.com/t/meizi/')
    soup = BeautifulSoup(html, 'lxml')
    images = soup.find_all('img')

    for index in range(len(images)):
        insert_sheet(images[index].get('alt'), images[index].get('src'), index)

    workbook.save('formatting.xls')


get_images()
