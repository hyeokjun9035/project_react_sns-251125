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

<div align="center">
  <img src="https://github.com/hyeokjun9035/sns_img/blob/main/login.png" width="330px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/login_fail.png" width="230px"> <img   src="https://github.com/hyeokjun9035/sns_img/blob/main/login_success.png" width="225px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/join.png" width="290px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/join_fail.png" width="235px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/join_success.png" width="258px">
</div>

   + 심플한 UI로 접근성을 높이고, 연분홍 포인트로 사랑스러운 표현
   + 로그인시 아이디가 맞지않으면 로그인 불가능하게 적용
   + 회원가입시 동일한 아이디는 가입 불가능하게 적용


## 🏠 메인 피드 페이지

<div align="center">
<img src="https://github.com/hyeokjun9035/sns_img/blob/main/feed.png" width="400px" height="325px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/other_feed.png" width="400px" height="325px"> 
</div>

   + 서로 갔던 곳을 공유할 수 있도록 피드 구성
   + 게시글 클릭 시 상세 + 피드 확대보기 기능 모달 제공
   + 본인이 작성한 피드가 아니면 삭제 불가능하게 구성
   + 사이드바 탭으로 다양한 기능 접근
   + 댓글 및 좋아요 기능은 추후 업데이트 예정




## 👤 마이페이지

<div align="center">
<img src="https://github.com/hyeokjun9035/sns_img/blob/main/mypage.png" width="370px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/myfeed.png" width="420px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/follower.png" width="385px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/following.png" width="405px">
</div>

   + 내가 작성한 피드 리스트 출력
   + 친구 목록 및 언팔로우 기능 구현
   + 프로필 수정 및 내가 북마크한 피드 리스트는 추후 업데이트 예정


## 💬 다이렉트 메시지 (DM)

<div align="center">
<img src="https://github.com/hyeokjun9035/sns_img/blob/main/chat_send.png" width="264px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/chat_direct_room.png" width="264px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/chat_direct_group.png" width="260px">
</div>

   + 메시지 목록에서 유저 검색 후 1:1 및 그룹 채팅 가능
   + 채팅 메시지 저장 및 조회를 위한 DB 구조 설계 및 연동

## 🖋 피드 작성

<div align="center">
<img src="https://github.com/hyeokjun9035/sns_img/blob/main/feed_make.png" width="277px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/feed_make_1.png" width="265px"> <img src="https://github.com/hyeokjun9035/sns_img/blob/main/feed_make_delete.png" width="260px">
</div>

  + 여러 사진 선택 가능하도록 구현(추후 동영상도 추가할 수 있도록 구현 예정)
  + 내가 선택한 사진들 확인후 피드 글쓰기 구현
  + 작성중 닫기 버튼을 누를 시 초기화
---

# ❗ 프로젝트 후기
### ❣️ 좋았던점
 + 이번 프로젝트에서는 React와 Node.js를 활용해 SPA 구조의 SNS 서비스를 처음부터 끝까지 직접 설계하고 구현해볼 수 있었던 점이 가장 큰 성과였습니다. 페이지 전환 없이 상태 변화에 따라 화면이 갱신되는 구조를 직접 구현하며, 컴포넌트 단위 설계와 상태 관리의 중요성을 체감할 수 있었습니다.
 + 특히 실시간 채팅(DM) 기능을 구현하면서, 메시지 전송·저장·조회 흐름을 고려한 DB 구조를 설계하고, 프론트엔드와 백엔드 간 데이터 흐름을 직접 연결해보는 경험을 할 수 있었습니다. 이를 통해 단순 UI 구현이 아닌, 실제 서비스에서 동작하는 기능을 구현하는 경험을 할 수 있었습니다.
 + 또한 피드 작성, 이미지 다중 업로드, 본인 게시글만 수정·삭제 가능하도록 권한을 분리하는 과정에서, 사용자 중심의 기능 설계와 접근 제어의 중요성을 이해하게 되었습니다.

### 💔 아쉬운점
 + 개발 기간이 짧아 댓글, 좋아요, 북마크 등 일부 SNS 핵심 기능을 모두 구현하지 못한 점은 아쉬움으로 남았습니다. 다만 기능 범위를 무리하게 넓히기보다는, 이미 구현한 기능의 구조를 안정적으로 만드는 데 집중했다는 점에서 의미가 있었다고 생각합니다.
 + 프로젝트 초반에는 검색과 문서, GPT의 도움을 많이 받았지만, 개발을 진행할수록 코드를 그대로 사용하는 것이 아니라, 왜 이렇게 동작하는지 이해하며 수정하는 방향으로 변화하게 되었습니다. 그 결과 React 컴포넌트 구조와 데이터 흐름에 대한 이해도가 이전보다 확실히 높아졌다고 느꼈습니다.
 + 추후에는 현재 구현된 구조를 기반으로 댓글·좋아요 기능을 추가하고, 실시간 채팅의 안정성과 UX를 개선하여 실제로 사용할 수 있는 완성도 높은 서비스로 발전시키고 싶습니다.
