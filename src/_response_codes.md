# numbers sent as responses mostly for errors
## 200s
### 200 success
`0xc80`&emsp;`3200`&emsp;`success`<br>
`0xc81`&emsp;`3201`&emsp;`note created`<br>
`0xc82`&emsp;`3202`&emsp;`note updated`<br>
`0xc83`&emsp;`3203`&emsp;`content deleted`<br>
`0xc84`&emsp;`3204`&emsp;`points updated`<br>
`0xc85`&emsp;`3205`&emsp;`account created`<br>
`0xc86`&emsp;`3206`&emsp;`access updated`<br>
`0xc87`&emsp;`3207`&emsp;`key revoked`<br>
`0xc88`&emsp;`3208`&emsp;`partial success`<br>
### 204 no content
`0xcc0`&emsp;`3264`&emsp;`no content`<br>
`0xcc1`&emsp;`3265`&emsp;`no query results`<br>
`0xcc2`&emsp;`3266`&emsp;`note does not exist`<br>
## 400s
### 400 bad request
`0x1900`&emsp;`6400`&emsp;`parameters invalid`<br>
`0x1901`&emsp;`6401`&emsp;`cheating??`<br>
`0x1902`&emsp;`6402`&emsp;`bad form code`<br>
`0x1903`&emsp;`6403`&emsp;`wrong form code`<br>
### 401 unauthorized
`0x1910`&emsp;`6416`&emsp;`unauthorized`<br>
`0x1911`&emsp;`6417`&emsp;`you are not logged in`<br>
### 403 forbidden
`0x1930`&emsp;`6448`&emsp;`forbidden`<br>
`0x1931`&emsp;`6449`&emsp;`not a lead scout`<br>
`0x1932`&emsp;`6450`&emsp;`account not approved`<br>
`0x1933`&emsp;`6451`&emsp;`not enough money to gamble`<br>
### 409 conflict
`0x1990`&emsp;`6544`&emsp;`conflict`<br>
`0x1991`&emsp;`6545`&emsp;`username used`<br>
`0x1992`&emsp;`6546`&emsp;`bad credentials`<br>
## 500s
### 500 internal server error
`0x1f40`&emsp;`8000`&emsp;`unknown error`<br>
`0x1f41`&emsp;`8001`&emsp;`database query error`<br>
`0x1f42`&emsp;`8002`&emsp;`database transaction error`<br>
### 502 bad gateway
`0x1f60`&emsp;`8032`&emsp;`bad gateway`<br>
`0x1f61`&emsp;`8033`&emsp;`bad frc api response`<br>