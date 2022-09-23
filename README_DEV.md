# PlanetScale DB

[planetscale cli 공식문서](https://github.com/planetscale/cli)

위 문서 참고해서 cli 설치

```
<!-- 어떤 명령어가 가능한지 보기 -->
pscale

<!-- 로그인. 관리자 권한을 받아야 우리 DB 에 접근 가능 -->
pscale auth login

<!-- knock-knock 데이터베이스와 보안터널 생성 -->
pscale connect knock-knock
<!-- 연결시 DB 브랜치를 지정할 수도 있음 -->
pscale connect knock-knock develop
```

# Prisma

PlanetScale 데이터베이스는 mysql compatible database 로, mysql 은 아니지만 호환 가능한 DB

그래서 mysql 과 같은 일반적인 RDB 와 다른 점이 있는데, 그 중 하나가 foreign key 가 실제로 존재하는 건지 확인을 안 한다. 따라서 DB 단이 아닌 Prisma 가 대신 확인하도록 해야 한다. 그게 `schema.prisma` 에 있는 referentialIntegrity 관련 설정

```
<!-- schema.prisma 기반으로 db 업데이트 -->
npx prisma db push

<!-- 디비 관리자 패널 웹버전 열기 -->
npx prisma studio

<!-- 스키마 기반 백엔드에서 사용할 타입 생성 -->
npx prisma generate
```

# Next-Auth

## Configuration

### Provider / user option

각 Provider 의 `user` 옵션은 해당 Provider 가 내려주는 user 데이터 중 어떤 것을 더 가져올지에 관한 것일 뿐 내가 새로 추가할 수 있는 건 없다. 예를 들어서 아래는 Google Provider 의 전체 user 이다.

```ts
export interface Googleuser extends Record<string, any> {
  aud: string
  azp: string
  email: string
  email_verified: boolean
  exp: number
  family_name: string
  given_name: string
  hd: string
  iat: number
  iss: string
  jti: string
  name: string
  nbf: number
  picture: string
  sub: string
}
```

[공식문서: Using a custom provider](https://next-auth.js.org/configuration/providers/oauth#using-a-custom-provider) 에서도 말하듯, next-auth 는 위 Googleuser 중 몇개만을 취해 아래와 같이 반환한다.

```ts
{
  id: "google",
  name: "Google",
  type: "oauth",
  wellKnown: "https://accounts.google.com/.well-known/openid-configuration",
  authorization: { params: { scope: "openid email user" } },
  idToken: true,
  checks: ["pkce", "state"],
  user(user) {
    return {
      id: user.sub,
      name: user.name,
      email: user.email,
      image: user.picture,
    }
  },
}
```

즉, `user` 옵션은 원본에서 어떤 것을 무슨 이름으로 가져올 것인지를 정하는 것일 뿐 없는 것을 내가 만들어서 추가할 수는 없다.

### callbacks / jwt, session

- jwt callback 은 jwt 가 생성될 떄나 업데이트될 떄, 즉 signin 이나 오랜만에 들어가서 업데이트될 때 작동한다.
- session 은 위 jwt token 을 받은 뒤에 실제 client 에서 받는 session 데이터를 채운다.
- 즉 FE 에서 사용하는 session 의 데이터를 추가하고 싶다면 우선 jwt 콜백 리턴값을 수정한 뒤, 그 값을 또 session 으로 옮겨야 한다.
