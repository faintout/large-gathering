//imagesList 参数说明
// name: 图片名称（相位code) -1代表为冲突图片
// aliasName: 别名（无用）
// base64Src: base64图片，用于渲染
// sort: 排序，绘制时用于排序
// width: 图片宽度
// height: 图片高度
// phaseCode: 用来区分相位类型，4-左掉头，2-左转，1-直行，3-右转，5-左转掉头
const imagesList = [
    {
        name: '4',
        //别名
        aliasName: '左掉头',
        width: 22,
        height: 38,
        base64Src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAABMCAYAAAAWcFVbAAAAAXNSR0IArs4c6QAAA1tJREFUaEPtms9SE0EQxrt3lxJPwNEqUiYXiV4MTyB5AvEJwJuFe/ANJG+AVcHyZnwCiicQnwA8uRSHLAl3cxSzS0uvIcawf3pmZ6XKmlyZ6fml55v+JkwjVPCp998sL8DPuutCCz1nicawwsvgAnynS/gKi1EYPPgQ6iyNOpPS5jDk/XvRFsWwiQAtAljOjY3EwEfxmN6dNd6fSDlKAzf7/gZ48PZ68Q3poinjjiCCTtDoHhXF0AbmjC660R4gbBUtIv47Ug/cuJMnFy1gzip6cFC47WLSmYFIYQz04mw1XSbKwM2hz9u/q8OiNAdpO1jd/zQ/Rwn4n8H+oWwHtb91LQa+A1gggBF60fqspkXATy52WlfkHCttqaHBBHByWuuu34QrBE6qwcL4GAjrhhjUw1xBJ3jYTc5NIfBdSGH+G7E0LiOvETb2RrnAzf6rOnheXz0lFcyYZDkfeOD3ShnDxH4hxnNyYBkBnuo6Imf5tNZdyQe+eN3X1C5bbGe+JHHeedfI8w74vqGxD+1M4EcDf9NBONAIyqCFxtLU2b0r6GQCawX8ndVCWE6CTvUhosNM4LWhf6y0bUjhtZU2VHakee7vgpPc9GQfxDA7w0OfZFEmozK8Py+GahVKnC8toGogjvEj8la4Tip9ST6EionJAE4u5Z+liyPAybcZ+5TOS6rGXQDzT52g1m2rgN6MtcDCrNkMZyXKyKGzGs7Roc2w8JBOh9myJsyYLWu2rM1lwErCSsJKQlg/rTULE2WtWelHqL0P2/vw7QxYa7bWbK1Z6DjWmoWJstZsrTlLKvYfKcJDZK0505rXhv4eIi3xnRbc+As3U0w6pcSPMrP34eQFynU2wMFn/MZ80zZgTMNJv5kX9acNR/ygTcg9ZfK2LqSQCA8R6fn0bZrjuHG7qKFO69CVeFfOlrjwoVELmFd9PPS5rWtTeMjyhyH1gtX9l5JY2sC3pCFZLW2MUApG3umMSEMoBSPApaWhIAVjwNrSUJSCMWAO1BzsbAM6H5VkrCgFo8DK0tCQgnFgsTQ0pWAcmAOKqoamFCoBLpRGCSlUBpwpjZJSqAw4UxolpVAp8C1pGJBC5cBTaSCNJNdGaQ3XvvxIFkiqhkNLab3pkvlpYyoF1oXKm/ffA/8C1l6XtCcddU0AAAAASUVORK5CYII=',
        sort:0,
        phaseCode:4
    },
    {
        name: '4-1',
        //别名
        aliasName: '左掉头冲突',
        width: 22,
        height: 38,
        base64Src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAABQCAYAAABiZJe7AAAAAXNSR0IArs4c6QAABKBJREFUaEPtmk9S20gUxt9rN4HsyHJqcAKLBCWbcU4QOAHmBJAdBarCOUGcE8SZmKnZDTlBhhOEG4RsElOzsMHsh6UJsl/ciuRI7ZbULbXHNTPSxgu3un96/fXXr/8gWHpWu43lO+BtsAXaAoCN4S1t/7X221lS9et9t4Ue/NlZa5+aIKBJYVVZAbrEvUMEaBDA8qQM4fPO/bfHqnecrrsBHD74/yH1xj/NzsrROx2WQsCP++6haCwGGrRKI3hz/qDdUAJfuE1g8DL2nyZ4LmCnu7cKnP8huj4lKqedantTCdx3RXSV7yJh68v9ty+S6jUGFt2JHN6rohpthACuz6vte3LDgYT+Tut+Aji78fhmb611LZczAnauDnaAUKlLJQD31jo//S40Onli+k2hToLWBn506dYZwnudgRGWYYzVP//860n0nfULt4UMhPZ1nilZaQGLbrzLvW6WDGQCGtGL8wdHrRhw3/2IADUd2qBMs1NtvwrLawGLws7l/i4wfDmWxKp2Y0jHnZWj52F5Hf3KzsGAtj+v/PBzbWAfWrjDQuWDLjQCnH2ptp+GECayIoA3Nx5vygPPCDhs2Om7TQDJRxVhl53CuXSPAWEntYeEH4tJp6qeAXMB60pkPPtdE/eehk6xnqHfpKhGPzA3cKpEgllrcLtwEu3SYMLZneqdjKhqAT/p7tdokT0j9E5kL5W71E9kILAqgneDIW+oTH8iqchYyIqq8G3iUEekLRixV4kRjvqlMHFWgeM0eOEihKx2XlXnD/JHPrnar42ILcta9Z2k8rUODJ8hYT1qpSI/SQZO0JsOvLbtBQWFVHCRb9EQ6mn5iXCdRGCn71JWw0XhNZOoHxiIPSVwUFE3Czj6/8Dj99J0q6rLeCIR6bOqIt0EJTJdxiYIkw/V6clMlzAFHusuMffNgi+BsyIU/F9GOClQVgZdqeEUHf5XIry3CoyLrErvqVBXdyNErtCKrelR2inliE0Vg6dQPmzQjrWiJbC1UCZUVEZ4LhH28+F/yNZMP3DuE0cJrBmB/Oml2LMzeOYuCStTc7lESunyMsKa4yH/oNPYsCmX+eWa7n+wposcXuuNunkPOv+0KH54nQZOeNGpto3WZmF1VnxYL6h2SpXAduKYXEsZ4TLCUgSsSMJfhFZY2vWYeLND1jO9HZVha4knWHNfcZhKrgQ2jZhpeXzY3a/dwp1e/NS9eC7hHxouDZazDtaNgdevDhpI+FrktATwiTw4hQqA4YWk04HHt5fAq/kn7wC/+GfGSLt5N7qTPsTXsJNy8c00ApPy0n2f3PVIL34HFqfpnH80vTWVCCEubFSGm7blINqbuEREGsWDMQMphFAxW7MiDVMpkPqAPlXDk1mnqDRySGF8PdLomsPUxFFIGjmkYCeXyOMaplIIutUW8MbYSzOv3EYsLLcrWAEWIEbSyCGFmSxCtVwjpxRmA5zlGjlcQbYra5IIK06VRgEpzCTCkUqnL9kXlMJsgWVpWJDCTIGnXMOCFGYOPElDkXrRa+JFMyXrgy4K5K+mlwBspo0zBS4aTdX7/0bgkUkg5n5fwum7+hs24y/7BlDPxBlrc/UDAAAAAElFTkSuQmCC',
        sort:0,
        phaseCode:4
    },
    {
        name: '2',
        //别名
        aliasName: '左转',
        width: 28,
        height: 57,
        base64Src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAACMCAYAAAAp3Wp9AAAAAXNSR0IArs4c6QAAAy9JREFUeF7t3UFu00AUBuA3iREs2yVSU5INNazSGxROUG5AdxVYIjcoN0gRLmJZThBuQI/QHS4sUuEcoEsWrgeGKlDiSV5cz8xTot/bV897f/w5k3pjRQ6Op5NX/aJsdb9tp58dLOd0CdV0tSd58ub3Gm810Yusk541Xc/1+XcO2B0PNu63r4+U0gMz1M8i2rzsHV+5HrDpencKGI8PuzqKRoqobwZQROdfO+lu02F8nF87YDxO9lREI0208XcgpU+zrZMDHwM2XbNWwDhPjsz9Vmmq9Mts6+RT02F8nL9UQHO/PYiKERHt2Ya4Lsrd770P5z4GbLomG9BsASWpEWnVtTXTRFcXnXSz6SC+zl8Y8NYW8O9+8zWJ23U1FfQ866Vn1oCzW4Db3sFW01knbVUCzm4BwcZx36ga0LoFuG8casX/A87dAkKN477PTUBuC3DfN9iKNwHNPaeiaKiJ9oO1DtOoQtT8QjG/VNblqH7JPP6R7LdaejhvU1+x5PO3CbrX/rIGIe0Bp1dpJ0+OFZH5Z3ZVj8UBTaqdyeuB0mq4ogn5gCaY+ZZdRDbYj21NKp4kZY0Pe7mA05ALt5Ko6GUPP17WaF7/T30GnE4T54l9K9HqINt+f1p/6hpnhAhoxrFtJbqkdxeP0j8Pn7wdoQLa7ssgD51CBrRtJd4fG0oEnNlKnnl98CsVcEq2bEd9r4/uJQN6+2K5vTACVj7m5Tf6IFeIa4IriCvIGRGugyiIChPk2oMoiHJGhOsgCqLCBLn2IAqinBHhOoiCqDBBrj2IgihnRLgOoiAqTJBrD6IgyhkRroMoiAoT5NqDKIhyRoTrIAqiwgS59iAKopwR4TqIgqgwQa49iIIoZ0S4DqIgKkyQaw+iIMoZEa6DKIgKE+TagyiIckaE6yAKosIEufYgCqKcEeE6iIKoMEGuPYiCKGdEuA6iICpMkGsPoiDKGRGugyiIChPk2oMoiHJGhOsgCqLCBLn2IAqinBHhOoiCqDBBrj2IgihnRLgOoiAqTJBrD6IgyhkRroMoiAoT5NqDKIhyRoTrIAqiwgS59mtP1LwiKU+sL1md99mYF3z8AtlWhboYkHSFAAAAAElFTkSuQmCC',
        sort:1,
        phaseCode:2
    },
    {
        name: '1',
                //别名
        aliasName: '直行',
        width: 16,
        height: 70,
        base64Src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAACMCAYAAAAdpKthAAAAAXNSR0IArs4c6QAAAixJREFUeF7tmz9SwkAUh9+DWKulMyKmyzHgBOIJtHQ0hZxAj8CMYcZOvQE3EG9AZ6hA0J5OmYmskwgYkpD9Q7D6pUmR7O73vn2/yTZh2uByRpfnxKWhX/G6ptOw6cBwnPN+NQjv/mHbNp3HGGBe/UO4sJiJZr/abplAGAE4g4tj2ik/k+DjCIBoMg0se2i3JroQZgAj95GYzuKLseDW69Fdc+sAUfWWFe196rIC2z+4H+pAaBtwMqqPLdj1K159awDxxstZpK4TSy0DUezmjbcWgMVQJ5bKAIrVR1w6sVQCSMZOtsc6sVQDyG+8TB5B1OlXvFMZrBQgN3ay2RViKQcwqF4nlrkAOo1nGst8AJXYybZBEsu1AAVVL41lJoBu7GQS8mKZDbBZ42XyrPtapgA2ip1MRUYs0wBbqD4vlisARTaeaixXAYqInWwbErFcAvxT9alYRgAqsWOiiSDakxWo8jwey1+ANY0niHpE9MJEnfCU44xdobLA4h0u07X4pgYR1ZLjFrHkeOzmVfa4TJ3PqfWUPGbrAvgV789wuVRjLp2EMEuTVmCz8+HeiBnth1V+BVYv72xvCpCs3hm7IUSDWexKP8fxwUUBxOcEAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAgJ6BN/dW549Lv+pJ3/8BpYKhWNJ7mkkAAAAASUVORK5CYII=',

        sort:2,
        phaseCode:1
    },
    {
        name: '1-1',
                //别名
        aliasName: '直行冲突(不存在,使用直行图片)',
        width: 16,
        height: 70,
        // base64Src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAACICAYAAAD0+ovBAAAAAXNSR0IArs4c6QAAAl1JREFUaEPtW0tO60AQ7HbMIZ5E+GwgrHjiAkQ5AeIUSBg9lAsAJwA9BcQtOAJwAswKIxYBwh6WWSRu4iDA8a/dBCEZVbbT0zWu6a5xeRSmL/xWet6/MBS+nT8+sk5n64RGd2uBXLcrRM8hh6272RPfksMEOAabqZ2T8MIbiHT7g5m1+8Wjl7KgJsCVnncmRBuTyeU8qB+3vh2w0fP2Rkn3MxILER0E9c5BGdBST7j06G04TGcFCSPQVlDvXGigKmB637JTRkXE7mAt+HN6XwSqAz5tdz+LRFs/XfUHbquoiAoBlx93DpllV4WJBbA4hzdz/9t5c3IBo+YWInNjR70iobTzRCET8L25LU8Wjy0ShRRg2SLRF5MtCinA7ObW0+fUbkoUJgALmvvLiElR+AAs0dzTgH6Iwhjw+/ZNF4U3wERzjwTaZxafHfZlaGoNCYU2malJROtM9De2hLEo8PLT9q4jvE41upAhXfcHrh9XitG+RjpZ9idBvePEgxs9r8k1WqUhNcNQLnVpmxIwuVIA0rR7CEpT5Q9KE5SkGh9Fg6LRTg0UDeF4wvGUbJMqtsWDl+XrcwUgmO8UxqttoUmLdRyAVsbUeFCqUmQNAKVWxtR4ldLGT0sbvAW8BdwT3JMmXVV8TcTHvcldxR7CARMc8G9wwJA2SFuijnVvgaJB0aBokvIPBwwHXAEH/NMfhjRDaB1XjydrQi0egBpD5nFQaqZMmwBKNYbM46DUTJk2AZQSbmbwmliB10R4fHh8eHx4fOVEx1UQroJwFZRqErRF9doi+Y+haA9rRfL3Cs+ccgn3X9rhAAAAAElFTkSuQmCC',
        base64Src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAACMCAYAAAAdpKthAAAAAXNSR0IArs4c6QAAAixJREFUeF7tmz9SwkAUh9+DWKulMyKmyzHgBOIJtHQ0hZxAj8CMYcZOvQE3EG9AZ6hA0J5OmYmskwgYkpD9Q7D6pUmR7O73vn2/yTZh2uByRpfnxKWhX/G6ptOw6cBwnPN+NQjv/mHbNp3HGGBe/UO4sJiJZr/abplAGAE4g4tj2ik/k+DjCIBoMg0se2i3JroQZgAj95GYzuKLseDW69Fdc+sAUfWWFe196rIC2z+4H+pAaBtwMqqPLdj1K159awDxxstZpK4TSy0DUezmjbcWgMVQJ5bKAIrVR1w6sVQCSMZOtsc6sVQDyG+8TB5B1OlXvFMZrBQgN3ay2RViKQcwqF4nlrkAOo1nGst8AJXYybZBEsu1AAVVL41lJoBu7GQS8mKZDbBZ42XyrPtapgA2ip1MRUYs0wBbqD4vlisARTaeaixXAYqInWwbErFcAvxT9alYRgAqsWOiiSDakxWo8jwey1+ANY0niHpE9MJEnfCU44xdobLA4h0u07X4pgYR1ZLjFrHkeOzmVfa4TJ3PqfWUPGbrAvgV789wuVRjLp2EMEuTVmCz8+HeiBnth1V+BVYv72xvCpCs3hm7IUSDWexKP8fxwUUBxOcEAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAAAzAgJ6BN/dW549Lv+pJ3/8BpYKhWNJ7mkkAAAAASUVORK5CYII=',

        sort:2,
        phaseCode:1
    },
    {
        name: '3',
                //别名
        aliasName: '右转',
        width: 28,
        height: 57,
        base64Src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAByCAYAAAAcefKaAAAAAXNSR0IArs4c6QAAAqlJREFUeF7t2E9O21AQBvAZ40WX3YIITRclYZcj0Bs0J+i+eVLIDZITNKim6rI9Adyg3ABWbdJNnAaxLTuK5OZBUKLmrz2BifSe9bEkHyN/8c+DbSZHfkrXpt7diY6fezj83AFaf18amFNmW6Gtf28721/ip851ptBBv3ZkA/5IbOPhkBu/9qKzp5RyplB5YA6J6PtUiWanELXWLeVMoWLv6OWLMPkzXcASnXGYNNYh6EyhUZHyVa1HloszZ4VtvM515Vahfu0rBfx+GTM7tI3uq5N2FkEuD4zNCrnyOVtu/9z71Eg7Hq8KPRbJIOhfoXGpVavdz0L/zS2sdt8L0fxq977Q/HWVj0JjgqPVnptCTHQzZNvKRyG2cUC2+mP382UeCp3/TcJq/Lp987jRfbpTWHKH0OoUoub0770sNLpeLFG1U4jO50uuXejhGWVjN7Rvrj5UtmxwkXavZokuOUyqqx4pnCq0/9u8C5hOVxWyRMd3SdicXC/Lck4VKvVNmwOqLzAar+Tu7gYeHzZJrjQwF0xUmX/Am6xkyWOMU2doycadWcleFSr3zCGFMy9JFlayV4Umr7HSVrJXhUYvGomomLaSvSp0cG3qt3fht7SV7FUhycFKMk5tOckBZ2VQaJP/WLO+fcnnOEM4QxInihmQAzlFTpJRIAdyEieKGZADOUVOklEgB3ISJ4oZkAM5RU6SUSAHchInihmQAzlFTpJRIAdyEieKGZADOUVOklEgB3ISJ4oZkAM5RU6SUSAHchInihmQAzlFTpJRIAdyEieKGZADOUVOklEgB3ISJ4oZkAM5RU6SUSAHchInihmQAzlFTpJRIAdyEieKGZADOUVOklEgB3ISJ4oZkAM5RU6SUSAHchInihmQAzlFTpJRIAdyEieKmdyRuwc0BkhaTbGKtgAAAABJRU5ErkJggg==',

        sort:3,
        phaseCode:3
    },
    {
        name: '2-1',
                //别名
        aliasName: '左转冲突',
        width: 28,
        height: 57,
        base64Src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAACMCAYAAAAp3Wp9AAAAAXNSR0IArs4c6QAAA6hJREFUeF7tnUFSE0EUhl8nY+kSllYRTFxIdAU3QE6ANxBXlkyVuQHeACwnlisLTxBPoByBnYNWEcrAnqWLIa0dKiGEweme6TfdE/7Z0v36/e//Om/STBJBFq5np29Wk2Gt+XM5+mohnNUQomi0p4Pw7b8Y7yTRi7gRHRSNZ3t+boHNfmfhfv1iRwjZUUn9SYLFk9beue0Ei8bLJbDdf92UQdATRKsqAUF0+KMRrRVNhmO+scB2P1wXAfUk0cIkISH346XuFkeCRWMaCWwPwh21324sKuTLeKn7pWgyHPO1BKr99iBIekS0npbERTJc+9X6eMiRYNGYmQJVCxiS6JEUzbTFJNH5USNaLJoI1/z/CpxqAVf7zU4mMm5EtUkoSaJ9Gg7thB5FkZTQRtyKDlIFzrYAiwuPQ3ELHIlURbwhcLYFMIibLM7oYLrA1BbAo7B8B29tAVUXmNUCePRd7o9SEFV7TgTBriTaZBKT2l1KEzhevT0I1R2KulMp4yrPwWk1T36Hm7Wa3L2tqVtU7kagEqCQpXv178wi3Qkcu7QyCPcEkXozy3G5F6hUrZxud4QUuwwK/RCog2xpN9vm96vpt2ppbmW2kiBpxQ8/nTA4fRWSU2BmK5FiK17+sF95gUpAWiuRQ3p/9CgaHT6xXWU4OHFyppWUcuhUpsC0VsJ+bOhC4Ewrec568OtK4LiVDOvBKuvRvUuBbC8s04Eh8EaZ9Rt9KQ5lLQIH4WAWI47/DkTnAdGz7c8GHMl4qfsq858vBgG9HAqBXtpikBQcNCiWl0PhoJe2GCQFBw2K5eVQOOilLQZJwUGDYnk5FA56aYtBUnDQoFheDq2Og5dnMt/0qyhl3OhuVE2gyROJOPjVp6GMkTg2nIdjQ7OngrEHy9hZ+mtgD2IP6tPiZCQQBaJOwNNfFIgCUX1anIwEokDUCXj6iwJRIKpPi5ORQBSIOgFPf1EgCkT1aXEyEogCUSfg6S8KRIGoPi1ORgJRIOoEPP1FgSgQ1afFycg7gejZ9rF2caX6Up7u4+o8CKSt7PpACMxZOG+mwUFvrMiZCBzMWThvpsFBb6zImQgczFk4b6bBQW+syJkIHMxZOG+mwUFvrMiZSHUcVEcWc/1lHXfiTAafm7i2UfHBkJyvW0zTsAdxdM+Elq2wQBSI2mKJKQ4QBaJMaNkKC0SBqC2WmOIAUSDKhJatsEAUiNpiiSkOEAWiTGjZCjv3iKpf9RqEqT+yelsN1Q98/AVo7AO6mhGanAAAAABJRU5ErkJggg==',

        sort:1,
        phaseCode:2
    },
    {
        name: '3-1',
                //别名
        aliasName: '右转冲突',
        width: 28,
        height: 57,
        base64Src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAACMCAYAAAAp3Wp9AAAAAXNSR0IArs4c6QAAA6tJREFUeF7tncFS01AUhs9N4zjjSpc6hcKG4kofQXwC7QuoO4UMxb6A4ANIdYrjDnkB1BdAfAF1pakLWwuyVHfKTOnVtAZtaMO95eTeNPxsOTkn//m/9OTedFJBKf0r7nnl+qXa45OenjhpgkSOlySKu96mIHmF3IPr/sVnzVHrpFMgEV1uzd+XwnlEJBsdKSqfJmsvRxGZWoHF3cU5ITtbf0VJIlrxJ2oruiJTK3Dyy70L55zct4igF+S2KzrIplYgSRKzXxc+kxRT/SJlQ+e6TLfA1sI6OeLWACyl7MhKvbBWPQ7Z9Ars+6AZLENIZ/Xj5JNKnMiuwKnG0vmzbntZEJWP64jy/4V87ufX7oTxs6352yScdeXjlQPjke0KTKS4MYGBguGjJCMCu3YPHCVZEhhC3TdKsiiwi2w4SjIqsIdsMEoyK/DPRPjeEfJhRgXKhiNk6UP+6fsMCpSvf7XPlJrT1R8Bp1kTGKw4lv+/R8iEwOB6k0Qlf6K2Hb0ByoLAd+S2S8OWUKMJjNyGKd82agbO7CzcdEhsDjtMSlHdP8ithNfboLj0Cgz2ZVreqnCOLgDCEVDPKy6XtG+2TTjY23h6K4iuRhe84QhQASLVDs7uep2IuL4RMNYCi83FOZE73HQKtBwZAWMtMNw2jBsB4yvwcOOXCnEjYHwFBvsxe1755767ETcCxlqgysmrxKT3U1Tl7BViIHBgk0wMegV3VELgIBxU4cRiTA/RHe8aCTnoIcewU9v282sbFs9buXSqH74oq4gJhECOLtrMAQdtdp+jNhzk6KLNHHDQZvc5asNBji7azAEHbXafozYc5OiizRxw0Gb3OWr/W9ETPVBO2KE3fqH/WbjysYYDsauGXTXDyOmWA6JAVJcZw/FAFIgaRk63HBAForrMGI4HokDUMHK65YAoENVlxnA8EAWihpHTLQdEgaguM4bjgSgQNYycbjkgCkR1mTEcD0SBqGHkdMsBUSCqy4zheCAKRA0jp1vudCA60/JuOI5cVe2OPBCv6oXakmq8zTh8V81m9zlqw0GOLtrMAQdtdp+jNhzk6KLNHHDQZvc5asNBji7azAEHbXafozYc5OiizRynw8HMv6wjla/+Y+L6dGw6wcEoLnhpFdMFxJAG1yCeTTBglGQKIApEk+SLITcQBaIMGCWZAogC0ST5YsgNRIEoA0ZJpgCiQDRJvhhyA1EgyoBRkil6iDbuTpHrRn4tNaZsu930p0f/deMkBUVz/wb6+imDwQCOSgAAAABJRU5ErkJggg==',

        sort:3,
        phaseCode:3
    },
    {
        name: '5',
                //别名
        aliasName: '左转掉头',
        width: 28,
        height: 57,
        base64Src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAABzCAYAAADT0PECAAAAAXNSR0IArs4c6QAABSNJREFUeF7tXEFWHDcQreoRD2dHlskDDJvMxJtMThBzgnADwy7PdJ7HJzA+AfA8+GVncgK4gccnMN7Ew8tigOEALInpmQpq07yeobsltVTdg596262q+tJXqVSqFoLlszLoLHw3Hz37/GN3z1KU0+ZoI601+GOFhDgEorOT5f11G1mu25YG1hqET1HAIQEs0Jhenjze33VtnI28UsBaw/DVjdLtlOK1/lK3Z2OI67ZGwOR8eiSiQwB4mjbkKhLfn67uXro2zkaeNrAnF8/bY8BDIFxJK0SA489L3V9tjOBoqwXs52H4QlJPzqd7RiAd9Bf3NzmMs5FZCExSb74xeoVInQIlPRjDBxsjXLcdNcZHucASV44AbdeK2eURbmYCS7tydiM4FGQBy3DlHKp5ZaaB5blyXguYpCfA8lw5k1p+sRJYoSvnN4FHgwTWvNjqIOEOj4aapCZUlK4d5hrvp6OKmsyyV5t2HhIcCrFDADO1/SiFMsfdy6hdRu8P98lboH86D9eDgHYeLDXzgMmh0p13NIY9BGDdslAAvxuFdkXAEh42h+EuAsjoPvsh3Owvvzng5G3rbOsAAnymrUMHmBRWtCTIETt53C2K/rXtyfuQDVgRNavYaLICS8BlLQncqQF2YAlVWsNweklgTeZUBkwCTC8J3Om3SoFNzDuAHmfeo3Jgd0vCxVbnZJEvYVobMGt/rhDggSUdpLtAc4+ISr4fMT9iKo6UfB9nxBpf1iHA34iwjUgLSBinzwnpEghPAen05vCjB43RB/jS2GYJgkvaP9EsOfmkUbxDnzitUcmX26LMc4OCHYfWoYRKcdH723zlixvjOkbG2Sjl9ooyVQ5z9K7ynTgnsFpT5VzAmud/7iiOnmyIpm7LAax2UF9da/YxkrpLsr+olX5pk1wCix2FgPdlO8VpO6fALrYGlXs/7nVsZijoMlbUTaw6pZpKmAsqts6fbwAG71S6st7fhkqyuKx3FYlj+c0jEbWBYAMQ9BOk08JdAGsOw49G6edbIwhg779IbOdV9FgxwRZYrFyIgfFo0Xizv/xWmRa/Pdr6aBxjWgMrR8PX/aVuusCssF9KUd0WWPMs3MWg4MBi2mSk0/7i/qrJCMfbHRENjEbNFlhrGMoFWXtvVTaxajyPrYGZL8qlUuGmHWgdK7ZMgYlotf/DX3LLb/R4YK4iDz9iSU96Kk5OQT/H/BxTOOVZdR5BEKxbJUxnFRgArHlgWaz0I1b1OuapmOMdPRU9FXNT50YbWu/u8wIQP8f8HPNzTJUz8bFiZg955+Gdh3ce3nmoesA7j8Ieqiph+s1uNCs/RqpqxDywh5Ya8CPmR0yxHM6a85B3EVxfA/y7+jYuC0oe2+g+LoSGqH0F4rjozh2287G7ChmkSyI8RqSj0TV9aszdv0NHtUDDlVjBefhFlqnLUiVCOlL9osUGTBrr4k6Ce/Xz8qeBxmhNVUnACkyCM1agikCRNm4qdf5WfWas19Tdly7ayrLc4HYkdmCuKBn/t6JBwTsnZVjaVLoyx7gHp0dMk4LVA/t6RYZ5HaG01ICClQMrTUlDCtYCLAZnWjZrSMHagBl5yRIUrA2YNiVLUrBWYFoLd0kK1g+syEtaULB2YLmUtKTgTADLpKQlBWcHWJqSDig4M8DuKCkvDzKIBWuP7lUGJO/ljvufxcndtm7brO+MY1PTbYuNcTZtPbCk9x7MiHFduGVDIxdt/X0enooueORAxjdLxfhyL9K/YVpeWf0/P8j6QiEXxdcAAAAASUVORK5CYII=',

        sort:0,
        phaseCode:5
    },
    {
        name: '5-1',
                //别名
        aliasName: '左转掉头冲突',
        width: 28,
        height: 57,
        base64Src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAByCAYAAAAYjCKnAAAAAXNSR0IArs4c6QAABbJJREFUeF7tnE1SG0cUx1+PhiLemWUSZGCRaJIVvgGcINwAs6NgqkJOIPsEiFiksoOcQPgEkU+AV7ZUXkggVWVpllQ8mg490igjMR/9+mskqmer6Y9fv3+/fv26NQQkn83eyfNnq8H+p++aZ5JVKS1OZGrzeoeb1HVbQOlN98X5nkxdqssKg3k9f4e40KIAz2lIf+tunDdUd06mPiEwb+DXHxp9nWh4t1NttmU6orosCozNp2/coAUAO8mO3AfuWn+rcae6czL1cYP9PDzaDoG0gJLNZIME4MOnavOlTCd0lOUC+2ng/8qkx+bTo04QetlZPz/Q0TmZOnPBmPRWK6M6IfQkp5E2hPAe04n70G3kSdcb+DsQzsodU/+oEl5lgsWunABsYyrletcNtjrf/tnPete78V+DA8xBiT2UHKSCJV25WM0FpcoAS3Hl6tlMgmW5cvVUAGAKLMuVa4FilZoAy3XlushMgNWGxyeEklNdDKn1mgBjDTPXDiuVv+ejCm2wpsBiOOK6pxRA//bDJFhsHW/gs6hdfHHkMXMZYKxfP976e45DT7VJsywwzLyjIZwRANSWpdRYMVZUbeA3CACL7tMfSg46L95e8ijQ5Dtc25a8JYFZrLvRzIv+TfJM2+ICy5PmUm80px6zd7iZtiQsdWogqaeUJWG5kzlJuOSS8GTSb0lpRqEYQHvR8h7cziPPtTGv2V1/AgnTUvw3slElFkO2aeT1pQDzbo4vwSH73COSlaXirsDQixYsHuiyLBZlxCDYdlbCu4/rf3woMvzCW4wlYsGFOssuR+cABXn/2sC/Zlsi9i4qI23KYhHQCr3AnNRM8pxfiqyZ+rtusChJ5LoX8+dp06kAcNetNtfSOheFbATYWRz+0QnGOlYhcJF69JTsakaawLv1L4EAv4tP1qkLDJP/dxxn7+P3v7+bN8tkfomd9OgAw0AxmLSdwUTCPbwGJyVUg7F0+YP0cLcHUjyjd3v0CojD5qbYoxqsMPGT1k1C+p31t1szG1mZ+RXJIOPgT2yYxqXYFsahpF7oNBKNdKrNmZjVGx73pHKaOsBYf7FnAaMgfPl5axyB/DA82q5Q51pmcLVYLO5QtMBWggaXy07kJqXnly4pPnLbOcdUUbhE6JUD9CyOGSMwh9RLlyKzTNGtnAxptsENDrJuD0gdjsjOsXi9oQBXhNCr+68r77Ig56T5plNtJu9ipU6p2BGFAH2jQXDafCiCZJdTMBfKogFxvjaM7qBrN36DONkHFkWQvJ6vNvBbD6l0/gNJaSkOfJZTnLkJl9XZCBLgDGOtuC70uiYNhl9IhVLhHmIAo8EwDlZwkpllbQsWj4y1WIZG0JPaSnF2JO0cs3OsIDR4unPsn8OZq+pFIVLePeC8ssbnWBGIqt8XPncvCmrBVHlFUQtgy1mLWYsVrWNsn0Qov8uvjHZFXL5xKRpboE3fGrBgsaTttkVy2wKwK3Uzx5gUsckcC7ZsqQFrMWuxglDFlLu3UrRSfCpSZP8wRzwiR0isenQyR3aOIZikXrVg/w+fXKwoZQZEYWsxazGEXHS+alyK3vD40QXmXMCcmzh55cxfh8DeGhCNFW0yZ2L3pTlc12UxdtWcENihAbT/BbcdXwSTyXmwC2Zk1f2FjmDtPij4OJAusPl47eFDC+w26HsHYB9zRRZCeAMVukEo2ZuWI/RVZ/38r9yDP61g478KX6NAitYAzm9aaU9xK/2oCaF94MzlawcT3EKk241DgnFBM2AqJMkpwRjM2AItJUmEBKcWw2aCZdYxgfht3E+EBMsBE5EkUoKlgE0cCf/3dQQkWBoYyksKSLBcMB5JCkqwVDDWeK6XlJBg6WC5kpSQ4GKApUlSUoILAfZIkgokuDBgM5JUIMHFAht/n/ukW1X3rSp0lCMTUhVttVT+bsHi0VwWixnbtqiUGU9dIhvN/wCTHzKeMjeIXwAAAABJRU5ErkJggg==',


        sort:0,
        phaseCode:5
    },
    {
        name: 'footPath',
                //别名
        aliasName: '人行道',
        width: 22,
        height: 57,
        base64Src:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANgAAAAQCAYAAAB0m7E0AAAAAXNSR0IArs4c6QAAA4NJREFUaEPtW01O20AU/t7E9GfHthLQZIPcrnIDkhOQniDJrgJLbU8AuUGlBtQdyQkwJ2h6grKqrG4SAgdgV1qcecUuBNvY2GOM4lYz28y8N/O99/n9zIRQ8KiO3y8/f+q2WXLdWdnrFixei9MIFI7Aq1PrkIltVGZfnRefJ0UqoCKEzUk1QwtAw5dJ3HFW9oZFyNcyNAKPiYA53eqAxMG1jhGIB0WRLTfBPFI9q/xugUR7TqobFIgnV+SqPSYoWrZGoEgEzLPtMZiqEZk+2S4ul44mtY/nefQpEcwnFdw6DOwQUGdgOVapjl55bKHXLBAB88TahcBO0hYYsInYVs3KMhHMHFsNLHGbmFqJpNLRa4HuoVU/FAG/zDHccZp/E3Du12uXNHRq/VGa3kSCeaRiAy0BtNOUhpRI9EAytVC8mD2xg2F3nnKm7Tjm96gsc/y2ior4WwsqDmdtfxBcklvWTEyiBnh9tlWXEnXFLQExssxTqwGW0ZQmVbQQOP6+sn8cnLg+tlqiIuOzkfskLslRtCng1zM5Rhn8gVnUSeBd5u0Te34+uo9sIYLlJlUgeslL+iAMHGbYZNNZvf0C+I5sGOMM6+5OMdxa0NB+xDXwJY8sZ7UfxiRcAKuIHDmr/WaIrClpSKJw4kG0I2uebA8gyKt/1YZEz3nZ3w3tK77+SJfL1HXWPoU/SKcWpy+MnbFwf5CMNxXCgVJACfh+HNno2hk3vK5fTJGnilUPLkYZnXvhgMYdThNMweT/GcEANCHRuK8Wy4QO8YSZjqQrB+SlLTMWHSLefDDBvPRQaoJdG0FHsEzeOJ9Uhg9u00+7b1v2aicIRjMm74pqFE6H/LweHQjeyEM29gpAF12dIvpIa4KpuWc5CEZ8kMf3veaHBIZX3XU7WPokNznyki1jkwORArnIJsdDZBXV5JAQ5z/W+nbQx0rb5JhaLYHFNjlK4Q8sqirpYRKpgjbP1KZf9w2AFhE2UwtAfcms9t3Ws0uDQMJlc2h/8zY90zAYqZIOkYlgoY7TdKtDJDyiec+i4oe+aC6N0+iNZEMg8lzqLqkA72qjd+EaxyqvOpQJdqNZP5XKZjg9699AIPGpFMth9I5O5US5CRaKajcXu8F3iTqKqdhBz10gAtHHvlSB/fOXMVSJVIWliGk4zF8+CNrQf1dJQ0v/XgYEzKk1IAPfiiJV8Ex/AN1CW4TlaP+uAAAAAElFTkSuQmCC',

    },
];

