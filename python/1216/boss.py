from bs4 import BeautifulSoup
import requests
import ssl
import urllib.request
import os

header = {
    'cookies': 'lastCity=101280100; sid=sem_pz_bdpc_dasou_title; __zp_seo_uuid__=59940158-d7ef-479c-975f-d297d82eef87; __g=sem_pz_bdpc_dasou_title; Hm_lvt_194df3105ad7148dcf2b98a91b5e727a=1608110519; __fid=cd56af6329b58ab9f68b5b0927f0fca9; __c=1608110519; __l=r=https%3A%2F%2Fwww.baidu.com%2Fother.php%3Fsc.000000jhMmdNfVWeteWrlZy9x8i5YQyLiDKr-lK4JowfbITgKulN1nVrofh585_cyynS-hQv_i4aV8fKc8Y_PS-7AoWcmeyP_u2EokVjmhFEAnGVG19HDxVyFLF7UaAoOVsJKcQWSYLVrLR_5JJrA5cOKtLaRt2HDMxMoVCNOfyBq3d4RpH3Y7G664N_dhpSy2cRQxOawV4do84p061yiNLKuTDr.7D_NR2Ar5Od663rj6t8AGSPticrtXFBPrM-kt5QxIW94UhmLmry6S9wiGyAp7BEIu80.TLFWgv-b5HDkrfK1ThPGujYknHb0THY0IAYqmhq1TqpkkoB4Jt8S0ZN1ugFxIZ-suHYs0A7bgLw4TARqnsKLULFb5yFETL5y_Tp38IMPS0KzmLmqnfKdThkxpyfqnHRkrHfsn1fknsKVINqGujYknWTvP1Tsn0KVgv-b5HDsPW6Lnjmd0AdYTAkxpyfqnHDdn1f0TZuxpyfqn0KGuAnqiD4K0APzm1Y1PWfLP6%26ck%3D4190.1.96.265.149.263.146.112%26dt%3D1608110510%26wd%3Dboss%25E7%259B%25B4%25E8%2581%2598%25E5%2585%25AC%25E5%258F%25B8%26tpl%3Dtpl_11534_22836_18980%26l%3D1519403413%26us%3DlinkName%253D%2525E6%2525A0%252587%2525E5%252587%252586%2525E5%2525A4%2525B4%2525E9%252583%2525A8-%2525E4%2525B8%2525BB%2525E6%2525A0%252587%2525E9%2525A2%252598%2526linkText%253DBOSS%2525E7%25259B%2525B4%2525E8%252581%252598%2525E2%252580%252594%2525E2%252580%252594%2525E6%252589%2525BE%2525E5%2525B7%2525A5%2525E4%2525BD%25259C%2525EF%2525BC%25258C%2525E6%252588%252591%2525E8%2525A6%252581%2525E8%2525B7%25259F%2525E8%252580%252581%2525E6%25259D%2525BF%2525E8%2525B0%252588%2525EF%2525BC%252581%2526linkType%253D&l=%2Fwww.zhipin.com%2Fc101280100-p100101%2F%3Fpage%3D1&s=3&g=%2Fwww.zhipin.com%2Fguangzhou%2F%3Fsid%3Dsem_pz_bdpc_dasou_title&friend_source=0&s=3&friend_source=0; __a=88579173.1608110519..1608110519.5.1.5.5; __zp_stoken__=6f7dbfCBaaxETBXVeEjx2eSljaXlUdB0yXgQKXD9kP086b1BgfnxpcUdzejV%2FLnVjGkduET9XVyBhBgcPfH5uNm5VV11PZUlbFhAybi0QCzdYewZcHmgjGW1jcxhRfSAZHBZkAn93DABsZDhsdA%3D%3D; Hm_lpvt_194df3105ad7148dcf2b98a91b5e727a=1608111277',
    'authority': 'www.zhipin.com',
    'path': '/c101280100-p100101/?page=1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
}

def getBossInfo(page=1):
    res = requests.get('https://www.zhipin.com/c101280100-p100101/?page={}'.format(page),headers=header)


    html = res.text
    soup = BeautifulSoup(html, 'html.parser')
    print(html)
    jobs = soup.find_all('div',class_='job-primary')
    for job in jobs:
        print(job)



for i in range(1,11):
    print('第{}'.format(i))
    getBossInfo(i)



