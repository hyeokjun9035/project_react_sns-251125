![이미지네임](https://github.com/hyeokjun9035/sns_img/blob/main/feed.png)

# 💑 Thlog
---

# 📗 프로젝트 소개
+ 개인 프로젝트로 진행한 SNS 기반 서비스입니다.
+ React와 Node.js를 활용하여 SPA 기반으로 구현되었습니다.
+ 인스타그램 UI를 참고하였고, 'Thlog'라는 이름은 throb(두근거리다)와 V-log를 합쳐 만든것으로
  연인들 혹은 썸, 첫연애할 때 항상 데이트를 뭘 해야할까 고민을 하게되는데 여러 사람들과 소통하면서
  광고성없이 본인들이 직접 간곳을 추천하고 어떻게 놀면 좋을지 공유하는 sns목적에 맞춰 설계했습니다.
---

# 📅 개발기간
 + 11/25 ~ 12/02
   + 프로젝트 기획 구상, DB설계, 서비스 개발, 테스트 및 수정
---

# 🤝 팀원구성
<table>
  <tr>
    <th>이름</th>
    <th>GitHub 프로필</th>
  </tr>
  <tr>
    <td>권혁준</td>
    <td>
     <a href="https://github.com/hyeokjun9035">hyeokjun9035</a>
    </td>
  </tr>
</table>


---

# 💻 사용언어
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

# 📑 페이지별 기능

## 🔐 로그인 / 회원가입


<img src="https://github.com/hyeokjun9035/sns_img/blob/main/login.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/login_fail.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/login_success.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/join.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/join_fail.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/join_success.png" width="320px" height="325px">

   + 심플한 UI로 접근성을 높이고, 연분홍 포인트로 사랑스러운 표현
   + 로그인시 아이디가 맞지않으면 로그인 불가능하게 적용
   + 회원가입시 동일한 아이디는 가입 불가능하게 적용


## 🏠 메인 피드 페이지

<img src="https://github.com/hyeokjun9035/sns_img/blob/main/feed.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/other_feed.png" width="320px" height="325px"> 

   + 서로 갔던 곳을 공유할 수 있도록 피드 구성
   + 게시글 클릭 시 상세 + 피드 확대보기 기능 모달 제공
   + 본인이 작성한 피드가 아니면 삭제 불가능하게 구성
   + 사이드바 탭으로 다양한 기능 접근
   + 댓글 및 좋아요 기능은 추후 업데이트 예정




## 👤 마이페이지

<img src="https://github.com/hyeokjun9035/sns_img/blob/main/mypage.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/myfeed.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/follower.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/following.png" width="320px" height="325px">

   + 내가 작성한 피드 리스트 출력
   + 친구 목록 및 언팔로우 기능 구현
   + 프로필 수정 및 내가 북마크한 피드 리스트는 추후 업데이트 예정


## 💬 다이렉트 메시지 (DM)

<img src="https://github.com/hyeokjun9035/sns_img/blob/main/chat_send.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/chat_direct_room.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/chat_direct_group.png" width="320px" height="325px">

   + 메시지 목록에서 유저 검색 후 1:1 및 그룹 채팅 가능
   + 채팅 메시지 저장 및 조회를 위한 DB 구조 설계 및 연동

## 🖋 피드 작성

<img src="https://github.com/hyeokjun9035/sns_img/blob/main/feed_make.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/feed_make_1.png" width="320px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/feed_make_delete.png" width="320px" height="325px">

  + 여러 사진 선택 가능하도록 구현(추후 동영상도 추가할 수 있도록 구현 예정)
  + 내가 선택한 사진들 확인후 피드 글쓰기 구현
  + 작성중 닫기 버튼을 누를 시 초기화
---

# ❗ 프로젝트 후기
### ❣️ 좋았던점
 + 팀 프로젝트에서 하지 못했던 실시간 채팅 기능을 구현해서 너무 좋았고, 확실히 Spring보단 채팅 구현이 어렵지 않았습니다.
 + 전체적으로 완성하지 못했지만 완성하여 주변 사람들과 같이 사용하고 싶다는 생각이 들었습니다.
 + 수업 때 배운 내용 외에 프로젝트를 하면서 추가로 배운것들이 있어서 조금 더 성장했다는 생각이 들었습니다.

### 💔 아쉬운점
 + 아무래도 개발기간이 제 기준에서는 좀 짧았던것 같아서 완벽하게 다 구현은 못해서 너무 아쉬웠고, 꼭 추후에 업데이트를 하여 완성시키도록 하겠습니다.
 + 대부분의 시간을 검색과 GPT를 활용한것 같지만, 처음 React를 배웠을 때보다 코드에 대한 이해도나 영향력을 더 잘 알게 된 것 같습니다.