//创建相位图
export default class AutoPhase {
    constructor(phaseData) {
        this.phaseData = phaseData||[]; //数据
        this.myCanvas = null //画布容器
        this.ctx = null //画布
        this.images = new Map()//存储相位、人行道图片
        this.debug = false //调试模式
        this.dpr = 5||window.devicePixelRatio ; //设备像素比，因不需要高清图，所以默认为1.5
        //画布宽高
        this.width=140;
        this.height=140;
        this.#init()

    }

    //初始化布局、加载静态资源 
    async #init() {
        const {debug,width,height} = this
        const scaleSize = this.#scaleSize.bind(this)
        
        let myCanvas = document.createElement("canvas");
        myCanvas.setAttribute("height", scaleSize(height));
        myCanvas.setAttribute("width", scaleSize(width));
        const ctx = myCanvas.getContext("2d");
        // ctx.imageSmoothingEnabled = false;
        // 将原点移动到画布的中心
        ctx.translate(scaleSize(width) / 2, scaleSize(height) / 2);
        this.myCanvas = myCanvas
        this.ctx = ctx
        //debug模式
        debug&&this.#drawDebugBaseLine()

    }
    //初始化布局
    #createLayout(){
        const {width,height} = this

        const scaleSize = this.#scaleSize.bind(this)

        // 绘制边框
        this.ctx.fillStyle = '#131F3D';
        this.ctx.fillRect(-scaleSize(width) / 2, -scaleSize(height) / 2, scaleSize(width), scaleSize(height));
        this.ctx.strokeStyle = '#525C76';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(-scaleSize(width) / 2, -scaleSize(height) / 2, scaleSize(width), scaleSize(height));
    }
    //生成相位
    async generatePhase() {
        //加载图片
        await this.#loadImages()
        await this.#draw()
        return this.phaseData
    }
    //开始绘制
    async #draw() {
        try{
            // 根据角度围绕圆心绘制图形
            for(const phaseList of this.phaseData){
                this.#createLayout()
                //处理同一流向数据合并，处理冲突流向
                phaseList.laneDirList = this.#mergeLaneDirection(phaseList.phaseRelFlowList)
                //渲染车道流向
                await this.#renderLaneDirection(phaseList.laneDirList)
                //渲染人行道
                await this.#renderPedestrianPath(phaseList.phaseRelFlowList)
                // 生成base64图像
                phaseList.iconBase64 = this.myCanvas.toDataURL('image/png');
                // 重置画布
                this.#resetCanvas()
            }
            //debug模式
            this.debug&&this.#drawDebugBaseLine()
        }catch(e){
            console.error(e)
        }
    }
    //渲染车道流向
    async #renderLaneDirection(laneDirList) {
        const isNumber = this.#isNumber.bind(this)
        for (const lane of laneDirList) {
            const { directionAngle, laneDirection } = lane;
            // 绘制相位图片
            if (isNumber(directionAngle) && laneDirection?.length) {
                await this.#drawPhaseImage(lane);
            }
        }
    }
    //渲染人行道
    async #renderPedestrianPath(phaseRelFlowList) {
        const isNumber = this.#isNumber.bind(this)
        for (const phase of phaseRelFlowList) {
            const { pedestrianAngle, enterExitPedestrian } = phase;
            // 绘制人行道
            if (isNumber(pedestrianAngle) && enterExitPedestrian?.length) {
                await this.#drawTwoWayFootPath(phase);
            }
        }
    }
    //根据direction 合并同一流向数据，处理冲突流向
    #mergeLaneDirection(phaseRelFlowList){
        const mergedData = phaseRelFlowList.reduce((acc, item) => {
            const { direction, directionName, directionAngle, laneDirection = [], laneDirectionName = [], conflictLaneDirection = [], conflictLaneDirectionName = [] } = item;
            if (!acc[direction]) {
                acc[direction] = {
                    direction,
                    directionName,
                    directionAngle,
                    laneDirection: [],
                    laneDirectionName: [],
                    conflictLaneDirection: [],
                    conflictLaneDirectionName: []
                };
            }
            acc[direction].laneDirection.push(...(laneDirection || []));
            acc[direction].laneDirectionName.push(...(laneDirectionName || []));
            acc[direction].conflictLaneDirection.push(...(conflictLaneDirection || []));
            acc[direction].conflictLaneDirectionName.push(...(conflictLaneDirectionName || []));
            return acc;
        }, {});
        const result = Object.values(mergedData);
        result.forEach(lane => {
            //特殊处理左转和左掉头的相位
            // 检查是否包含 左转和左掉头 相位code
            const leftTurnPhaseCode = [2,4]
            //当前车道是否有左转和左掉头相位
            const hasAllPhaseCode = leftTurnPhaseCode.every(code => lane.laneDirection.some(phaseCode => phaseCode === code));
            //检查冲突车道是否有左转或左掉头相位
            const hasAnyPhaseCode = leftTurnPhaseCode.some(code => lane.conflictLaneDirection.some(phaseCode => phaseCode === code));
            if (hasAllPhaseCode) {
                // 过滤掉列表值
                lane.laneDirection = lane.laneDirection.filter(phaseCode => !leftTurnPhaseCode.includes(phaseCode));
                // 根据是否冲突来添加流向
                lane.laneDirection.push(hasAnyPhaseCode ? '5-1' : 5);
            }
            //处理冲突流向，如车道流向中包含冲突流向则在车道流向后面加-1
            lane.laneDirection = lane.laneDirection.map(direction =>
                lane.conflictLaneDirection.includes(direction)? `${direction}-1` : direction
              );
        });
        return result 
    }
    //绘制debug基线
    #drawDebugBaseLine(){
        const { ctx ,width,height} = this
        const scaleSize = this.#scaleSize.bind(this)
        // 绘制水平线
        ctx.beginPath();
        ctx.moveTo(scaleSize(-width) / 2, 0);
        ctx.lineTo(scaleSize(width) / 2, 0);
        ctx.strokeStyle = 'gray';
        ctx.stroke();
        
        // 绘制垂直线
        ctx.beginPath();
        ctx.moveTo(0, scaleSize(-height) / 2);
        ctx.lineTo(0, scaleSize(height)  / 2);
        ctx.strokeStyle = 'gray';
        ctx.stroke();
        
        // 绘制小圆
        ctx.beginPath();
        ctx.arc(0, 0, scaleSize(3), 0, 2 * Math.PI);
        ctx.fillStyle = '#ff6f3c';
        ctx.fill();
    }
    //绘制相位图片
    async #drawPhaseImage(phase) {
        //判断如果超过360度则减去360度
        phase.angle = (phase.directionAngle+180) % 360;
        //相位区域偏移量
        const phaseImgOffsetLeft = 15
        const phaseAreaWidth= 67;
        const phaseAreaHeight = 70;
        //相位距离圆心偏移量
        const phaseImgOffsetRadius = 50;
        const scaleSize = this.#scaleSize.bind(this)
        const {ctx,debug} = this
        // ctx.imageSmoothingEnabled = false;
        // 计算相位图片的坐标
        const angle = (phase.angle+45) * (Math.PI / 180);
        const radius = scaleSize(phaseImgOffsetRadius); // 半径，可以根据需要调整
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        // 创建相位图片
        const phaseImg = await this.#createPhaseImage(phase)
        
        // 绘制相位图片
        // 保存当前的绘图状态
        ctx.save();
        // 移动到矩形的中心
        ctx.translate(x, y);
        // 旋转矩形
        ctx.rotate(phase.angle * Math.PI / 180);

        //调试模式
        if(debug){
            // 绘制矩形
            ctx.beginPath();
            ctx.rect(-scaleSize(phaseAreaWidth) / 2 - scaleSize(phaseImgOffsetLeft), -scaleSize(phaseAreaHeight) / 2, scaleSize(phaseAreaWidth), scaleSize(phaseAreaHeight));
            ctx.strokeStyle = 'black'; // 设置矩形边框颜色
            ctx.stroke();
            ctx.fillStyle = '#155263'; // 设置矩形填充颜色
            ctx.fill();

            // 在矩形的中心绘制一个小圆
            ctx.beginPath();
            ctx.arc(- scaleSize(phaseImgOffsetLeft), 0, scaleSize(3), 0, 2 * Math.PI); // 绘制一个小圆
            ctx.fillStyle = '#ff9a3c';
            ctx.fill();
        }

        // 绘制相位图片
        this.#drawRotatedImage(phaseImg, -scaleSize(phaseAreaWidth) / 2 - scaleSize(phaseImgOffsetLeft), -scaleSize(phaseAreaHeight) / 2, scaleSize(phaseAreaWidth), scaleSize(phaseAreaHeight));
        ctx.restore();
        if(debug){
            // 在计算出的坐标上绘制图形
            ctx.beginPath();
            ctx.arc(x, y, scaleSize(3), 0, 2 * Math.PI); // 绘制一个小圆
            ctx.fillStyle = '#ffc93c';
            ctx.fill();
        }
    }
    // 绘制人行道
    async #drawTwoWayFootPath(phase) {
        const {pedestrianAngle,enterExitPedestrian} = phase
        await this.#createTwoWayFootPathImage(pedestrianAngle,enterExitPedestrian)
        const angle = pedestrianAngle-90
        // 是否为直角
        const isRightAngle = angle % 90 === 0;
        // 人行道的宽度和高度
        const footPathWidth = 8;
        const footPathHeight = isRightAngle ? 108 : 80
        // 人行道距离圆心的距离
        const footPathOffsetRadius = isRightAngle ? 60 : 50;
        const scaleSize = this.#scaleSize.bind(this)
        // / 固定比例的宽度和高度
        const pathWidth = scaleSize(footPathWidth);
        const pathHeight = scaleSize(footPathHeight);

        const offset = scaleSize(footPathOffsetRadius); // 人行道距离圆心的距离
        // 计算人行道的位置
        const xOffset = offset * Math.cos(angle * (Math.PI / 180));
        const yOffset = offset * Math.sin(angle * (Math.PI / 180));
        this.#drawRotatedImage(this.images.get('twoWayFootPath')?.img, xOffset - pathHeight / 2, yOffset - pathWidth / 2, pathHeight, pathWidth, angle-90);
    }
    //加载图片
    async #loadImages() {
        const imagePromises = imagesList.map((item) => {
            return new Promise(async (resolve) => {
                const img = new Image();
                // img.src = new URL(`../images/${item.name}.png`, import.meta.url).href;
                img.src = item.base64Src;
                img.onload = () => {
                    this.images.set (item.name,{img, ...item});
                    resolve();
                };
            });
        });
        return Promise.all(imagePromises);
    }
    /**
     * @description 创建双向人行道图片
     * @param {Number} angle 角度 
     * @param {Array<Number>} enterExitList 出入口列表 0 入口 1 出口
     * @return {Promise<Image>} 
    */
    async #createTwoWayFootPathImage(angle,enterExitList) {
        //距离圆心的距离
        const offsetRadius = angle % 90 === 0 ? 3 : 3;
        //画布宽高
        const canvasWidth = 108
        const canvasHeight = 8
        const scaleSize = this.#scaleSize.bind(this)
        const imageCanvas = document.createElement('canvas');
        const ctx = imageCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        imageCanvas.setAttribute("height", scaleSize(canvasHeight));
        imageCanvas.setAttribute("width", scaleSize(canvasWidth));


        if(this.debug){
            //辅助线
            // 绘制边框
            ctx.strokeStyle = '#ff6f3c';
            ctx.lineWidth = scaleSize(1);
            ctx.strokeRect(0, 0, imageCanvas.width, imageCanvas.height);

            // 绘制十字辅助线
            ctx.strokeStyle = '#ff6f3c';
            ctx.lineWidth = scaleSize(1);
            // 水平线
            ctx.beginPath();
            ctx.moveTo(0, imageCanvas.height / 2);
            ctx.lineTo(imageCanvas.width, imageCanvas.height / 2);
            ctx.stroke();
            // 垂直线
            ctx.beginPath();
            ctx.moveTo(imageCanvas.width / 2, 0);
            ctx.lineTo(imageCanvas.width / 2, imageCanvas.height);
            ctx.stroke();
        }
        // 计算图标的 x 坐标，使它们水平居中
        const x2 = imageCanvas.width - scaleSize((canvasWidth - offsetRadius) / 2);

        enterExitList.includes(0)&&ctx.drawImage(this.images.get('footPath').img, 0, 0, scaleSize((canvasWidth - offsetRadius) / 2), scaleSize(canvasHeight));
        enterExitList.includes(1)&&ctx.drawImage(this.images.get('footPath').img, x2, 0, scaleSize((canvasWidth - offsetRadius) / 2), scaleSize(canvasHeight));

        // 将 imageCanvas 转换为图片
        const dataURL = imageCanvas.toDataURL('image/png');
        const imgElement = document.createElement('img');
        imgElement.src = dataURL;
        return new Promise((resolve) => {
            imgElement.onload = () => {
                this.images.set("twoWayFootPath",{img:imgElement, width: scaleSize(canvasWidth), height: scaleSize(canvasHeight),name:'twoWayFootPath'});
                resolve();
            };
        });
    }
    //创建相位图片
    async #createPhaseImage(phase) {
        // 设置图片之间的间距
        const maxSpacing = 10;
        const scaleSize = this.#scaleSize.bind(this)
        const imageCanvas = document.createElement('canvas');
        const ctx = imageCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        // 获取相位图片
        const imagesList = Array.from(this.images.values())
        .filter(image => phase.laneDirection.some(line => line == image.name))
        .sort((a, b) => a.sort - b.sort)
        .map(image => Object.assign({}, image));
        
        //判断如果高度少于最大高度则更新最大高度,(不包括掉头)
        const getMaxHeight = (images) => Array.from(images).reduce((max, image) => Math.max(max, image.height), 0);

        const originMaxImageHeight = getMaxHeight(this.images.values());
        const maxImageHeight = getMaxHeight(imagesList);
        if(maxImageHeight < originMaxImageHeight){
            imagesList.forEach(image => image.phaseCode!=4&&(image.height = originMaxImageHeight));
        }

        // 计算平均间距
        const avgSpaceing = (67-imagesList.reduce((sum, img) => sum + img.width, 0)) /(imagesList.length-1);
        const minAvgSpacing = Math.min(avgSpaceing, maxSpacing);

        //更新画布宽高
        imagesList.map((image, index) => {
            image.width = scaleSize(image.width);
            image.height = scaleSize(image.height);
        });

        imageCanvas.setAttribute("height", scaleSize(70));
        imageCanvas.setAttribute("width", scaleSize(67));
        // 获取画布的宽度和高度
        const canvasWidth = imageCanvas.width;
        const canvasHeight = imageCanvas.height;

        // 计算总的列数
        const cols = imagesList.length;

        // 计算起始位置，使图片水平居中显示
        const totalWidth = imagesList.reduce((sum, img) => sum + img.width, 0) + (cols - 1) * minAvgSpacing;
        const startX = (canvasWidth - totalWidth) / 2;
        const startY = canvasHeight; // Y轴为画布高度，底部对齐

        // 绘制图片
        let currentX = startX;
        imagesList.forEach((image) => {
            const y = startY - image.height; // 底部对齐
            ctx.drawImage(image.img, currentX, y, image.width, image.height);
            currentX += image.width + minAvgSpacing;
        });
        const dataURL = imageCanvas.toDataURL('image/png');
        const imgElement = document.createElement('img');
        imgElement.src = dataURL;
        return new Promise((resolve) => {
            imgElement.onload = () => {
                resolve(imgElement);
            };
        });
    }

    //绘制旋转图片
    #drawRotatedImage(image, x, y, width, height, angle) {
        const {
            ctx,
        } = this
        // 保存当前的绘图状态
        ctx.save();
        // 移动到图像的中心点
        ctx.translate(x + width / 2, y + height / 2);
        // 旋转画布
        ctx.rotate(angle * Math.PI / 180);
        // 绘制图像，注意偏移量
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
        // 恢复绘图状态
        ctx.restore();
    }
    //计算尺寸
    #scaleSize(size) {
        return Number((size * this.dpr).toFixed(2))
    }
    //重置默认数据和画布
    #resetCanvas() {
        const {
            ctx,width,height
        } = this
        const scaleSize = this.#scaleSize.bind(this)
        //重置画布
        ctx.clearRect(-scaleSize(width/2), -scaleSize(height/2), scaleSize(width), scaleSize(height));
    }
    #isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
      }
}
